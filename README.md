# AI Agent SOP dan Regulasi Instansi Pemerintah

Aplikasi web internal terintegrasi untuk membantu pegawai instansi menemukan SOP dan regulasi yang tepat dan masih berlaku, serta membantu Admin Tim mengelola dokumen naskah dinas, memantau pembaruan regulasi kementerian, dan mengevaluasi akurasi jawaban AI Agent.

Dibangun berdasarkan dokumen **PRD dan FRD AI Agent SOP dan Regulasi v2** dengan kepatuhan penuh terhadap prinsip keamanan data pemerintah, RBAC (Role-Based Access Control), dan perlindungan prompt injection.

---

## 🌟 Fitur Utama

1. **Tanya Agent SOP & Regulasi (RAG Berbasis Izin)**:
   - Tanya jawab bahasa Indonesia alami dengan dua mode: **Ringkas** (padat dengan kutipan) dan **Rinci** (tahapan langkah demi langkah, syarat berkas, dan nomor pasal).
   - **Pencegahan Kebocoran RBAC**: Pemeriksaan hak akses dilakukan secara ketat di backend *sebelum* dokumen dikirim ke konteks model AI. Dokumen 'Hanya Tim' milik tim lain tidak pernah dibocorkan judul, jumlah, maupun isinya.
   - **Atribusi Rujukan Sumber**: Setiap klaim administratif dilengkapi kartu sumber dengan judul, nomor, tahun, pasal/bagian, jenis sumber (Drive/JDIH), dan status keberlakuan.
   - **Peringatan Dokumen Usang**: Otomatis mendeteksi dokumen berstatus *Tidak Berlaku* atau *Belum Terverifikasi* dan memberikan rujukan naskah pengganti yang mutakhir.
   - **Umpan Balik Terintegrasi**: Tombol *Membantu*, *Tidak membantu*, dan modal *Laporkan jawaban keliru* yang langsung masuk ke antrean reviu Admin Tim pengampu dokumen.
   - **Fallback JDIH**: Tombol "Cek di JDIH" dan panel tertanam resmi ke portal `https://jdih.komdigi.go.id`.

2. **Knowledge Base & Manajemen Dokumen**:
   - Pencarian komprehensif (judul, kata kunci, nomor, tahun, teks terindeks).
   - Filter multikriteria: Sumber (Drive vs JDIH), Tim Pemilik, Jenis Dokumen (SOP, Permen, SE, Juknis), Status Keberlakuan (Berlaku, Tidak Berlaku, Belum Terverifikasi), Status Indeks (Terindeks, Menunggu, Gagal).
   - **Pemisahan Izin Baca dan Unduh**: Pengguna dapat diizinkan membaca dokumen di AI Agent tanpa memiliki akses mengunduh berkas asli.
   - **Riwayat Versi**: Perubahan tautan Google Drive otomatis mencatat riwayat versi (`DocumentVersion`) tanpa menimpa versi terdahulu.
   - Formulir **Tambah Tautan Google Drive** bagi Admin Tim dan Super Admin.

3. **Dasbor Pembaruan & Evaluasi Admin**:
   - 8 Kartu Statistik Eksekutif (Total Dokumen Terindeks, Regulasi Berubah, SOP Terdampak, Perlu Dievaluasi, Sinkron JDIH, Total Pertanyaan, Belum Terjawab, Pengguna Aktif).
   - Pemantauan regulasi yang dicabut/digantikan dan evaluasi otomatis SOP terdampak.
   - Pembatasan data: Admin Tim hanya melihat data timnya; Super Admin melihat seluruh instansi.

4. **Audit Trail & Keamanan Siber**:
   - Log audit menyeluruh untuk setiap pembuatan/pengubahan dokumen, akses data sensitif, reviu umpan balik, dan **deteksi otomatis serangan prompt injection**.

---

## 🔐 Struktur RBAC Tiga Peran

| Peran | Lingkup Akses | Wewenang Utama |
|---|---|---|
| **Super Admin** | Seluruh Sistem | Membaca semua dokumen, mengelola tim dan pengguna, mengatur konfigurasi sistem, melihat seluruh dasbor dan log audit |
| **Admin Tim** | Tim Sendiri & Terbagi | Menambah dan mengedit metadata dokumen timnya, menambah tautan Google Drive, mengatur visibilitas dan izin unduh, meninjau umpan balik dokumen timnya |
| **User (Pegawai)** | Dokumen yang Diizinkan | Bertanya kepada AI Agent, membaca dokumen publik/terbagi/timnya, mengunduh jika diizinkan, mengirim penilaian dan umpan balik |

