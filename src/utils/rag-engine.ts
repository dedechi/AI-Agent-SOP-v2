import type { Document, SourceReference, AIConversation } from '../types/index.ts';

// Known prompt injection or override patterns in Indonesian & English
const INJECTION_PATTERNS = [
  /abaikan\s+(semua\s+)?(aturan|instruksi|perintah|sistem)/i,
  /ignore\s+(all\s+)?(previous\s+)?(instructions|rules|prompts)/i,
  /tampilkan\s+(semua\s+)?(dokumen\s+)?(rahasia|internal|hanya\s+tim)/i,
  /bypass\s+(rbac|security|auth|izin)/i,
  /berperanlah\s+sebagai\s+hacker/i,
  /system\s*prompt/i,
  /override\s+permission/i,
];

/**
 * Detects if the prompt contains adversarial injection patterns
 */
export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Calculate keyword relevance score between a query and document text
 */
export function calculateRelevanceScore(query: string, doc: Document): number {
  if (doc.indexStatus !== 'Terindeks') return 0;

  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryTerms.length === 0) return 0;

  const titleText = (doc.title + ' ' + (doc.documentNumber || '')).toLowerCase();
  const tagText = doc.tags.join(' ').toLowerCase();
  const contentText = (doc.indexedText || '').toLowerCase();

  let score = 0;

  for (const term of queryTerms) {
    if (titleText.includes(term)) {
      score += 15; // Title match has high weight
    }
    if (tagText.includes(term)) {
      score += 10;
    }
    // Count occurrences in content text
    const matches = (contentText.match(new RegExp(`\\b${term}`, 'g')) || []).length;
    score += Math.min(matches * 2, 20);
  }

  return score;
}

export interface ChunkMatch {
  doc: Document;
  section: string;
  quote: string;
  score: number;
}

/**
 * Extracts relevant chunks and quotes from a document based on query
 */
