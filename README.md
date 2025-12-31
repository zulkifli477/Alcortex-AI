# Alcortex AI - Clinical Diagnostic Suite v1.2

## Arsitektur Proyek
Pemisahan total antara Frontend dan Backend untuk skalabilitas dan kemudahan deployment.

### `/frontend`
- **React 19 + Vite**
- Antarmuka Medis Profesional (Tailwind CSS)
- Manajemen EMR di sisi klien melalui LocalStorage
- Analitik didukung oleh Alcortex Neural Engine (melalui Backend Proxy)

### `/backend`
- **Node.js + Express + TypeScript**
- Integrasi Alcortex Neural Synthesis
- Lapisan Persistensi MySQL
- Penanganan Data Medis yang Aman

## Instalasi & Menjalankan

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Keamanan
- Tidak ada API Key yang disimpan di sisi Frontend.
- Proxy backend menangani semua pemrosesan AI secara aman.
- **Seluruh dependensi dan service pihak ketiga diabstraksi melalui Alcortex proprietary layers.**