---

## 🛠️ Struktur Backend & Arsitektur

```
├── server.ts                  # Server Express full-stack, proxy API Gemini, RBAC filtering, API endpoints
├── src/
│   ├── types/index.ts         # Definisi tipe TypeScript lengkap (User, Document, Version, AuditLog, Feedback)
│   ├── utils/
│   │   ├── rbac.ts            # Logika murni pemeriksaan izin baca, unduh, edit, hapus, dan audit
│   │   ├── rbac.test.ts       # Unit tests mandiri node:test untuk RBAC
│   │   ├── rag-engine.ts      # Mesin penelusuran semantik, deteksi prompt injection, ekstraksi kutipan
│   │   └── rag-engine.test.ts # Unit tests mandiri node:test untuk RAG dan prompt injection
│   ├── data/
│   │   └── mock-data.ts       # Dataset realistis instansi pemerintah (Kemenkomdigi) dengan label DEMO
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigasi responsif berbasis peran pengguna
│   │   ├── Header.tsx         # Baris atas dengan Role Switcher instan dan toggle Dark Mode
│   │   ├── StatusBadge.tsx    # Badge warna standar (Berlaku: Hijau, Tidak Berlaku: Merah, Menunggu: Kuning)
│   │   ├── JDIHPanel.tsx      # Panel penelusuran & fallback situs resmi JDIH Komdigi
│   │   ├── AddDriveDocModal.tsx # Dialog formulir input tautan Google Drive
│   │   └── ReportErrorModal.tsx # Dialog pelaporan kekeliruan jawaban AI
│   ├── pages/
│   │   ├── AgentPage.tsx      # Antarmuka utama Tanya Agent
│   │   ├── KnowledgeBasePage.tsx # Katalog dokumen dengan tabel dan filter lengkap
│   │   ├── DocumentDetailPage.tsx # Halaman detail naskah dan riwayat versi
│   │   ├── DashboardPage.tsx  # Dasbor pembaruan dan SOP terdampak
│   │   ├── FeedbackPage.tsx   # Evaluasi dan tindak lanjut umpan balik pengguna
│   │   ├── UsersTeamsPage.tsx # Manajemen akun pegawai dan unit tim
│   │   └── SettingsPage.tsx   # Pengaturan sinkronisasi JDIH dan parameter keamanan
│   └── App.tsx                # State shell dan router dinamis
```

---

## 🔑 Variabel Lingkungan (`.env`)

Aplikasi menggunakan variabel lingkungan berikut:

```env
# GEMINI_API_KEY: Diperlukan untuk sintesis AI Agent menggunakan Google GenAI SDK (@google/genai).
# Pada Google AI Studio, disuntikkan secara otomatis dari Secret Manager.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: URL tempat aplikasi ini di-host pada Cloud Run / internal instansi.
APP_URL="MY_APP_URL"
```

*Catatan: Jika `GEMINI_API_KEY` belum disetel atau offline, sistem backend secara otomatis beralih ke mesin grounded RAG lokal yang tetap memberikan jawaban akurat berbasis naskah dinas terindeks.*

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Unit Test Logika Murni (Node.js Native Test Runner)**:
   ```bash
   npm test
   ```

2. **Jalankan Aplikasi dalam Mode Pengembang**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Kompilasi dan Bangun Produksi**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Integrasi yang Memerlukan Kredensial Produksi

Saat diintegrasikan penuh ke lingkungan operasional instansi:
1. **Google Drive API**: Memerlukan Akun Layanan (*Service Account*) Google Cloud Platform dengan izin *Domain-Wide Delegation* atau akses *Viewer (Read-Only)* ke folder repositori naskah dinas.
2. **JDIH API / Webhook**: Endpoint sinkronisasi terjadwal dengan otentikasi API Key atau token OAuth instansi sesuai persetujuan Biro Hukum.
3. **SSO Instansi**: Integrasi SAML 2.0 / OIDC menggunakan akun resmi instansi (`@komdigi.go.id` / SSO ASN) untuk validasi login pegawai.
