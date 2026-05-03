# 🚀 GitHub ga Yuklash - So'nggi Qadam

## 📋 Tayyor Holat

✅ **Local repository tayyor**: Barcha fayllar commit qilingan
✅ **Remote URL sozlandi**: `https://github.com/Komronbek5704/Turizm-agentligi.git`
✅ **Branch nomi**: `main`

## ⚡ Qilishi Kerak Bo'lgan Narsa

### 1️⃣ GitHub.com da Repository Yaratish

1. [https://github.com/Komronbek5704/Turizm-agentligi](https://github.com/Komronbek5704/Turizm-agentligi) ga kiring
2. Agar "404 Not Found" yoki "Repository not found" chiqsa:
   - O'ng yuqori burchakdagi **"+"** tugmasini bosing
   - **"New repository"** tanlang
   - To'ldiring:
     - **Repository name**: `Turizm-agentligi`
     - **Description**: `TourVoyage Enterprise 2.0 - Full-stack Tourism Platform`
     - **Visibility**: Public
   - **"Create repository"** tugmasini bosing

### 2️⃣ Terminalda Push Qilish

Repository yaratilgandan so'ng, terminalda quyidagi buyruqni bajaring:

```bash
git push -u origin main
```

### 3️⃣ Authentication (Agar So'ralsa)

**Username**: `Komronbek5704`  
**Password**: GitHub Personal Access Token

**Token olish uchun**:
1. GitHub.com →右上角头像 → **Settings**
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **"Generate new token"** → **"Generate new token (classic)"**
4. ✅ **repo** (Full control of private repositories)
5. Tokenni nusxalang (faqat bir marta ko'rsatiladi!)

### 4️⃣ Muvaffaqiyatli Yuklanganini Tekshirish

GitHub.com da quyidagi fayllar borligini tekshiring:

#### 📁 Backend Fayllari:
- `server.js` - Asosiy server
- `package.json` - Dependencies va scripts
- `Procfile` - Railway deployment
- `.env.example` - Environment variables
- `config/` - Database, Cloudinary, Email, Payment
- `models/` - User, Tour, Booking, Message, Payment
- `controllers/` - API logikasi
- `routes/` - API marshrutlari
- `middleware/` - Auth va upload
- `validators/` - Joi validatsiya
- `scripts/` - Database initialization

#### 📁 Frontend Fayllari:
- `index.html` - Asosiy sahifa
- `admin-login.html` - Admin kirish
- `admin-dashboard.html` - Admin panel
- `css/` - Bootstrap stilari
- `js/` - JavaScript logikasi

#### 📁 Dokumentatsiya:
- `README.md` - Asosiy hujjat
- `FEATURES.md` - Yangi xususiyatlar
- `DEPLOYMENT-NEW.md` - Deployment qo'llanmasi
- `.gitignore` - Fayllarni chiqarish

## 🎯 Push Buyrug'i

Repository yaratilgandan so'ng, terminalda:

```bash
cd c:/Users/qudra/OneDrive/Desktop/tour-voyage-main
git push -u origin main
```

## 🚀 Keyingi Qadam: Deployment

GitHub ga yuklangandan so'ng:

### Railway (Backend)
```bash
railway login
railway import https://github.com/Komronbek5704/Turizm-agentligi
```

### Vercel (Frontend)
- Vercel.com ga kiring
- "Import Project" → GitHub repository tanlang
- `Komronbek5704/Turizm-agentligi` ni tanlang
- Build settings: Leave default
- "Deploy" tugmasini bosing

---

## 📞 Agar Muammo Bo'lsa

1. **Repository mavjud emas**: GitHub.com da yaratish kerak
2. **Authentication error**: Personal Access Token olish kerak
3. **Permission denied**: Repositoryga access borligini tekshiring
4. **Network error**: Internet bog'lanishini tekshiring

**Muvaffaqiyatli yuklanganidan keyin menga xabar bering!** 🎉
