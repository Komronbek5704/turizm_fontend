const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Tour = require('../models/Tour');
const User = require('../models/User');
const { 
  createPaymePayment, 
  createClickPayment,
  verifyPaymeCallback,
  verifyClickCallback,
  getPaymePaymentStatus
} = require('../config/payment');
const { 
  createPaymentSchema,
  validate 
} = require('../validators/validationSchemas');
const { 
  sendPaymentConfirmationEmail
} = require('../config/email');

// To'lov yaratish
const createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method } = req.validatedBody;
    const user_id = req.user.id;

    // Bron mavjudligini tekshirish
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Bron topilmadi' });
    }

    // Foydalanuvchi o'z bronini to'lashi kerak
    if (booking.user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat etilmagan amal' });
    }

    // Avval to'lov qilinganini tekshirish
    const existingPayment = await Payment.findByBookingId(booking_id);
    if (existingPayment && existingPayment.find(p => p.status === 'completed')) {
      return res.status(400).json({ message: 'Bu bron allaqachon to\'langan' });
    }

    // To'lov miqdorini olish
    let amount = booking.total_price;

    // Tur ma'lumotlarini olish
    const tour = await Tour.findById(booking.tour_id);
    
    // To'lov yaratish
    let paymentData;
    
    if (payment_method === 'payme') {
      paymentData = await createPaymePayment({
        id: booking_id,
        total_price: amount,
        user: {
          name: booking.user_name || 'Foydalanuvchi',
          email: booking.user_email || 'user@example.com'
        }
      });
    } else if (payment_method === 'click') {
      paymentData = await createClickPayment({
        id: booking_id,
        total_price: amount,
        user: {
          name: booking.user_name || 'Foydalanuvchi',
          email: booking.user_email || 'user@example.com'
        }
      });
    } else {
      return res.status(400).json({ message: 'Noto\'g\'ri to\'lov usuli' });
    }

    // To'lov ma'lumotlarini saqlash
    const payment = await Payment.create({
      booking_id,
      payment_method,
      amount,
      payment_url: paymentData.payment_url,
      payment_id: paymentData.payment_id,
      status: 'pending'
    });

    res.status(201).json({
      message: 'To\'lov muvaffaqiyatli yaratildi',
      payment: {
        id: payment.id,
        payment_url: paymentData.payment_url,
        amount,
        payment_method,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      message: 'To\'lov yaratishda xatolik',
      error: error.message 
    });
  }
};

// To'lov holatini olish
const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'To\'lov topilmadi' });
    }

    // Foydalanuvchi o'z to'lovini ko'rishi mumkin
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat etilmagan amal' });
    }

    // Agar Payme bo'lsa, holatni tekshirish
    if (payment.payment_method === 'payme' && payment.status === 'pending') {
      try {
        const paymeStatus = await getPaymePaymentStatus(payment.payment_id);
        
        if (paymeStatus.state === 2) { // To'lov muvaffaqiyatli
          await Payment.updateStatus(payment.id, 'completed', paymeStatus.transaction_id);
          payment.status = 'completed';
        } else if (paymeStatus.state === 3) { // To'lov bekor qilingan
          await Payment.updateStatus(payment.id, 'cancelled', paymeStatus.transaction_id);
          payment.status = 'cancelled';
        }
      } catch (error) {
        console.error('Payme status check error:', error);
      }
    }

    res.json({
      message: 'To\'lov holati muvaffaqiyatli olindi',
      payment
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      message: 'To\'lov holatini olishda xatolik',
      error: error.message 
    });
  }
};

// Foydalanuvchi to'lovlari
const getUserPayments = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    const payments = await Payment.getUserPayments(user_id, parseInt(limit), parseInt(offset));

    res.json({
      message: 'Foydalanuvchi to\'lovlari muvaffaqiyatli olindi',
      payments,
      total: payments.length
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ 
      message: 'Foydalanuvchi to\'lovlarini olishda xatolik',
      error: error.message 
    });
  }
};

