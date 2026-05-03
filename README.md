# TourVoyage 2.0 - Enterprise Turizm Platformasi

TourVoyage - bu Node.js + PostgreSQL asosida yaratilgan zamonaviy full-stack turizm agentligi platformasi. Foydalanuvchilarga tur paketlarini ko'rish, bron qilish, to'lov qilish va boshqarish imkoniyatlarini taqdim etadi. Platformada kuchli admin paneli, rasm yuklash tizimi, email bildirishnomalar va Payme/Click to'lov integratsiyasi mavjud.

## 🌟 Xususiyatlar

### 🏠 Asosiy sahifa (index.html)
- **Zamonaviy dizayn**: Bootstrap 5 va Font Awesome orqali chiroyli interfeys
- **Tur paketlari ko'rish**: Turli mamlakatlarga sayohat paketlari
- **Ob-havo ma'lumotlari**: Mashhur sayohat yo'nalishlaridagi hozirgi ob-havo
- **Foydalanuvchi tizimi**: Ro'yxatdan o'tish, kirish, profil boshqaruvi
- **Bron qilish tizimi**: Tur paketlarini onlayn bron qilish
- **Chat tizimi**: Admin bilan jonli suhbat qilish imkoniyati
- **AI Assistant**: Avtomatik yordamchi bot
- **Bildirishnomalar**: Tizim xabarlari va yangiliklar
- **Ko'p tilli qo'llab-quvvatlash**: O'zbekcha va boshqa tillar
- **Responsive dizayn**: Barcha qurilmalarda ishlaydi

### 🛠️ Admin paneli (admin-dashboard.html)
- **Dashboard**: Statistik ma'lumotlar va grafiklar
- **Xabarlar boshqaruvi**: Foydalanuvchilardan kelgan xabarlar
- **Bron qilishlar boshqaruvi**: Barcha bronlarni ko'rish va boshqarish
- **Tur paketlari boshqaruvi**: Yangi tur qo'shish, tahrirlash, o'chirish
- **Foydalanuvchilar boshqaruvi**: Ro'yxatdan o'tgan barcha foydalanuvchilarni boshqarish
- **Chat boshqaruvi**: Foydalanuvchilar bilan suhbatlarni boshqarish
- **Hisobotlar**: Statistik hisobotlar va grafiklar
- **Bildirishnomalar**: Tizim bildirishnomalarini boshqarish

### 🆕 Version 2.0 Yangi Xususiyatlar

#### 🛡️ Xavfsizlik va Validatsiya
- **Joi Validatsiyasi**: Barcha API endpointlar uchun qattiq input validatsiyasi
- **Email tekshiruvi**: `user@domain.com` formati majburiy
- **Parol kompleksligi**: Kamida 6 ta belgi, 1 ta katta harf, 1 ta kichik harf, 1 ta raqam
- **Telefon format**: `+998901234567` formati tekshiruvi
- **Xavfsizlik**: JWT token imzosi, Rate limiting, XSS himoyasi

#### 📸 Cloudinary Rasm Yuklash
- **Multiple rasm yuklash**: Bir vaqtda 5 tagacha rasm
- **Fayl hajmi**: Maksimum 5MB
- **Formatlar**: JPG, JPEG, PNG, GIF, WEBP
- **Optimizatsiya**: Avtomatik 1200x800 piksel, avtomatik sifat
- **Cloud storage**: Cloudinary CDN orqali tezkor yuklash

#### 💳 To'lov Tizimi (Payme/Click)
- **Payme integratsiyasi**: O'zbekistonning yetakchi to'lov tizimi
- **Click integratsiyasi**: Qulay va tezkor to'lov
- **Callbacklar**: To'lov holatini avtomatik yangilash
- **Xavfsizlik**: Imzo tekshiruvi va shifrlash
- **Admin panel**: To'lov statistikasi va boshqaruv

#### 📧 Email Bildirishnomalar (Nodemailer)
- **Welcome Email**: Ro'yxatdan o'tganda avtomatik xabar
- **Booking Confirmation**: Bron tasdiqlanganda xabar
- **Payment Confirmation**: To'lov muvaffaqiyatli bo'lganda xabar
- **Admin Notifications**: Yangi bron va to'lov haqida xabarlar
- **HTML Templates**: Professional va responsive dizayn

## 📁 Loyiha tuzilishi

```
tour-voyage-main/
├── index.html              # Asosiy sahifa
├── admin-login.html        # Admin kirish sahifasi
├── admin-dashboard.html    # Admin paneli
├── server.js               # Node.js server
├── package.json            # Dependencies va scripts
├── Procfile               # Railway deployment
├── .env.example           # Environment variables namunasi
├── css/
│   ├── main.css           # Asosiy sahifa stilari
│   └── admin-dashboard.css # Admin paneli stilari
├── js/
│   ├── api.js             # API integratsiyasi
│   ├── main-new.js        # Asosiy sahifa (yangi)
│   ├── admin-dashboard-new.js # Admin panel (yangi)
│   ├── main.js            # Eski versiya
│   └── admin-dashboard.js # Eski versiya
├── config/
│   ├── database.js       # Database konfiguratsiyasi
│   ├── cloudinary.js      # Cloudinary integratsiyasi
│   ├── payment.js         # To'lov tizimi
│   └── email.js           # Email bildirishnomalar
├── models/                # Data modellari
│   ├── User.js
│   ├── Tour.js
│   ├── Booking.js
│   ├── Message.js
│   ├── ChatMessage.js
│   └── Payment.js
├── controllers/           # API kontrollerlari
│   ├── authController.js
│   ├── tourController.js
│   ├── bookingController.js
│   ├── messageController.js
│   ├── chatController.js
│   ├── uploadController.js
│   └── paymentController.js
├── routes/                # API marshrutlari
│   ├── auth.js
│   ├── tours.js
│   ├── bookings.js
│   ├── messages.js
│   ├── chat.js
│   ├── upload.js
│   └── payment.js
├── middleware/            # Middleware
│   ├── auth.js
│   └── upload.js
├── validators/            # Joi validatsiya
│   └── validationSchemas.js
├── scripts/
│   ├── init-db.js        # Database initialization
│   └── deploy.sh         # Deployment skripti
└── docs/
    ├── README.md
    ├── FEATURES.md
    ├── DEPLOYMENT-NEW.md
    └── .gitignore
```

