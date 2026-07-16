# AR Pashmina Studio

Website e-commerce untuk toko pashmina viscose. Proyek ini adalah **demo front-end** — seluruh data (produk, akun, keranjang, pesanan) disimpan di `localStorage` browser, tanpa server atau database sungguhan.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Struktur Berkas](#struktur-berkas)
- [Cara Menjalankan](#cara-menjalankan)
- [Alur Penggunaan — Pelanggan](#alur-penggunaan--pelanggan)
- [Alur Penggunaan — Admin](#alur-penggunaan--admin)
- [Kredensial Demo](#kredensial-demo)
- [Menambahkan Foto Produk](#menambahkan-foto-produk)
- [Metode Pembayaran & Status Pesanan](#metode-pembayaran--status-pesanan)
- [Catatan & Batasan Teknis](#catatan--batasan-teknis)
- [Rencana Pengembangan Lanjutan](#rencana-pengembangan-lanjutan)

---

## Fitur Utama

**Untuk Pelanggan**
- Jelajah katalog produk tanpa perlu login, filter berdasarkan kategori (Polos / Motif)
- Tambah ke keranjang bebas tanpa akun — checkout baru mewajibkan login
- Satu pintu masuk login yang menawarkan pilihan **Masuk sebagai Pengguna** atau **Masuk sebagai Admin**, jadi akses admin tidak tampil mencolok di halaman utama
- Pendaftaran & login akun pelanggan, dengan data profil (nama, email, no. WhatsApp) otomatis mengisi formulir checkout
- Nama pengguna yang login tampil di header setiap halaman dan sapaan khusus di beranda
- Pelacakan status pesanan secara langsung (Diterima → Dibayar → Dikirim → Selesai), otomatis tersinkron begitu admin memproses pesanan di tab lain
- Halaman **Pesanan Saya** — riwayat seluruh pesanan milik akun yang login
- Pembayaran **QRIS** dan **Transfer Bank** bisa dikonfirmasi sendiri oleh pembeli (tombol "Saya Sudah Bayar", simulasi tanpa payment gateway sungguhan)
- Alur pembayaran **COD** menyesuaikan kenyataan: status "Dibayar" baru muncul *setelah* status "Dikirim", karena uang baru diterima saat barang sampai

**Untuk Admin**
- Login terpisah dari akun pelanggan
- Dashboard ringkasan toko
- Kelola produk: tambah, ubah, hapus, atur harga/stok/kategori
- Foto produk direferensikan lewat nama file — sistem mengecek langsung apakah file itu benar-benar ada di folder `assets/img/products/` sebelum produk bisa disimpan (mencegah foto rusak/hilang di sisi pelanggan)
- Kelola pesanan: ubah status, urutan opsi status otomatis menyesuaikan metode pembayaran (COD vs non-COD)

---

## Struktur Berkas

```
Hijab-AR-main/
├── index.html              Beranda
├── shop.html                Katalog produk
├── product.html              Detail produk
├── cart.html                 Keranjang belanja
├── login.html                 Masuk / daftar akun pelanggan
├── checkout.html             Formulir checkout (wajib login)
├── order-success.html        Konfirmasi & pelacakan pesanan
├── orders.html                Pesanan Saya (riwayat pesanan pelanggan)
│
├── admin/
│   ├── login.html             Login khusus admin
│   ├── dashboard.html         Ringkasan statistik toko
│   ├── products.html          Kelola produk
│   └── orders.html            Kelola pesanan
│
└── assets/
    ├── css/style.css          Seluruh styling situs
    ├── js/
    │   ├── data.js             Layer data: produk, akun, pesanan, penyimpanan localStorage
    │   ├── ui.js                Perilaku UI bersama (menu akun, toast, dsb — halaman pelanggan)
    │   └── admin.js             Perilaku khusus panel admin
    └── img/products/           Foto produk (taruh foto di sini, lihat bagian di bawah)
```

Semua halaman pelanggan memuat `data.js` lalu `ui.js`. Semua halaman admin memuat `data.js` lalu `admin.js`. `data.js` adalah satu-satunya sumber kebenaran (source of truth) untuk data dan logika bisnis bersama, supaya sisi pelanggan dan admin selalu konsisten.

---

## Cara Menjalankan

Karena tidak ada backend, situs ini bisa langsung dibuka tanpa instalasi apa pun:

**Cara 1 — Buka langsung**
Klik dua kali `index.html`, akan terbuka di browser lewat `file://`.

**Cara 2 — Server lokal (disarankan)**
Beberapa fitur (terutama pengecekan foto produk di Admin Panel) bekerja lebih konsisten lewat server lokal:

```bash
# Python
python3 -m http.server 8000

# atau Node.js
npx serve .
```

Lalu buka `http://localhost:8000`.

---

## Alur Penggunaan — Pelanggan

1. Buka beranda, jelajahi produk, tambahkan ke keranjang — semua tanpa perlu akun.
2. Tekan **Lanjut ke Checkout** → jika belum login, diarahkan ke halaman Masuk/Daftar.
3. Daftar akun baru atau login. Setelah berhasil, otomatis kembali ke checkout dengan isi keranjang tetap utuh dan formulir sudah terisi dari profil akun.
4. Lengkapi alamat pengiriman, pilih metode pembayaran, lalu buat pesanan.
5. Di halaman konfirmasi:
   - **QRIS / Transfer** → tersedia tombol untuk mengonfirmasi pembayaran sendiri.
   - **COD** → cukup tunggu, status akan diperbarui oleh admin.
6. Pantau status pesanan kapan saja lewat halaman **Pesanan Saya**.

## Alur Penggunaan — Admin

1. Buka `admin/login.html`, masuk dengan kredensial admin (lihat di bawah).
2. **Kelola Produk** — tambah/ubah produk. Untuk memasang foto: unggah dulu file fotonya ke folder `assets/img/products/`, baru ketik nama filenya di formulir.
3. **Kelola Pesanan** — ubah status pesanan. Untuk pesanan COD, urutan yang benar: tandai **Dikirim** dulu, baru **Dibayar (COD)** setelah kurir mengonfirmasi uang diterima.

---

## Kredensial Demo

```
Admin Panel
Username : admin
Password : ar12345
```

Akun pelanggan tidak memiliki kredensial bawaan — silakan daftar akun baru lewat halaman Masuk/Daftar.

---

## Menambahkan Foto Produk

Sistem foto produk dirancang agar **tidak pernah menampilkan gambar rusak** ke pembeli:

1. Taruh file foto ke folder `assets/img/products/` di dalam berkas situs.
2. Di Admin Panel → Kelola Produk → tambah/edit produk, ketik **nama file**-nya saja (tanpa folder), misalnya `pashmina-navy-storm.jpg`.
3. Sistem langsung mengecek apakah file itu benar-benar ada:
   - ✓ **Ditemukan** → foto muncul di pratinjau, produk bisa disimpan.
   - ✕ **Belum ditemukan** → produk **tidak bisa disimpan** dengan foto ini, dan sistem menampilkan alamat lengkap yang dicoba dibuka supaya mudah dicek letak selisihnya (nama file, ekstensi, besar/kecil huruf, atau folder yang salah).
4. Kalau field foto dikosongkan, produk otomatis memakai blok warna bermotif sebagai gambar cadangan — tidak akan ada ikon gambar patah yang terlihat pembeli.

---

## Metode Pembayaran & Status Pesanan

| Metode | Kapan pembayaran terjadi | Siapa yang mengonfirmasi |
|---|---|---|
| QRIS | Sebelum pengiriman | Pembeli sendiri (tombol "Saya Sudah Bayar") |
| Transfer Bank | Sebelum pengiriman | Pembeli sendiri (tombol "Saya Sudah Transfer") |
| COD (Bayar di Tempat) | Setelah paket diterima | Admin (menandai manual di Kelola Pesanan) |

Karena itu, urutan tahapan pelacakan berbeda tergantung metode:

- **QRIS / Transfer:** Diterima → Dibayar → Dikirim → Selesai
- **COD:** Diterima → Dikirim → Dibayar (COD) → Selesai

---

## Catatan & Batasan Teknis

- **Tanpa backend sungguhan.** Semua data tersimpan di `localStorage` browser. Data tidak lintas perangkat/browser, dan bisa hilang jika cache dibersihkan.
- **Pembayaran bersifat simulasi.** Tidak ada payment gateway sungguhan; tombol konfirmasi pembayaran hanya mengubah status di localStorage.
- **Sinkronisasi status pesanan** antara sisi admin dan pelanggan bekerja **antar-tab di browser yang sama** (memakai `storage` event bawaan browser), bukan lintas perangkat berbeda.
- **Foto produk** wajib berupa file yang benar-benar ada di folder `assets/img/products/` — tidak mendukung unggah langsung dari form (by design, lihat bagian [Menambahkan Foto Produk](#menambahkan-foto-produk)).
- Password akun pelanggan maupun admin disimpan **tanpa enkripsi** di localStorage — cukup aman untuk demo, tapi **jangan dipakai untuk data sungguhan**.

---

<div align="center">

AR Pashmina Studio — proyek demo e-commerce.

</div>
