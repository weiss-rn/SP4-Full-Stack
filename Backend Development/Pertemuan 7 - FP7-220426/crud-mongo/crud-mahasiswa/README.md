# CRUD Mahasiswa dengan Express dan MongoDB

Aplikasi CRUD (Create, Read, Update, Delete) untuk mengelola data mahasiswa menggunakan Express.js dan MongoDB.

## Prasyarat

- Node.js (v14 atau lebih tinggi)
- MongoDB (berjalan di localhost:27017)

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Pastikan MongoDB sudah berjalan di komputer Anda

## Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## Fitur

- **Read**: Melihat semua data mahasiswa
- **Create**: Menambah data mahasiswa baru
- **Update**: Mengubah data mahasiswa yang sudah ada
- **Delete**: Menghapus data mahasiswa

## Struktur Folder

- `/app` - Konfigurasi Express
- `/models` - Mongoose models
- `/controllers` - Logika aplikasi
- `/routes` - Route definitions
- `/view` - Template EJS
- `/public` - File statis (CSS, JS, images)

## Teknologi yang Digunakan

- Express.js - Web framework
- Mongoose - ODM untuk MongoDB
- EJS - Template engine
- Bootstrap - CSS framework

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