## 🚀 Texnologiyalar

### Frontend
- **HTML5**: Zamonaviy standartlar
- **CSS3**: Bootstrap 5 framework
- **JavaScript**: ES6+ xususiyatlari
- **Font Awesome**: Ikonlar
- **Chart.js**: Grafiklar va diagrammalar
- **jsPDF**: PDF hujjatlar yaratish

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **PostgreSQL**: Relatsionel database
- **JWT**: Autentifikatsiya
- **Joi**: Input validatsiyasi
- **Multer**: Fayl yuklash
- **Nodemailer**: Email yuborish

### Third-party Services
- **Cloudinary**: Rasm yuklash va CDN
- **Payme**: To'lov tizimi
- **Click**: To'lov tizimi
- **Gmail SMTP**: Email xizmati
- **LocalStorage**: Ma'lumotlarni saqlash

## 📋 Asosiy funktsiyalar

### Foydalanuvchi uchun:
1. **Ro'yxatdan o'tish va kirish**: Email va parol orqali tizimga kirish
2. **Tur paketlarini ko'rish**: Barcha mavjud tur paketlari bilan tanishish
3. **Bron qilish**: Tanlangan tur paketini bron qilish
4. **Profil boshqaruvi**: Shaxsiy ma'lumotlarni tahrirlash
5. **Mening bronlarim**: Bron qilingan turlarni ko'rish
6. **Admin bilan chat**: To'g'ridan-to'g'ri suhbat qilish
7. **AI Assistant**: Avtomatik yordam olish

### Admin uchun:
1. **Dashboard**: Umumiy statistika va grafiklar
2. **Tur paketlari boshqaruvi**: CRUD operatsiyalari
3. **Foydalanuvchilar boshqaruvi**: Barcha foydalanuvchilarni ko'rish
4. **Xabarlar boshqaruvi**: Kontakt xabarlarini ko'rish
5. **Bron qilishlar boshqaruvi**: Barcha bronlarni boshqarish
6. **Chat boshqaruvi**: Foydalanuvchilar bilan suhbatlarni boshqarish
7. **Hisobotlar**: Statistik ma'lumotlar va tahlillar

## 🔧 O'rnatish va ishga tushirish

1. **Loyihani klonlash**:
   ```bash
   git clone [repository-url]
   cd tour-voyage-main
   ```

2. **Lokal serverda ishga tushirish**:
   - Har qanday veb-serverni ishga tushiring (masalan, Live Server VSCode extension)
   - Yoki Python server:
     ```bash
     python -m http.server 8000
     ```

3. **Ochish**:
   - Asosiy sahifa: `http://localhost:8000/index.html`
   - Admin paneli: `http://localhost:8000/admin-login.html`

## 🔐 Admin kirish ma'lumotlari

- **Login**: `admin`
- **Parol**: `admin123`

## 📱 Brauzer qo'llab-quvvatlash

- Chrome (tavsiya etiladi)
- Firefox
- Safari
- Edge

## 🎯 Asosiy imkoniyatlar

### 🌍 Tur paketlari
- Yevropa, Osiyo, Amerika tur paketlari
- Narx, davomiyligi, tavsif ma'lumotlari
- Rasm va batafsil ma'lumotlar

### 🌤️ Ob-havo integratsiyasi
- Mashhur shaharlardagi ob-havo ma'lumotlari
- Real-time yangilanishlar

### 💬 Chat tizimi
- Real-time suhbatlar
- Admin va foydalanuvchi o'rtasida
- Xabarlar tarixi

### 📊 Statistika va hisobotlar
- Oylik bronlar statistikasi
- Daromad grafiklari
- Tur populyarligi tahlili

## 🔮 Kelajakdagi imkoniyatlar

- To'lov tizimlari integratsiyasi
- Ko'proq tillar qo'llab-quvvatlash
- Mobil ilova
- Email bildirishnomalari
- Ko'proq ob-havo manbalari

## 👮‍♂️ Xavfsizlik

- LocalStorage orqali ma'lumotlarni saqlash
- Admin paneli himoyasi
- Input validatsiyasi
- XSS himoyasi

## 📞 Aloqa

- **Loyiha muallifi**: Komron Qudratov
- **Email**: qudratovkomron2004@gmail.com
- **Telefon**: +998 50 503 57 04
- **Manzil**: Samarqand shahri, O'zbekiston

## 📄 Litsenziya

Bu loyiha ochiq kodli bo'lib, MIT litsenziyasi ostida tarqatiladi.

---

**TourVoyage** - Sizning ishonchli sayohat hamkoringiz! 🌍✈️
