const Joi = require('joi');

// ==================== USER VALIDATION SCHEMAS ====================

const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-Zа-яА-ЯёЁ\s]+$/)
        .required()
        .messages({
            'string.empty': 'Ism bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Ism 100 ta harfdan oshmasligi kerak',
            'string.pattern.base': 'Ism faqat harflardan iborat bo\'lishi kerak',
            'any.required': 'Ism majburiy maydon'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Iltimos to\'g\'ri email manzilini kiriting',
            'any.required': 'Email majburiy maydon'
        }),
    password: Joi.string()
        .min(6)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
            'string.max': 'Parol 128 ta belgidan oshmasligi kerak',
            'string.pattern.base': 'Parol kamida bitta katta harf, bitta kichik harf va bitta raqamdan iborat bo\'lishi kerak',
            'any.required': 'Parol majburiy maydon'
        }),
    phone: Joi.string()
        .pattern(/^\+998\d{9}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Telefon raqami +998 bilan boshlanib 9 ta raqamdan iborat bo\'lishi kerak'
        }),
    avatar_url: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'Avatar URL to\'g\'ri formatda bo\'lishi kerak'
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Iltimos to\'g\'ri email manzilini kiriting',
            'any.required': 'Email majburiy maydon'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Parol majburiy maydon'
        })
});

const updateProfileSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-Zа-яА-ЯёЁ\s]+$/)
        .optional()
        .messages({
            'string.min': 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Ism 100 ta harfdan oshmasligi kerak',
            'string.pattern.base': 'Ism faqat harflardan iborat bo\'lishi kerak'
        }),
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Iltimos to\'g\'ri email manzilini kiriting'
        }),
    phone: Joi.string()
        .pattern(/^\+998\d{9}$/)
        .optional()
        .allow('')
        .messages({
            'string.pattern.base': 'Telefon raqami +998 bilan boshlanib 9 ta raqamdan iborat bo\'lishi kerak'
        }),
    avatar_url: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Avatar URL to\'g\'ri formatda bo\'lishi kerak'
        })
});

// ==================== TOUR VALIDATION SCHEMAS ====================

const createTourSchema = Joi.object({
    name: Joi.string()
        .min(5)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Tur nomi bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Tur nomi kamida 5 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Tur nomi 200 ta harfdan oshmasligi kerak',
            'any.required': 'Tur nomi majburiy maydon'
        }),
    description: Joi.string()
        .min(20)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Tavsif bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Tavsif kamida 20 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Tavsif 2000 ta harfdan oshmasligi kerak',
            'any.required': 'Tavsif majburiy maydon'
        }),
    price: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.base': 'Narx raqam bo\'lishi kerak',
            'number.positive': 'Narx musbat son bo\'lishi kerak',
            'any.required': 'Narx majburiy maydon'
        }),
    duration: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Davomiyligi bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Davomiyligi kamida 3 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Davomiyligi 50 ta harfdan oshmasligi kerak',
            'any.required': 'Davomiyligi majburiy maydon'
        }),
    image_url: Joi.string()
        .uri()
        .required()
        .messages({
            'string.uri': 'Rasm URL to\'g\'ri formatda bo\'lishi kerak',
            'any.required': 'Rasm URL majburiy maydon'
        }),
    destination: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Manzil bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Manzil kamida 2 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Manzil 100 ta harfdan oshmasligi kerak',
            'any.required': 'Manzil majburiy maydon'
        }),
    available_spots: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .optional()
        .default(20)
        .messages({
            'number.base': 'Bo\'sh joylar soni raqam bo\'lishi kerak',
            'number.integer': 'Bo\'sh joylar soni butun son bo\'lishi kerak',
            'number.min': 'Bo\'sh joylar soni kamida 1 ta bo\'lishi kerak',
            'number.max': 'Bo\'sh joylar soni 1000 dan oshmasligi kerak'
        })
});

const updateTourSchema = Joi.object({
    name: Joi.string()
        .min(5)
        .max(200)
        .optional()
        .messages({
            'string.min': 'Tur nomi kamida 5 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Tur nomi 200 ta harfdan oshmasligi kerak'
        }),
    description: Joi.string()
        .min(20)
        .max(2000)
        .optional()
        .messages({
            'string.min': 'Tavsif kamida 20 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Tavsif 2000 ta harfdan oshmasligi kerak'
        }),
    price: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .messages({
            'number.base': 'Narx raqam bo\'lishi kerak',
            'number.positive': 'Narx musbat son bo\'lishi kerak'
        }),
    duration: Joi.string()
        .min(3)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Davomiyligi kamida 3 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Davomiyligi 50 ta harfdan oshmasligi kerak'
        }),
    image_url: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'Rasm URL to\'g\'ri formatda bo\'lishi kerak'
        }),
    destination: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Manzil kamida 2 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Manzil 100 ta harfdan oshmasligi kerak'
        }),
    available_spots: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .optional()
        .messages({
            'number.base': 'Bo\'sh joylar soni raqam bo\'lishi kerak',
            'number.integer': 'Bo\'sh joylar soni butun son bo\'lishi kerak',
            'number.min': 'Bo\'sh joylar soni kamida 1 ta bo\'lishi kerak',
            'number.max': 'Bo\'sh joylar soni 1000 dan oshmasligi kerak'
        })
});

