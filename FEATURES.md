# Yangi Xususiyatlar - TourVoyage 2.0

## 🛡️ Xavfsizlik va Validatsiya

### Joi Validatsiyasi
- **Barcha API endpointlar** uchun qattiq validatsiya
- **Email format tekshiruvi**: `user@domain.com` formati talab qilinadi
- **Parol kompleksligi**: Kamida 6 ta belgi, 1 ta katta harf, 1 ta kichik harf, 1 ta raqam
- **Telefon raqam**: `+998901234567` formati
- **Tur nomi**: 5-200 ta harf, bo'sh bo'lmasligi
- **Narx**: Musbat son, 2 xona aniqlikda
- **Xabar matni**: 10-2000 ta harf

### Xavfsizlik Choralari
- **JWT token** imzo tekshiruvi
- **Rate limiting**: 15 daqiqada 100 ta so'rov
- **Helmet middleware**: HTTP xavfsizlik sozlamalari
- **Input sanitization**: SQL injection va XSS himoyasi

## 📸 Cloudinary Rasm Yuklash Tizimi

### Xususiyatlari
- **Multiple rasm yuklash**: Bir vaqtda 5 tagacha rasm
- **Fayl hajmi**: Maksimum 5MB
- **Ruxsat etilgan formatlar**: JPG, JPEG, PNG, GIF, WEBP
- **Avtomatik optimallashtirish**: 1200x800 piksel, auto:good quality
- **Cloud storage**: Cloudinary cloud saqlash
- **URL generatsiya**: Optimallashtirilgan rasm URLlari

### API Endpointlar
```
POST /api/upload/single          - Bitta rasm yuklash (admin)
POST /api/upload/multiple        - Ko'plab rasmlar yuklash (admin)
POST /api/upload/tour-image      - Tur rasmi yuklash (admin)
DELETE /api/upload/delete         - Rasm o'chirish (admin)
GET /api/upload/images           - Rasmlarni olish (admin)
```

### Frontend Integratsiyasi
```javascript
// Rasm yuklash
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/upload/tour-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 💳 To'lov Tizimi (Payme/Click)

### Payme Integratsiyasi
- **Merchant ID**: Payme tomonidan beriladi
- **Imzo tekshiruvi**: MD5 hash orqali xavfsizlik
- **Callback URL**: To'lov holati uchun
- **To'lov holatlari**: pending → completed/cancelled

### Click Integratsiyasi
- **Service ID**: Click tomonidan beriladi
- **URL parametrlar**: service_id, merchant_id, amount, transaction_param
- **Callback tekshiruvi**: Timestamp va secret key orqali

### API Endpointlar
```
POST /api/payments                 - To'lov yaratish
GET /api/payments/:id            - To'lov holati
GET /api/payments/my/payments    - Foydalanuvchi to'lovlari
GET /api/payments/all            - Barcha to'lovlar (admin)
POST /api/payments/payme/callback - Payme callback
POST /api/payments/click/callback - Click callback
GET /api/payments/stats          - To'lov statistikasi (admin)
```

### Frontend To'lov Jarayoni
```javascript
// To'lov yaratish
const payment = await api.payments.create({
  booking_id: bookingId,
  payment_method: 'payme', // 'payme' yoki 'click'
  amount: totalPrice
});

// To'lov sahifasiga yo'naltirish
window.location.href = payment.payment_url;
```

## 📧 Email Bildirishnomalar (Nodemailer)

### Email Tiplari
- **Welcome Email**: Ro'yxatdan o'tganda
- **Booking Confirmation**: Bron tasdiqlanganda
- **Payment Confirmation**: To'lov muvaffaqiyatli bo'lganda
- **New Booking Notification**: Admin uchun yangi bron xabari

### Email Konfiguratsiyasi
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Gmail App Password
EMAIL_FROM=noreply@tourvoyage.com
```

### HTML Email Templates
- **Responsive dizayn**: Barcha qurilmalarda ishlaydi
- **Professional ko'rinish**: TourVoyage brendingi
- **O'zbek tilida**: Foydalanuvchilar uchun
- **Tafsilotli ma'lumot**: Bron va to'lov ma'lumotlari

## 🔧 Konfiguratsiya Qo'llanmasi