// Barcha to'lovlar (admin only)
const getAllPayments = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const payments = await Payment.getAll(parseInt(limit), parseInt(offset));

    res.json({
      message: 'Barcha to\'lovlar muvaffaqiyatli olindi',
      payments,
      total: payments.length
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ 
      message: 'Barcha to\'lovlarni olishda xatolik',
      error: error.message 
    });
  }
};

// Payme callback
const paymeCallback = async (req, res) => {
  try {
    // Callback imzosini tekshirish
    if (!verifyPaymeCallback(req)) {
      return res.status(400).json({
        error: -32500,
        error_note: 'Noto\'g\'ri imzo'
      });
    }

    const { order_id, payment_id, state, transaction_id } = req.body;
    
    // To'lovni topish
    const payment = await Payment.findByPaymentId(payment_id, 'payme');
    if (!payment) {
      return res.status(404).json({
        error: -32500,
        error_note: 'To\'lov topilmadi'
      });
    }

    // To'lov holatini yangilash
    let status = 'pending';
    if (state === 2) { // Muvaffaqiyatli
      status = 'completed';
    } else if (state === 3) { // Bekor qilingan
      status = 'cancelled';
    }

    await Payment.updateStatusByPaymentId(payment_id, 'payme', status, transaction_id);

    // Agar to'lov muvaffaqiyatli bo'lsa, bron holatini yangilash
    if (status === 'completed') {
      await Booking.updateStatus(order_id, 'confirmed');
      
      // Send payment confirmation email
      try {
        const booking = await Booking.findById(order_id);
        if (booking) {
          const user = await User.findById(booking.user_id);
          if (user) {
            await sendPaymentConfirmationEmail(payment, booking, user);
          }
        }
      } catch (emailError) {
        console.error('Payment confirmation email error:', emailError);
      }
    }

    res.json({
      success: true,
      payment_id,
      state,
      status
    });

  } catch (error) {
    console.error('Payme callback error:', error);
    res.status(500).json({
      error: -32500,
      error_note: 'Server xatoliki'
    });
  }
};

// Click callback
const clickCallback = async (req, res) => {
  try {
    // Callback imzosini tekshirish
    if (!verifyClickCallback(req)) {
      return res.status(400).json({
        error: -1,
        error_note: 'Noto\'g\'ri imzo'
      });
    }

    const { service_id, merchant_trans_id, click_trans_id, amount, action, status } = req.body;
    
    // To'lovni topish
    const payment = await Payment.findByPaymentId(merchant_trans_id, 'click');
    if (!payment) {
      return res.status(404).json({
        error: -1,
        error_note: 'To\'lov topilmadi'
      });
    }

    // To'lov holatini yangilash
    let paymentStatus = 'pending';
    if (action === 1 && status === 1) { // To'lov muvaffaqiyatli
      paymentStatus = 'completed';
    } else if (action === 1 && status === -1) { // To'lov bekor qilingan
      paymentStatus = 'cancelled';
    }

    await Payment.updateStatusByPaymentId(merchant_trans_id, 'click', paymentStatus, click_trans_id);

    // Agar to'lov muvaffaqiyatli bo'lsa, bron holatini yangilash
    if (paymentStatus === 'completed') {
      await Booking.updateStatus(payment.booking_id, 'confirmed');
    }

    res.json({
      success: true,
      click_trans_id,
      merchant_trans_id,
      status: paymentStatus
    });

  } catch (error) {
    console.error('Click callback error:', error);
    res.status(500).json({
      error: -1,
      error_note: 'Server xatoliki'
    });
  }
};

// To'lov statistikasi (admin only)
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getStats();

    res.json({
      message: 'To\'lov statistikasi muvaffaqiyatli olindi',
      stats
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ 
      message: 'To\'lov statistikasini olishda xatolik',
      error: error.message 
    });
  }
};

module.exports = {
  createPayment,
  getPaymentStatus,
  getUserPayments,
  getAllPayments,
  paymeCallback,
  clickCallback,
  getPaymentStats
};
