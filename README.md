## Local development

1. Install dependency:
   `npm install`
2. Copy env:
   `Copy-Item .env.example .env`
3. Isi minimal:
   `SUPABASE_URL`
   `SUPABASE_KEY`
   `GEMINI_API_KEY`
4. Jalankan app:
   `npm run dev`

App lokal berjalan lewat Express + Vite pada port `3000`.

## Deploy ke Vercel

Project ini sudah disiapkan untuk pola:

- Frontend Vue/Vite dibuild ke `dist`
- Backend Express dijalankan sebagai Vercel Function melalui `api/index.ts`
- SPA routing diarahkan lewat `vercel.json`

### Environment variables yang perlu diisi di Vercel

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL` opsional
- `GEMINI_VISION_MODEL` opsional

### Langkah deploy

1. Push repo ini ke GitHub/GitLab/Bitbucket.
2. Import project ke Vercel.
3. Pastikan build settings membaca:
   `Build Command`: `npm run build`
   `Output Directory`: `dist`
4. Isi semua Environment Variables di dashboard Vercel.
5. Deploy.

### Catatan

- Secret Gemini tidak lagi diexpose ke frontend saat build.
- Semua request frontend tetap memakai path relatif `/api/...`, jadi tidak perlu ubah base URL saat production.
