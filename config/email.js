const nodemailer = require('nodemailer');

// Email transporter yaratish
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Bu kerak bo'lishi mumkin
    }
  });
};

// Email yuborish funksiyasi
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"TourVoyage" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email yuborishda xatolik: ' + error.message);
  }
};

// HTML template yaratish
const createEmailTemplate = (template, data) => {
  const templates = {
    bookingConfirmation: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TourVoyage - Bron Tasdiqlandi</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .booking-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌍 TourVoyage</h1>
          <h2>Broningiz Muvaffaqiyatli Tasdiqlandi!</h2>
        </div>
        
        <div class="content">
          <p>Hurmatli ${data.userName},</p>
          <p>TourVoyage platformasidan tur bron qilishingiz uchun tashakkur. Sizning broningiz muvaffaqiyatli tasdiqlandi!</p>
          
          <div class="booking-details">
            <h3>📋 Bron Tafsilotlari</h3>
            <p><strong>Tur nomi:</strong> ${data.tourName}</p>
            <p><strong>Sayohat sanasi:</strong> ${data.travelDate}</p>
            <p><strong>Kishilar soni:</strong> ${data.numberOfPeople}</p>
            <p><strong>Jami narx:</strong> $${data.totalPrice}</p>
            <p><strong>Bron raqami:</strong> #${data.bookingId}</p>
          </div>
          
          <p><strong>Manzil:</strong> ${data.destination}</p>
          <p><strong>Davomiyligi:</strong> ${data.duration}</p>
          
          <p>Iltimos, sayohatdan oldin quyidagilarni esda tuting:</p>
          <ul>
            <li>📱 Telefon raqamingizni faol holatda ushlab turing</li>
            <li>📄 Pasport va boshqa kerakli hujjatlarni tayyorlang</li>
            <li>⏰ Uchishdan 2 soat oldin aeroportga boring</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL}/my-bookings" class="btn">
            Mening Bronlarim
          </a>
          
          <p>Qo'shimcha savollaringiz bo'lsa, biz bilan bog'laning:</p>
          <p>📧 Email: qudratovkomron2004@gmail.com</p>
          <p>📞 Telefon: +998 50 503 57 04</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 TourVoyage. Barcha huquqlar himoyalangan.</p>
          <p>Samarqand shahri, O'zbekiston</p>
        </div>
      </body>
      </html>
    `,
    
    newBookingNotification: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TourVoyage - Yangi Bron</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .booking-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff6b6b;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #ff6b6b;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Yangi Bron</h1>
          <h2>Admin Panel Xabarnomasi</h2>
        </div>
        
        <div class="content">
          <p>Hurmatli admin,</p>
          <p>TourVoyage platformasida yangi bron qilindi!</p>
          
          <div class="booking-details">
            <h3>📋 Bron Tafsilotlari</h3>
            <p><strong>Foydalanuvchi:</strong> ${data.userName}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Tur nomi:</strong> ${data.tourName}</p>
            <p><strong>Sayohat sanasi:</strong> ${data.travelDate}</p>
            <p><strong>Kishilar soni:</strong> ${data.numberOfPeople}</p>
            <p><strong>Jami narx:</strong> $${data.totalPrice}</p>
            <p><strong>Bron raqami:</strong> #${data.bookingId}</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/admin-dashboard.html" class="btn">
            Admin Panel
          </a>
          
          <p>Bron holatini boshqarish uchun admin paneliga kiring.</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 TourVoyage. Barcha huquqlar himoyalangan.</p>
          <p>Admin Panel Xabarnomasi</p>
        </div>
      </body>
      </html>
    `,
    
    paymentConfirmation: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TourVoyage - To'lov Tasdiqlandi</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .payment-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💳 To'lov Muvaffaqiyatli</h1>
          <h2>TourVoyage</h2>
        </div>
        
        <div class="content">
          <p>Hurmatli ${data.userName},</p>
          <p>Sizning to'lovingiz muvaffaqiyatli amalga oshirildi!</p>
          
          <div class="payment-details">
            <h3>💰 To'lov Tafsilotlari</h3>
            <p><strong>To'lov usuli:</strong> ${data.paymentMethod}</p>
            <p><strong>To'lov miqdori:</strong> $${data.amount}</p>
            <p><strong>To'lov ID:</strong> ${data.paymentId}</p>
            <p><strong>Bron raqami:</strong> #${data.bookingId}</p>
            <p><strong>To'lov sanasi:</strong> ${data.paymentDate}</p>
          </div>
          
          <p>Sizning broningiz to'liq tasdiqlandi va sayohatga tayyorlanishingiz mumkin!</p>
          
          <a href="${process.env.FRONTEND_URL}/my-bookings" class="btn">
            Mening Bronlarim
          </a>
          
          <p>Savollaringiz bo'lsa, biz bilan bog'laning:</p>
          <p>📧 Email: qudratovkomron2004@gmail.com</p>
          <p>📞 Telefon: +998 50 503 57 04</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 TourVoyage. Barcha huquqlar himoyalangan.</p>
          <p>Samarqand shahri, O'zbekiston</p>
        </div>
      </body>
      </html>
    `,
    
    welcomeEmail: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TourVoyage - Xush kelibsiz!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌍 TourVoyage</h1>
          <h2>Xush kelibsiz!</h2>
        </div>
        
        <div class="content">
          <p>Hurmatli ${data.userName},</p>
          <p>TourVoyage oilasiga qo'shilganingizdan mamnunmiz! Siz dunyoning eng go'zal joylariga sayohat qilish imkoniyatiga egasiz.</p>
          
          <h3>🎞️ Bizning imkoniyatlarimiz:</h3>
          <ul>
            <li>🌍 150+ dan ortiq tur yo'nalishlari</li>
            <li>🏆 12 yillik tajriba</li>
            <li>⭐ 98% mijoz mamnunligi</li>
            <li>💰 Qulay to'lov tizimlari</li>
            <li>📞 24/7 qo'llab-quvvatlash</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL}" class="btn">
            Saytni Ko'rish
          </a>
          
          <p>Sizning hisobingiz muvaffaqiyatli yaratildi. Endi siz tur paketlarini ko'rib, bron qilishingiz mumkin.</p>
          
          <p>Savollaringiz bo'lsa, biz bilan bog'laning:</p>
          <p>📧 Email: qudratovkomron2004@gmail.com</p>
          <p>📞 Telefon: +998 50 503 57 04</p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 TourVoyage. Barcha huquqlar himoyalangan.</p>
          <p>Samarqand shahri, O'zbekiston</p>
        </div>
      </body>
      </html>
    `
  };

  return templates[template] || templates.welcomeEmail;
};

