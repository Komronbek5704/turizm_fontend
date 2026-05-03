# GitHub Repository Setup Guide

## 🚀 GitHub Repository Yaratish

### 1. GitHub.com da Repository Yaratish

1. [GitHub.com](https://github.com) ga kiring
2. O'ng yuqori burchakdagi "+" tugmasini bosing
3. "New repository" tanlang
4. Quyidagilarni to'ldiring:
   - **Repository name**: `tour-voyage`
   - **Description**: `TourVoyage Enterprise 2.0 - Full-stack Tourism Platform`
   - **Visibility**: Public (yoki Private)
   - **Add a README file**: ❌ (bizda allaqachon bor)
   - **Add .gitignore**: ❌ (bizda allaqachon bor)
   - **Choose a license**: MIT (yoki boshqa)

5. "Create repository" tugmasini bosing

### 2. Repository URL ni Olish

Repository yaratgandan so'ng, sizga quyidagi ko'rsatmalar chiqadi:

```bash
git remote add origin https://github.com/qudratovkomron/tour-voyage.git
git branch -M main
git push -u origin main
```

### 3. Local Repository ni GitHub ga Push Qilish

Terminalda quyidagi buyruqlarni bajaring:

```bash
# 1. Remote qo'shish (agar qo'shilmagan bo'lsa)
git remote add origin https://github.com/qudratovkomron/tour-voyage.git

# 2. Main branch nomini tekshirish
git branch -M main

# 3. GitHub ga push qilish
git push -u origin main
```

### 4. Agar Authentication Error Chiqsa

Agar "authentication failed" xatosi chiqsa:

1. **Personal Access Token (PAT) yarating:**
   - GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token" → "Generate new token (classic)"
   - Quyidagi permissions ni tanlang:
     - ✅ repo (Full control of private repositories)
     - ✅ workflow (Update GitHub Action workflows)
   - Tokenni nusxalab saqlang

2. **Token orqali login qiling:**
   ```bash
   git config --global credential.helper store
   git push -u origin main
   # Username: qudratovkomron
   # Password: (shu yerga PAT tokeningizni kiriting)
   ```

### 5. Repository Muvaffaqiyatli Yuklanganini Tekshirish

GitHub.com da `qudratovkomron/tour-voyage` repository oching va quyidagi fayllar borligini tekshiring:

#### Backend Fayllari:
- ✅ `server.js`
- ✅ `package.json`
- ✅ `Procfile`
- ✅ `.env.example`
- ✅ `config/` papkasi
- ✅ `models/` papkasi
- ✅ `controllers/` papkasi
- ✅ `routes/` papkasi
- ✅ `middleware/` papkasi
- ✅ `validators/` papkasi
- ✅ `scripts/` papkasi

#### Frontend Fayllari:
- ✅ `index.html`
- ✅ `admin-login.html`
- ✅ `admin-dashboard.html`
- ✅ `css/` papkasi
- ✅ `js/` papkasi

#### Dokumentatsiya:
- ✅ `README.md`
- ✅ `FEATURES.md`
- ✅ `DEPLOYMENT-NEW.md`
- ✅ `.gitignore`

## 🚀 Keyingi Qadam: Deployment

GitHub ga yuklagandan so'ng, quyidagi platformalarda deployment qilishingiz mumkin:

### Railway (Backend)
```bash
railway login
railway import https://github.com/qudratovkomron/tour-voyage
# Yoki:
railway init
railway up
```

### Vercel (Frontend)
```bash
vercel import https://github.com/qudratovkomron/tour-voyage
# Yoki Vercel.com da repository ni import qiling
```

## 🔧 Troubleshooting

### Agar "Remote already exists" xatosi chiqsa:
```bash
git remote remove origin
git remote add origin https://github.com/qudratovkomron/tour-voyage.git
```

### Agar "Permission denied" xatosi chiqsa:
1. SSH kalit yarating: `ssh-keygen -t rsa -b 4096 -C "your.email@example.com"`
2. SSH kalitni GitHub ga qo'shing
3. HTTPS o'rniga SSH ishlating:
   ```bash
   git remote set-url origin git@github.com:qudratovkomron/tour-voyage.git
   ```

### Agar "Branch doesn't exist" xatosi chiqsa:
```bash
git branch -M main
git push -u origin main
```

---

📞 **Qo'shimcha yordam**: Agar muammo yuzaga kelsa, GitHub repository linkini yuboring va sizga yordam beraman!
