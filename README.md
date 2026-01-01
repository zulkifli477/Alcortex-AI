# ALCORTEX AI - v1.2.0 (Clean Architecture)

Aplikasi diagnosis medis presisi berbasis arsitektur sub-direktori.

## 🛠️ Cara Menjalankan di GitHub Codespaces

Proyek ini tidak menjalankan build otomatis di root untuk menghindari error. Ikuti langkah berikut:

### 1. Setup Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Setup Frontend (Buka Terminal Baru)
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment

### Netlify
Proyek sudah dikonfigurasi dengan `netlify.toml`. Cukup hubungkan repositori ke Netlify, dan pastikan:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### API Configuration
Pastikan set `VITE_API_URL` di environment variable Netlify mengarah ke URL backend Anda.

## 🛡️ Struktur
- `/frontend`: React + Vite (UI)
- `/backend`: Node.js + Express (AI Engine)