// ==================== BOOKING VALIDATION SCHEMAS ====================

const createBookingSchema = Joi.object({
    tour_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Tur ID raqam bo\'lishi kerak',
            'number.integer': 'Tur ID butun son bo\'lishi kerak',
            'number.positive': 'Tur ID musbat son bo\'lishi kerak',
            'any.required': 'Tur ID majburiy maydon'
        }),
    travel_date: Joi.date()
        .min('now')
        .required()
        .messages({
            'date.base': 'Sayohat sanasi to\'g\'ri formatda bo\'lishi kerak',
            'date.min': 'Sayohat sanasi bugungi kundan keyin bo\'lishi kerak',
            'any.required': 'Sayohat sanasi majburiy maydon'
        }),
    number_of_people: Joi.number()
        .integer()
        .min(1)
        .max(20)
        .required()
        .messages({
            'number.base': 'Kishilar soni raqam bo\'lishi kerak',
            'number.integer': 'Kishilar soni butun son bo\'lishi kerak',
            'number.min': 'Kishilar soni kamida 1 ta bo\'lishi kerak',
            'number.max': 'Kishilar soni 20 dan oshmasligi kerak',
            'any.required': 'Kishilar soni majburiy maydon'
        })
});

const updateBookingStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'cancelled', 'completed')
        .required()
        .messages({
            'any.only': 'Holat faqat pending, confirmed, cancelled, completed qiymatlaridan birini qabul qilishi mumkin',
            'any.required': 'Holat majburiy maydon'
        })
});

// ==================== MESSAGE VALIDATION SCHEMAS ====================

const createMessageSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-Zа-яА-ЯёЁ\s]+$/)
        .required()
        .messages({
            'string.empty': 'Ism bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Ism 100 ta harfdan oshmasligi kerak',
            'string.pattern.base': 'Ism faqat harflardan iborat bo\'lishi kerak',
            'any.required': 'Ism majburiy maydon'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Iltimos to\'g\'ri email manzilini kiriting',
            'any.required': 'Email majburiy maydon'
        }),
    subject: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .allow('')
        .messages({
            'string.min': 'Mavzu kamida 2 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Mavzu 200 ta harfdan oshmasligi kerak'
        }),
    message: Joi.string()
        .min(10)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Xabar matni bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Xabar matni kamida 10 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Xabar matni 2000 ta harfdan oshmasligi kerak',
            'any.required': 'Xabar matni majburiy maydon'
        })
});

// ==================== CHAT VALIDATION SCHEMAS ====================

const sendChatMessageSchema = Joi.object({
    message: Joi.string()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Xabar bo\'sh bo\'lishi mumkin emas',
            'string.min': 'Xabar kamida 1 ta harfdan iborat bo\'lishi kerak',
            'string.max': 'Xabar 1000 ta harfdan oshmasligi kerak',
            'any.required': 'Xabar majburiy maydon'
        }),
    user_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Foydalanuvchi ID raqam bo\'lishi kerak',
            'number.integer': 'Foydalanuvchi ID butun son bo\'lishi kerak',
            'number.positive': 'Foydalanuvchi ID musbat son bo\'lishi kerak'
        })
});

// ==================== PAYMENT VALIDATION SCHEMAS ====================

const createPaymentSchema = Joi.object({
    booking_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Bron ID raqam bo\'lishi kerak',
            'number.integer': 'Bron ID butun son bo\'lishi kerak',
            'number.positive': 'Bron ID musbat son bo\'lishi kerak',
            'any.required': 'Bron ID majburiy maydon'
        }),
    payment_method: Joi.string()
        .valid('payme', 'click', 'uzcard', 'humo')
        .required()
        .messages({
            'any.only': 'To\'lov usuli faqat payme, click, uzcard, humo qiymatlaridan birini qabul qilishi mumkin',
            'any.required': 'To\'lov usuli majburiy maydon'
        }),
    amount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.base': 'Summa raqam bo\'lishi kerak',
            'number.positive': 'Summa musbat son bo\'lishi kerak',
            'any.required': 'Summa majburiy maydon'
        })
});

// ==================== VALIDATION MIDDLEWARE ====================

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = source === 'params' ? req.params : 
                    source === 'query' ? req.query : req.body;
        
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                message: 'Validatsiya xatoliklari',
                errors: errorMessages
            });
        }

        // Validated data ni req ga qo'shish
        if (source === 'body') req.validatedBody = value;
        else if (source === 'params') req.validatedParams = value;
        else if (source === 'query') req.validatedQuery = value;

        next();
    };
};

module.exports = {
    // User schemas
    registerSchema,
    loginSchema,
    updateProfileSchema,
    
    // Tour schemas
    createTourSchema,
    updateTourSchema,
    
    // Booking schemas
    createBookingSchema,
    updateBookingStatusSchema,
    
    // Message schemas
    createMessageSchema,
    
    // Chat schemas
    sendChatMessageSchema,
    
    // Payment schemas
    createPaymentSchema,
    
    // Validation middleware
    validate
};
