# Statistik Hidup v3 — PWA

Daily planner, habit tracker, mood & finance tracker dengan multi-user auth.
Black & blue theme. Offline-ready PWA.

---

## Struktur File

```
statistik-hidup/
├── index.html          ← Main app
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline support)
├── css/
│   └── style.css       ← Semua styling (black & blue theme)
├── js/
│   ├── auth.js         ← Login / register / session
│   └── app.js          ← Logic: habits, mood, sleep, finance, health
└── icons/
    ├── icon-192.png    ← PWA icon
    └── icon-512.png    ← PWA icon
```

---

## Cara Deploy

### Option 1: Netlify (Gratis, Paling Mudah)
1. Buka https://app.netlify.com
2. Drag & drop folder `statistik-hidup` ke halaman Netlify
3. Langsung live! Dapat URL gratis + HTTPS otomatis
4. (Opsional) connect ke GitHub buat auto-deploy

### Option 2: Vercel (Gratis)
```bash
npm i -g vercel
cd statistik-hidup
vercel
```

### Option 3: GitHub Pages (Gratis)
1. Buat repo di GitHub
2. Upload semua file
3. Settings → Pages → Deploy from main branch
4. Aktif di `https://username.github.io/repo-name`

### Option 4: VPS / cPanel
Upload semua file ke folder `public_html` atau document root web server.
Tidak butuh backend — semua static HTML/CSS/JS.

---

## Install sebagai PWA

### Android (Chrome)
1. Buka URL app di Chrome
2. Muncul banner "Add to Home Screen" — tap Install
3. Atau: menu ⋮ → "Add to Home Screen"

### iOS (Safari)
1. Buka URL di Safari
2. Tap tombol Share (kotak dengan panah)
3. Scroll ke bawah → "Add to Home Screen"
4. Tap "Add"

---

## Fitur

### Auth & Multi-User
- Register dengan nama, username, email, password
- Login dengan email atau username
- Data tiap user tersimpan terpisah (by user ID)
- Session disimpan di sessionStorage (auto-logout saat tutup browser)
- Password di-hash sebelum disimpan

### Daily Planner
- Prioritas harian dengan checkbox & delete
- Habit tracker dengan streak counter & progress %
- Meals tracker (breakfast/lunch/dinner/snacks)
- Reflection journal dengan mood rating slider

### Mood & Sleep
- Mood picker 5 level dengan grafik 7 hari
- Sleep tracker (jam tidur-bangun, durasi, kualitas bintang)
- Grafik durasi tidur 7 hari

### Health
- Body weight log + BMI calculator
- BMI visual indicator (kurus/normal/overweight/obese)
- Weight trend chart
- Fitness activity log

### Finance
- Income & expense tracking
- Target tabungan dengan progress bar
- Pie chart pengeluaran per kategori
- Budget planner per kategori (dengan alert jika over)
- Tagihan/cicilan tracker (sorted by due date, color-coded urgency)
- Export ke CSV & JSON

### Settings
- Edit & tambah habits custom
- Toggle notifikasi per jenis reminder
- Export semua data
- Reset data user
- Logout

---

## Penyimpanan Data

- **Semua data tersimpan di localStorage browser** — tidak ada server/backend/database
- Data tiap user disimpan dengan key `sh_data_{userId}_main`
- User accounts disimpan di `sh_users`
- Session di `sessionStorage` (hilang saat browser ditutup — desain sengaja untuk keamanan)
- Tidak ada data yang dikirim ke server manapun

---

## Customisasi

### Ganti warna tema
Edit `css/style.css` bagian `:root` — ganti nilai `--blue`, `--blue2`, `--blue3`.

### Tambah habit default
Edit array `DEFAULT_HABITS` di `js/app.js`.

### Ganti nama app
Edit `<title>` di `index.html` dan `"name"` di `manifest.json`.

---

## Tech Stack
- Vanilla HTML / CSS / JavaScript (no framework, no build tool)
- Chart.js untuk grafik
- Tabler Icons untuk icon set
- Space Grotesk + JetBrains Mono fonts
- Service Worker untuk offline PWA
