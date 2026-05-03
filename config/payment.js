const crypto = require('crypto');

// Payme konfiguratsiyasi
const paymeConfig = {
  merchantId: process.env.PAYME_MERCHANT_ID,
  key: process.env.PAYME_KEY,
  baseUrl: 'https://checkout.payme.uz/api',
  callbackUrl: process.env.FRONTEND_URL + '/payment/callback',
  returnUrl: process.env.FRONTEND_URL + '/payment/success'
};

// Click konfiguratsiyasi
const clickConfig = {
  merchantId: process.env.CLICK_MERCHANT_ID,
  serviceId: process.env.CLICK_SERVICE_ID,
  userId: process.env.CLICK_USER_ID,
  secretKey: process.env.CLICK_SECRET_KEY,
  baseUrl: 'https://api.click.uz/v2/merchant',
  callbackUrl: process.env.FRONTEND_URL + '/payment/click/callback',
  returnUrl: process.env.FRONTEND_URL + '/payment/click/success'
};

// Payme imzo generatsiyasi
const generatePaymeSignature = (data) => {
  const string = `${paymeConfig.merchantId}${data.amount}${data.orderId}${paymeConfig.key}`;
  return crypto.createHash('md5').update(string).digest('hex');
};

// Click imzo generatsiyasi
const generateClickSignature = (timestamp, data) => {
  const string = `${timestamp}${clickConfig.secretKey}${data}`;
  return crypto.createHash('md5').update(string).digest('hex');
};

// Payme to'lov yaratish
const createPaymePayment = async (bookingData) => {
  try {
    const { id, total_price, user } = bookingData;
    const amount = Math.round(total_price * 100); // Payme tiinlarda ishlaydi
    
    const paymentData = {
      merchant_id: paymeConfig.merchantId,
      amount: amount,
      order_id: id,
      callback_url: paymeConfig.callbackUrl,
      return_url: paymeConfig.returnUrl,
      description: `TourVoyage bron #${id} - ${user.name}`,
      currency: 'UZS'
    };

    const signature = generatePaymeSignature(paymentData);
    paymentData.sign = signature;

    // Payme API ga so'rov yuborish
    const response = await fetch(`${paymeConfig.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth': paymeConfig.key
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || 'Payme to\'lovini yaratishda xatolik');
    }

    return {
      payment_url: result.result.payment_url,
      payment_id: result.result.payment_id,
      amount: amount / 100,
      merchant_id: paymeConfig.merchantId
    };

  } catch (error) {
    console.error('Payme payment creation error:', error);
    throw new Error('Payme to\'lovini yaratishda xatolik: ' + error.message);
  }
};

// Click to'lov yaratish
const createClickPayment = async (bookingData) => {
  try {
    const { id, total_price, user } = bookingData;
    const amount = Math.round(total_price); // Click so'mmada ishlaydi
    
    const timestamp = Date.now();
    const serviceId = clickConfig.serviceId;
    const merchantId = clickConfig.merchantId;
    const orderId = id;
    
    // Click to'lov URL yaratish
    const paymentUrl = `${clickConfig.baseUrl}/form?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${orderId}&return_url=${encodeURIComponent(clickConfig.returnUrl)}&callback_url=${encodeURIComponent(clickConfig.callbackUrl)}`;

    return {
      payment_url: paymentUrl,
      payment_id: orderId,
      amount: amount,
      service_id: serviceId,
      merchant_id: merchantId
    };

  } catch (error) {
    console.error('Click payment creation error:', error);
    throw new Error('Click to\'lovini yaratishda xatolik: ' + error.message);
  }
};

// Payme callback ni tekshirish
const verifyPaymeCallback = (req) => {
  try {
    const { merchant_id, amount, order_id, sign } = req.body;
    
    if (merchant_id !== paymeConfig.merchantId) {
      throw new Error('Noto\'g\'ri merchant ID');
    }

    const expectedSign = generatePaymeSignature({
      amount,
      orderId: order_id
    });

    if (sign !== expectedSign) {
      throw new Error('Noto\'g\'ri imzo');
    }

    return true;

  } catch (error) {
    console.error('Payme callback verification error:', error);
    return false;
  }
};

// Click callback ni tekshirish
const verifyClickCallback = (req) => {
  try {
    const { service_id, merchant_trans_id, amount, click_trans_id, sign_string } = req.body;
    
    if (service_id !== clickConfig.serviceId) {
      throw new Error('Noto\'g\'ri service ID');
    }

    // Click imzo tekshiruvi
    const timestamp = req.headers['x-req-time'] || Date.now();
    const expectedSign = generateClickSignature(timestamp, `${merchant_trans_id}${click_trans_id}${amount}`);
    
    if (sign_string !== expectedSign) {
      throw new Error('Noto\'g\'ri imzo');
    }

    return true;

  } catch (error) {
    console.error('Click callback verification error:', error);
    return false;
  }
};

// To'lov holatini olish (Payme)
const getPaymePaymentStatus = async (paymentId) => {
  try {
    const response = await fetch(`${paymeConfig.baseUrl}/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth': paymeConfig.key
      },
      body: JSON.stringify({
        merchant_id: paymeConfig.merchantId,
        payment_id: paymentId
      })
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || 'To\'lov holatini olishda xatolik');
    }

    return result.result;

  } catch (error) {
    console.error('Payme status check error:', error);
    throw new Error('Payme to\'lov holatini olishda xatolik: ' + error.message);
  }
};

module.exports = {
  paymeConfig,
  clickConfig,
  createPaymePayment,
  createClickPayment,
  verifyPaymeCallback,
  verifyClickCallback,
  getPaymePaymentStatus,
  generatePaymeSignature,
  generateClickSignature
};
