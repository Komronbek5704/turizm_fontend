const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // Path moduli qo'shildi
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// --- SECURITY CONFIGURATION (HELMET) ---
// Tashqi kutubxonalar (Bootstrap, jsPDF, Cloudinary) ishlashi uchun CSP sozlamalari
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://*.openstreetmap.org"],
        "connect-src": ["'self'", "https://*.railway.app", "https://res.cloudinary.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false, // Rasmlar yuklanishida muammo bo'lmasligi uchun
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
app.use(limiter);

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  'https://tour-voyage-production.up.railway.app',
  'https://turizmfontend-production.up.railway.app' // Sizning yangi Railway manzilingiz
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS xavfsizlik cheklovi: Bu domen ruxsat etilmagan.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
// HTML, CSS va JS fayllaringizni ildiz papkadan o'qish
app.use(express.static(__dirname));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// --- FRONTEND ROUTING ---
// Brauzer orqali to'g'ridan-to'g'ri kirilganda fayllarni yuborish
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// --- ERROR HANDLING ---
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API marshruti topilmadi' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Serverda ichki xato yuz berdi',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli ishga tushdi`);
  console.log(`🌍 Muhit: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