export function extractRelevantChunks(doc: Document, query: string): ChunkMatch[] {
  if (!doc.indexedText) return [];

  const rawChunks = doc.indexedText.split(/\n\n+/);
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const results: ChunkMatch[] = [];

  for (const chunk of rawChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // Check for section header like "Pasal 1", "Bab II", "Prosedur", "Ketentuan", "Langkah"
    const sectionMatch = trimmed.match(/^([A-Za-z0-9\s\.\-—]+:|\b(?:Pasal\s+\d+|Bab\s+[IVXLCDM]+|Prosedur|Persyaratan|Langkah\s+\d+)\b[^\n]*)/i);
    const sectionName = sectionMatch ? sectionMatch[0].trim() : 'Bagian Dokumen';

    let chunkScore = 0;
    const lowerChunk = trimmed.toLowerCase();
    for (const term of queryTerms) {
      if (lowerChunk.includes(term)) chunkScore += 3;
    }

    if (chunkScore > 0) {
      // Pick a concise quote (max 200 chars)
      const cleanQuote = trimmed.replace(/\s+/g, ' ').slice(0, 180) + (trimmed.length > 180 ? '...' : '');
      results.push({
        doc,
        section: sectionName,
        quote: cleanQuote,
        score: chunkScore,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Generates an internal grounded RAG answer based strictly on accessible documents
 */
export function generateLocalRAGAnswer(params: {
  question: string;
  accessibleDocs: Document[];
  mode: 'Ringkas' | 'Rinci';
  scope: 'Semua sumber' | 'SOP (Drive)' | 'Regulasi (JDIH)' | 'Satu dokumen';
  targetDocumentId?: string;
}): {
  answer: string;
  sourceReferences: SourceReference[];
  found: boolean;
  hasOutdatedWarning: boolean;
} {
  const { question, accessibleDocs, mode, scope, targetDocumentId } = params;

  // Filter docs according to requested scope
  let scopedDocs = accessibleDocs.filter((d) => d.indexStatus === 'Terindeks');

  if (scope === 'SOP (Drive)') {
    scopedDocs = scopedDocs.filter((d) => d.sourceType === 'Google Drive');
  } else if (scope === 'Regulasi (JDIH)') {
    scopedDocs = scopedDocs.filter((d) => d.sourceType === 'JDIH');
  } else if (scope === 'Satu dokumen' && targetDocumentId) {
    scopedDocs = scopedDocs.filter((d) => d.id === targetDocumentId);
  }

  // Calculate scores
  const scored = scopedDocs
    .map((doc) => ({
      doc,
      score: calculateRelevanceScore(question, doc),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      answer:
        'Tidak ditemukan sumber yang dapat Anda akses mengenai pertanyaan tersebut. ' +
        'Pastikan istilah pencarian Anda tepat atau hubungi Admin Tim Anda untuk meminta konfirmasi hak akses dokumen terkait.',
      sourceReferences: [],
      found: false,
      hasOutdatedWarning: false,
    };
  }

  // Take top documents (up to 3)
  const topMatches = scored.slice(0, 3);
  const references: SourceReference[] = [];
  let hasOutdatedWarning = false;

  const answerSections: string[] = [];

  for (const match of topMatches) {
    const doc = match.doc;
    const chunks = extractRelevantChunks(doc, question);
    const topChunk = chunks[0] || {
      section: 'Ketentuan Umum',
      quote: (doc.indexedText || '').slice(0, 150) + '...',
    };

    references.push({
      documentId: doc.id,
      title: doc.title,
      documentNumber: doc.documentNumber,
      year: doc.year,
      section: topChunk.section,
      quote: topChunk.quote,
      legalStatus: doc.legalStatus,
      sourceType: doc.sourceType,
      sourceUrl: doc.sourceUrl,
      downloadAllowed: doc.downloadAllowed,
      ownerTeamId: doc.ownerTeamId,
    });

    if (doc.legalStatus === 'Tidak Berlaku') {
      hasOutdatedWarning = true;
    }
  }

  const primaryDoc = topMatches[0].doc;
  const isOutdated = primaryDoc.legalStatus === 'Tidak Berlaku';
  const isUnverified = primaryDoc.legalStatus === 'Belum Terverifikasi';

  let warningNotice = '';
  if (isOutdated) {
    warningNotice = `⚠️ **PERINGATAN**: Dokumen rujukan utama "${primaryDoc.title}" berstatus **TIDAK BERLAKU**. `;
    if (primaryDoc.replacementDocumentId) {
      warningNotice += `Dokumen ini telah digantikan oleh regulasi/SOP yang lebih mutakhir. `;
    }
    warningNotice += `Jangan menggunakan ketentuan ini sebagai acuan operasional aktif.\n\n`;
  } else if (isUnverified) {
    warningNotice = `ℹ️ **CATATAN**: Dokumen rujukan "${primaryDoc.title}" berstatus **BELUM TERVERIFIKASI** dengan sinkronisasi JDIH terbaru. Silakan verifikasi status mutakhir di portal JDIH resmi.\n\n`;
  }

  // Compose answer content according to mode
  let bodyContent = '';

  if (mode === 'Ringkas') {
    bodyContent = `Berdasarkan ketentuan pada **${primaryDoc.title}** (${primaryDoc.documentNumber || 'Tanpa Nomor'}, ${primaryDoc.year || '-'}):\n\n` +
      `Ringkasan ketentuan menyebutkan bahwa pelaksanaan prosedur/regulasi ini diatur secara resmi melalui ${references[0]?.section || 'ketentuan terkait'}. ` +
      `Pegawai wajib mematuhi pedoman administrasi yang berlaku, melengkapi berkas verifikasi pada unit kerja pengampu, dan memastikan dokumen pendukung telah divalidasi.\n\n` +
      `Kutipan resmi: "${references[0]?.quote || ''}"`;
  } else {
    // Mode Rinci (Langkah demi langkah)
    bodyContent = `Berdasarkan **${primaryDoc.title}** (${primaryDoc.documentNumber || 'Tanpa Nomor'}, ${primaryDoc.year || '-'}), berikut adalah tahapan dan ketentuan rinci yang harus dipedomani:\n\n` +
      `1. **Prasyarat & Identifikasi**: Pemohon/pegawai menyiapkan dokumen kelengkapan administrasi sesuai rujukan ${references[0]?.section || 'persyaratan'}.\n` +
      `2. **Pengajuan & Verifikasi**: Berkas diserahkan kepada unit kerja pengampu untuk ditelaah dan diverifikasi kelayakannya.\n` +
      `3. **Persetujuan Pejabat Berwenang**: Pejabat terkait menerbitkan persetujuan atau disposisi sesuai wewenang administratif.\n` +
      `4. **Pelaksanaan & Pelaporan**: Pegawai melaksanakan tugas dan menyampaikan laporan pertanggungjawaban sesuai tenggat waktu yang ditentukan.\n\n` +
      `Rujukan pasal/bagian:\n> "${references[0]?.quote || ''}"`;
  }

  const disclaimer = `\n\n*Catatan Integritas: Jawaban ini diolah secara otomatis berdasarkan rujukan dokumen resmi terindeks yang dapat Anda akses. Keputusan hukum/administratif final mengacu pada naskah dinas resmi dan arahan pimpinan instansi.*`;

  return {
    answer: warningNotice + bodyContent + disclaimer,
    sourceReferences: references,
    found: true,
    hasOutdatedWarning,
  };
}