### 1. Cloudinary Sozlash
1. [Cloudinary.com](https://cloudinary.com) ga ro'yxatdan o'ting
2. Dashboarddan Cloud Name, API Key, API Secret oling
3. `.env` fayliga qo'shing:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 2. Email Sozlash (Gmail)
1. Gmail hisobingizda 2-factor authentication yoqing
2. Google Account → Security → App passwords
3. Yangi app password yarating
4. `.env` fayliga qo'shing:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

### 3. Payme Integratsiyasi
1. [Payme.uz](https://payme.uz) da merchant account oching
2. Merchant ID va kalit oling
3. Callback URL sozlang: `https://sizning-domeningiz.com/api/payments/payme/callback`
4. `.env` fayliga qo'shing:
   ```env
   PAYME_MERCHANT_ID=your_merchant_id
   PAYME_KEY=your_payme_key
   ```

### 4. Click Integratsiyasi
1. [Click.uz](https://click.uz) da merchant account oching
2. Service ID, User ID, Secret Key oling
3. Callback URL sozlang: `https://sizning-domeningiz.com/api/payments/click/callback`
4. `.env` fayliga qo'shing:
   ```env
   CLICK_MERCHANT_ID=your_merchant_id
   CLICK_SERVICE_ID=your_service_id
   CLICK_USER_ID=your_user_id
   CLICK_SECRET_KEY=your_secret_key
   ```

## 🚀 Deployment Tayyorligi

### Railway Environment Variables
```bash
# Asosiy
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tour-voyage.railway.app

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your_long_random_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@tourvoyage.com

# To'lov
PAYME_MERCHANT_ID=your_merchant_id
PAYME_KEY=your_payme_key
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_USER_ID=your_user_id
CLICK_SECRET_KEY=your_secret_key
```

## 📊 Yangi API Endpointlar

### Upload API
- `POST /api/upload/single` - Bitta rasm yuklash
- `POST /api/upload/multiple` - Ko'plab rasmlar yuklash
- `POST /api/upload/tour-image` - Tur rasmi yuklash
- `DELETE /api/upload/delete` - Rasm o'chirish
- `GET /api/upload/images` - Rasmlarni olish

### Payment API
- `POST /api/payments` - To'lov yaratish
- `GET /api/payments/:id` - To'lov holati
- `GET /api/payments/my/payments` - Foydalanuvchi to'lovlari
- `GET /api/payments/all` - Barcha to'lovlar (admin)
- `POST /api/payments/payme/callback` - Payme callback
- `POST /api/payments/click/callback` - Click callback
- `GET /api/payments/stats` - To'lov statistikasi (admin)

## 🔄 Database Schema Yangiliklari

### Payments Jadvali
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  payment_method VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_url VARCHAR(500),
  payment_id VARCHAR(100) NOT NULL,
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Foydalanuvchi Tajribasi

### Yangi Imkoniyatlar
1. **Xavfsiz ro'yxatdan o'tish**: Validatsiya bilan
2. **Rasm yuklash**: Admin panel orqali
3. **To'lov qilish**: Payme/Click orqali
4. **Email bildirishnomalar**: Avtomatik xabarlar
5. **Real-time holat**: To'lov va bron holatlari

### Security Improvements
- **Qattiq validatsiya**: Barcha inputlar
- **Imzo tekshiruvi**: To'lov callbacklari
- **Rate limiting**: DDOS himoyasi
- **HTTPS**: Railway tomonidan avtomatik

## 📈 Performance Optimizations

- **Cloudinary CDN**: Rasmlar uchun tezkor yuklash
- **Email queue**: Asinxron email yuborish
- **Database indexes**: Tezkor so'rovlar
- **Caching**: Statik ma'lumotlar uchun

## 🔍 Monitoring va Debug

### Loglar
- **Email yuborish**: Success/Error holatlari
- **To'lov callbacklar**: Barcha operatsiyalar
- **Validatsiya xatoliklari**: Detailed error messages
- **Cloudinary upload**: Success/Error holatlari

### Error Handling
- **Graceful degradation**: Email xatosi operatsiyani to'xtatmaydi
- **User feedback**: Aniq xato xabarlari
- **Admin notifications**: Muhim xatoliklar uchun

TourVoyage 2.0 endi to'liq enterprise-level xususiyatlarga ega! 🚀