// Xususiy email yuborish funksiyalari
const sendBookingConfirmationEmail = async (bookingData, userData, tourData) => {
  const template = createEmailTemplate('bookingConfirmation', {
    userName: userData.name,
    tourName: tourData.name,
    travelDate: new Date(bookingData.travel_date).toLocaleDateString(),
    numberOfPeople: bookingData.number_of_people,
    totalPrice: bookingData.total_price,
    bookingId: bookingData.id,
    destination: tourData.destination,
    duration: tourData.duration
  });

  return await sendEmail({
    to: userData.email,
    subject: `TourVoyage - Bron #${bookingData.id} Tasdiqlandi`,
    html: template,
    text: `Hurmatli ${userData.name}, Sizning broningiz muvaffaqiyatli tasdiqlandi. Bron raqami: #${bookingData.id}`
  });
};

const sendNewBookingNotification = async (bookingData, userData, tourData) => {
  const template = createEmailTemplate('newBookingNotification', {
    userName: userData.name,
    userEmail: userData.email,
    tourName: tourData.name,
    travelDate: new Date(bookingData.travel_date).toLocaleDateString(),
    numberOfPeople: bookingData.number_of_people,
    totalPrice: bookingData.total_price,
    bookingId: bookingData.id
  });

  return await sendEmail({
    to: process.env.ADMIN_EMAIL || 'qudratovkomron2004@gmail.com',
    subject: `Yangi bron - #${bookingData.id}`,
    html: template,
    text: `Yangi bron qilindi: ${userData.name} - ${tourData.name} - #${bookingData.id}`
  });
};

const sendPaymentConfirmationEmail = async (paymentData, bookingData, userData) => {
  const template = createEmailTemplate('paymentConfirmation', {
    userName: userData.name,
    paymentMethod: paymentData.payment_method,
    amount: paymentData.amount,
    paymentId: paymentData.payment_id,
    bookingId: bookingData.id,
    paymentDate: new Date().toLocaleDateString()
  });

  return await sendEmail({
    to: userData.email,
    subject: `To'lov muvaffaqiyatli - Bron #${bookingData.id}`,
    html: template,
    text: `Hurmatli ${userData.name}, Sizning to'lovingiz muvaffaqiyatli amalga oshirildi. To'lov miqdori: $${paymentData.amount}`
  });
};

const sendWelcomeEmail = async (userData) => {
  const template = createEmailTemplate('welcomeEmail', {
    userName: userData.name
  });

  return await sendEmail({
    to: userData.email,
    subject: 'TourVoyage ga xush kelibsiz!',
    html: template,
    text: `Hurmatli ${userData.name}, TourVoyage platformasiga xush kelibsiz!`
  });
};

module.exports = {
  sendEmail,
  createEmailTemplate,
  sendBookingConfirmationEmail,
  sendNewBookingNotification,
  sendPaymentConfirmationEmail,
  sendWelcomeEmail,
  createTransporter
};
