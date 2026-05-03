// ==================== ASOSIY DAVLATLAR ====================
let currentUser = null;
let currentLanguage = localStorage.getItem('tourvoyage_language') || 'uz';

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Demo ma'lumotlarni yaratish
    createDemoData();
    
    // Foydalanuvchi holatini tekshirish
    checkUserStatus();
    
    // Ma'lumotlarni yuklash
    loadTourPackages();
    loadWeatherInfo();
    updateNotifications();
    
    // Event listenerlarni sozlash
    setupEventListeners();
    
    // Til tanlashni sozlash
    setupLanguageSelector();
    
    // AI Chat sozlash
    setupAIChat();
    
    // Contact form sozlash
    setupContactForm();
}

// ==================== TUR PAKETLARI ====================

function loadTourPackages() {
    const toursContainer = document.getElementById('tour-packages');
    if (!toursContainer) return;
    
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    
    toursContainer.innerHTML = '';
    
    if (tours.length === 0) {
        toursContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-suitcase fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">Hozircha tur paketlar mavjud emas</h4>
                <p class="text-muted">Tez orada yangi turlar qo'shiladi</p>
            </div>
        `;
        return;
    }
    
    tours.forEach(tour => {
        const tourCard = document.createElement('div');
        tourCard.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
        tourCard.innerHTML = `
            <div class="card h-100 tour-card">
                <img src="${tour.image || 'https://via.placeholder.com/300x200?text=Tour+Image'}" 
                     class="card-img-top" alt="${tour.name}" 
                     style="height: 200px; object-fit: cover;">
                ${tour.category ? `<div class="tour-category">${tour.category}</div>` : ''}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title tour-name">${tour.name}</h5>
                    <p class="card-text flex-grow-1">${tour.description || 'Sayohat tavsifi'}</p>
                    <div class="mb-3">
                        <p class="mb-1"><i class="fas fa-clock me-2"></i>${tour.duration || '5 kun / 4 kecha'}</p>
                        <p class="mb-1"><i class="fas fa-users me-2"></i>Bo'sh joylar: ${tour.spots || 10}</p>
                        <p class="mb-1 tour-rating">
                            <i class="fas fa-star"></i> ${tour.rating || 4.5}/5
                        </p>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <h5 class="text-primary tour-price">$${tour.price || 0}</h5>
                        <button class="btn btn-primary book-tour-btn" data-id="${tour.id}">
                            <i class="fas fa-shopping-cart me-2"></i>Bron qilish
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        toursContainer.appendChild(tourCard);
    });
    
    // Bron qilish tugmalariga event listener qo'shish
    setupBookingButtons();
}

function setupBookingButtons() {
    document.querySelectorAll('.book-tour-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tourId = this.getAttribute('data-id');
            startBookingProcess(tourId);
        });
    });
}

async function startBookingProcess(tourId) {
    // 1. Foydalanuvchi tizimda kirganligini tekshirish
    if (!currentUser) {
        showToast('Iltimos, avval tizimga kiring!', 'warning');
        showLoginModal();
        return;
    }
    
    // 2. Tur ma'lumotlarini olish
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    const tour = tours.find(t => t.id == tourId);
    
    if (!tour) {
        showToast('Tur topilmadi!', 'error');
        return;
    }
    
    if ((tour.spots || 10) <= 0) {
        showToast('Uzr, bu tur uchun joylar band!', 'error');
        return;
    }
    
    // 3. To'lov oynasini ochish
    const paymentConfirmed = await showPaymentModal(tourId, tour.name, tour.price, currentUser);
    
    if (paymentConfirmed) {
        // 4. To'lov muvaffaqiyatli bo'lsa, bron qilish
        await completeBooking(tour);
    }
}

// To'lov modalini ko'rsatish
async function showPaymentModal(tourId, tourName, price, user) {
    return new Promise((resolve) => {
        // Modal HTML yaratish
        const modalHTML = `
            <div class="modal fade" id="paymentModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-credit-card me-2"></i>To'lov amalga oshirish</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info mb-3">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>To'lov ma'lumotlari:</strong>
                                <div class="mt-2">
                                    <p class="mb-1"><strong>Tur:</strong> ${tourName}</p>
                                    <p class="mb-1"><strong>Narx:</strong> $${price}</p>
                                    <p class="mb-1"><strong>Foydalanuvchi:</strong> ${user.name}</p>
                                </div>
                            </div>
                            
                            <div class="payment-methods mb-4">
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="paymentMethod" id="cardPayment" checked>
                                    <label class="form-check-label" for="cardPayment">
                                        <i class="fas fa-credit-card me-2"></i>Kredit karta
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="paymentMethod" id="paymePayment">
                                    <label class="form-check-label" for="paymePayment">
                                        <i class="fas fa-mobile-alt me-2"></i>Payme
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="paymentMethod" id="clickPayment">
                                    <label class="form-check-label" for="clickPayment">
                                        <i class="fas fa-hand-pointer me-2"></i>Click
                                    </label>
                                </div>
                            </div>
                            
                            <div id="cardDetails">
                                <div class="mb-3">
                                    <label for="cardNumber" class="form-label">Karta raqami</label>
                                    <input type="text" class="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="expiryDate" class="form-label">Amal qilish muddati</label>
                                        <input type="text" class="form-control" id="expiryDate" placeholder="MM/YY" maxlength="5">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="cvv" class="form-label">CVV</label>
                                        <input type="password" class="form-control" id="cvv" placeholder="123" maxlength="3">
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="cardHolder" class="form-label">Karta egasi</label>
                                    <input type="text" class="form-control" id="cardHolder" placeholder="${user.name.toUpperCase()}">
                                </div>
                            </div>
                            
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <small>Bu demo versiya. Haqiqiy to'lov amalga oshirilmaydi.</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Bekor qilish</button>
                            <button type="button" class="btn btn-primary" id="confirmPayment">
                                <i class="fas fa-lock me-2"></i>To'lash ($${price})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Modalni qo'shish
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Modalni ochish
        const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        paymentModal.show();
        
        // Karta raqami formati
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', formatCardNumber);
        }
        
        // Amal qilish muddati formati
        const expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', formatExpiryDate);
        }
        
        // CVV formati
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', formatCVV);
        }
        
        // To'lov usullarini almashtirish
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const cardDetails = document.getElementById('cardDetails');
                if (this.id === 'cardPayment') {
                    cardDetails.style.display = 'block';
                } else {
                    cardDetails.style.display = 'none';
                }
            });
        });
        
        // To'lovni tasdiqlash
        document.getElementById('confirmPayment').addEventListener('click', async function() {
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').id;
            
            // Validatsiya
            if (!validatePaymentForm(paymentMethod)) {
                return;
            }
            
            // To'lov jarayoni
            const btn = this;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>To\'lov amalga oshirilmoqda...';
            
            try {
                // To'lovni amalga oshirish
                const paymentResult = await processPayment({
                    tourId: tourId,
                    tourName: tourName,
                    price: price,
                    user: user,
                    paymentMethod: paymentMethod.replace('Payment', '')
                });
                
                if (paymentResult.success) {
                    // To'lov muvaffaqiyatli
                    showToast('To\'lov muvaffaqiyatli amalga oshirildi!', 'success');
                    paymentModal.hide();
                    setTimeout(() => {
                        modalContainer.remove();
                        resolve(true);
                    }, 300);
                } else {
                    // To'lov amalga oshirilmadi
                    showToast('To\'lov amalga oshirilmadi: ' + paymentResult.error, 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-lock me-2"></i>To\'lash ($' + price + ')';
                }
            } catch (error) {
                showToast('Xatolik yuz berdi: ' + error.message, 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-lock me-2"></i>To\'lash ($' + price + ')';
            }
        });
        
        // Modal yopilganda tozalash
        const modalElement = document.getElementById('paymentModal');
        modalElement.addEventListener('hidden.bs.modal', function() {
            modalContainer.remove();
            resolve(false);
        });
    });
}

// To'lov formati funksiyalari
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i=0, len=match.length; i<len; i+=4) {
        parts.push(match.substring(i, i+4));
    }
    
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = value;
    }
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
        value = value.substring(0,2) + '/' + value.substring(2,4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/[^0-9]/gi, '');
}

// Validatsiya funksiyasi
function validatePaymentForm(paymentMethod) {
    if (paymentMethod === 'cardPayment') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardHolder = document.getElementById('cardHolder').value;
        
        // Karta raqami validatsiya
        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
            showToast('Iltimos, to\'g\'ri karta raqamini kiriting (16 ta raqam)', 'warning');
            return false;
        }
        
        // Amal qilish muddati validatsiya
        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
            showToast('Iltimos, to\'g\'ri amal qilish muddatini kiriting (MM/YY)', 'warning');
            return false;
        }
        
        // CVV validatsiya
        if (!cvv || cvv.length !== 3) {
            showToast('Iltimos, to\'g\'ri CVV kodini kiriting (3 ta raqam)', 'warning');
            return false;
        }
        
        // Karta egasi validatsiya
        if (!cardHolder || cardHolder.trim().length < 3) {
            showToast('Iltimos, karta egasining to\'liq ismini kiriting', 'warning');
            return false;
        }
    }
    
    return true;
}

// To'lov tizimi funksiyasi
function processPayment(bookingDetails) {
    return new Promise((resolve, reject) => {
        // Simulate payment processing
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                // Payment successful
                resolve({
                    success: true,
                    transactionId: 'PAY_' + Date.now(),
                    message: 'To\'lov muvaffaqiyatli amalga oshirildi',
                    paymentMethod: bookingDetails.paymentMethod
                });
            } else {
                // Payment failed
                reject({
                    success: false,
                    error: 'To\'lov amalga oshirilmadi. Iltimos, qayta urinib ko\'ring'
                });
            }
        }, 2000);
    });
}

// Bron qilishni yakunlash
async function completeBooking(tour) {
    try {
        // 1. Bron yaratish
        const booking = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            tourId: tour.id,
            tourName: tour.name,
            price: tour.price,
            date: new Date().toISOString().split('T')[0],
            status: 'tasdiqlangan',
            paymentMethod: 'Karta',
            paymentDate: new Date().toISOString(),
            bookingNumber: 'TV-' + Date.now().toString().slice(-8)
        };
        
        // 2. LocalStorage ga bronni saqlash
        const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
        bookings.push(booking);
        localStorage.setItem('tourvoyage_bookings', JSON.stringify(bookings));
        
        // 3. Tur joylarini kamaytirish
        const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || [];
        const tourIndex = tours.findIndex(t => t.id == tour.id);
        if (tourIndex !== -1) {
            tours[tourIndex].spots = (tours[tourIndex].spots || 10) - 1;
            localStorage.setItem('tourvoyage_tours', JSON.stringify(tours));
        }
        
        // 4. Foydalanuvchiga bildirishnoma yuborish
        const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
        notifications.push({
            id: Date.now(),
            userId: currentUser.id,
            title: '🎉 Bron muvaffaqiyatli amalga oshirildi!',
            message: `Tabriklaymiz ${currentUser.name}! Siz "${tour.name}" turini muvaffaqiyatli bron qildingiz. Bron raqami: ${booking.bookingNumber}. Sayohatingiz yoqimli bo\'lsin!`,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // 5. Admin uchun bildirishnoma
        notifications.push({
            id: Date.now(),
            userId: 'admin',
            title: '💰 Yangi bron qilindi',
            message: `${currentUser.name} "${tour.name}" turini bron qildi. Narx: $${tour.price}. Bron raqami: ${booking.bookingNumber}`,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
        
        // 6. Admin bilan chatga xabar yuborish
        const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
        chatHistory.push({
            id: Date.now(),
            userId: currentUser.id,
            sender: 'user',
            message: `Men "${tour.name}" turini bron qildim. Bron raqami: ${booking.bookingNumber}`,
            timestamp: new Date().toISOString(),
            readByAdmin: false
        });
        localStorage.setItem('tourvoyage_chat', JSON.stringify(chatHistory));
        
        // 7. Success xabari ko'rsatish
        showSuccessNotification(tour, booking.bookingNumber);
        
        // 8. Yangilash
        loadTourPackages();
        updateNotifications();
        
        // 9. Profilni yangilash
        if (typeof checkUserStatus === 'function') {
            checkUserStatus();
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        showToast('Bron qilishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.', 'error');
    }
}

// Muvaffaqiyatli xabarni ko'rsatish
function showSuccessNotification(tour, bookingNumber) {
    // Modal yaratish
    const successModalHTML = `
        <div class="modal fade" id="successModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title"><i class="fas fa-check-circle me-2"></i>Bron muvaffaqiyatli amalga oshirildi!</h5>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-4">
                            <div class="success-icon mb-3">
                                <i class="fas fa-check-circle fa-5x text-success"></i>
                            </div>
                            <h4 class="text-success mb-3">Tabriklaymiz!</h4>
                            <p class="mb-2"><strong>Tur:</strong> ${tour.name}</p>
                            <p class="mb-2"><strong>Bron raqami:</strong> ${bookingNumber}</p>
                            <p class="mb-2"><strong>Narx:</strong> $${tour.price}</p>
                            <p class="mb-2"><strong>Sana:</strong> ${new Date().toLocaleDateString('uz-UZ')}</p>
                            <p class="mt-3">Sayohatingiz yoqimli bo'lsin!</p>
                        </div>
                        
                        <div class="alert alert-info text-start">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Eslatma:</strong> Bron ma'lumotlari sizning profilingizda saqlanadi. Admin bilan chat orqali qo'shimcha ma'lumot olishingiz mumkin.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="viewProfileBtn">
                            <i class="fas fa-user me-2"></i>Profilimga o'tish
                        </button>
                        <button type="button" class="btn btn-success" id="continueBrowsingBtn">
                            <i class="fas fa-suitcase me-2"></i>Tur paketlarini ko'rish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Modalni qo'shish
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = successModalHTML;
    document.body.appendChild(modalContainer);
    
    // Modalni ochish
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
    
    // Tugmalar uchun event listenerlar
    document.getElementById('viewProfileBtn').addEventListener('click', function() {
        successModal.hide();
        setTimeout(() => {
            modalContainer.remove();
            if (typeof showProfileModal === 'function') {
                showProfileModal();
            }
        }, 300);
    });
    
    document.getElementById('continueBrowsingBtn').addEventListener('click', function() {
        successModal.hide();
        setTimeout(() => {
            modalContainer.remove();
            // Tur paketlar bo'limiga o'tish
            const toursSection = document.getElementById('tours');
            if (toursSection) {
                toursSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    });
    
    // Modal yopilganda tozalash
    document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
        modalContainer.remove();
    });
}

// ==================== FOYDALANUVCHI TIZIMI ====================

function checkUserStatus() {
    const savedUser = localStorage.getItem('tourvoyage_current_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showUserMenu();
        } catch (error) {
            console.error('User parsing error:', error);
            showAuthButtons();
        }
    } else {
        showAuthButtons();
    }
}

function showUserMenu() {
    document.getElementById('userMenuContainer').style.display = 'block';
    document.getElementById('authButtonsContainer').style.display = 'none';
    
    // Avatar va ismni yangilash
    const userAvatar = document.getElementById('userAvatarNav');
    const userNameNav = document.getElementById('userNameNav');
    
    if (userAvatar) userAvatar.src = currentUser.avatar || 'https://via.placeholder.com/150';
    if (userNameNav) userNameNav.textContent = currentUser.name;
    
    // Event listenerlarni qo'shish
    setupUserMenuListeners();
}

function showAuthButtons() {
    const userMenuContainer = document.getElementById('userMenuContainer');
    const authButtonsContainer = document.getElementById('authButtonsContainer');
    
    if (userMenuContainer) userMenuContainer.style.display = 'none';
    if (authButtonsContainer) authButtonsContainer.style.display = 'block';
    
    // Auth button listenerlarni qo'shish
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', showLoginModal);
    if (registerBtn) registerBtn.addEventListener('click', showRegisterModal);
}

function setupUserMenuListeners() {
    const viewProfile = document.getElementById('viewProfile');
    const myBookings = document.getElementById('myBookings');
    const liveChatBtn = document.getElementById('liveChatBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (viewProfile) viewProfile.addEventListener('click', showProfileModal);
    if (myBookings) myBookings.addEventListener('click', showMyBookings);
    if (liveChatBtn) liveChatBtn.addEventListener('click', openLiveChat);
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
}

function showLoginModal() {
    const modalHTML = `
        <div class="modal fade" id="loginModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-sign-in-alt me-2"></i>Tizimga kirish</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="loginEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="loginEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="loginPassword" class="form-label">Parol</label>
                                <input type="password" class="form-control" id="loginPassword" required>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="rememberMe">
                                <label class="form-check-label" for="rememberMe">Eslab qolish</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Bekor qilish</button>
                        <button type="button" class="btn btn-primary" id="submitLogin">Kirish</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
    
    document.getElementById('submitLogin').addEventListener('click', function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('tourvoyage_current_user', JSON.stringify(user));
            checkUserStatus();
            modal.hide();
            
            // Modalni o'chirish
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.addEventListener('hidden.bs.modal', function() {
                    loginModal.remove();
                });
            }
            
            showToast('Muvaffaqiyatli kirdingiz!', 'success');
            
            // Notifikatsiya qo'shish
            addNotification('all', 'Xush kelibsiz!', `${user.name}, TourVoyage saytiga xush kelibsiz!`);
        } else {
            showToast('Email yoki parol noto\'g\'ri!', 'error');
        }
    });
    
    // Modal yopilganda o'chirish
    document.getElementById('loginModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function showRegisterModal() {
    const modalHTML = `
        <div class="modal fade" id="registerModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-user-plus me-2"></i>Ro'yxatdan o'tish</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="registerForm">
                            <div class="mb-3">
                                <label for="regName" class="form-label">Ism</label>
                                <input type="text" class="form-control" id="regName" required>
                            </div>
                            <div class="mb-3">
                                <label for="regEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="regEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="regPhone" class="form-label">Telefon</label>
                                <input type="tel" class="form-control" id="regPhone" required>
                            </div>
                            <div class="mb-3">
                                <label for="regPassword" class="form-label">Parol</label>
                                <input type="password" class="form-control" id="regPassword" required>
                                <div class="form-text">Kamida 6 ta belgi</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Bekor qilish</button>
                        <button type="button" class="btn btn-primary" id="submitRegister">Ro'yxatdan o'tish</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
    
    document.getElementById('submitRegister').addEventListener('click', function() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        
        if (password.length < 6) {
            showToast('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!', 'warning');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
        
        // Email takrorlanishini tekshirish
        if (users.some(u => u.email === email)) {
            showToast('Bu email allaqachon ro\'yxatdan o\'tgan!', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password,
            avatar: 'https://via.placeholder.com/150',
            registered: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('tourvoyage_users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('tourvoyage_current_user', JSON.stringify(newUser));
        
        checkUserStatus();
        modal.hide();
        
        // Modalni o'chirish
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
            registerModal.addEventListener('hidden.bs.modal', function() {
                registerModal.remove();
            });
        }
        
        showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
        
        // Yangi foydalanuvchi uchun notifikatsiya
        addNotification('all', 'Xush kelibsiz!', `${name}, TourVoyage oilasiga xush kelibsiz!`);
    });
    
    // Modal yopilganda o'chirish
    document.getElementById('registerModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function logoutUser() {
    if (confirm('Tizimdan chiqishni xohlaysizmi?')) {
        currentUser = null;
        localStorage.removeItem('tourvoyage_current_user');
        checkUserStatus();
        showToast('Tizimdan chiqdingiz', 'info');
    }
}

// ==================== PROFIL TIZIMI ====================

function showProfileModal() {
    if (!currentUser) return;
    
    // Profil ma'lumotlarini to'ldirish
    const profileUserName = document.getElementById('profileUserName');
    const profileUserEmail = document.getElementById('profileUserEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileUserName) profileUserName.textContent = currentUser.name;
    if (profileUserEmail) profileUserEmail.textContent = currentUser.email;
    if (profileAvatar) profileAvatar.src = currentUser.avatar || 'https://via.placeholder.com/150';
    
    // Bronlar statistikasini hisoblash
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const userBookings = bookings.filter(b => b.userId === currentUser.id);
    const totalSpent = userBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    
    const totalBookingsCount = document.getElementById('totalBookingsCount');
    const totalSpentAmount = document.getElementById('totalSpentAmount');
    
    if (totalBookingsCount) totalBookingsCount.textContent = userBookings.length;
    if (totalSpentAmount) totalSpentAmount.textContent = `$${totalSpent}`;
    
    // Bronlar ro'yxatini to'ldirish
    const bookingsList = document.getElementById('userBookingsList');
    if (bookingsList) {
        bookingsList.innerHTML = '';
        
        if (userBookings.length === 0) {
            bookingsList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="fas fa-suitcase fa-2x text-muted mb-3"></i>
                        <p class="text-muted">Hozircha bronlar mavjud emas</p>
                    </td>
                </tr>
            `;
        } else {
            userBookings.forEach((booking, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${booking.tourName}</td>
                    <td>${new Date(booking.date).toLocaleDateString('uz-UZ')}</td>
                    <td>$${booking.price}</td>
                    <td><span class="badge bg-success">${booking.status}</span></td>
                `;
                bookingsList.appendChild(row);
            });
        }
    }
    
    // Avatar yuklash
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                
                // Profil rasmini yangilash
                const profileAvatar = document.getElementById('profileAvatar');
                const userAvatarNav = document.getElementById('userAvatarNav');
                
                if (profileAvatar) profileAvatar.src = imageUrl;
                if (userAvatarNav) userAvatarNav.src = imageUrl;
                
                // Saqlash
                currentUser.avatar = imageUrl;
                localStorage.setItem('tourvoyage_current_user', JSON.stringify(currentUser));
                
                // Users ro'yxatini yangilash
                const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].avatar = imageUrl;
                    localStorage.setItem('tourvoyage_users', JSON.stringify(users));
                }
                
                showToast('Profil rasmi yangilandi!', 'success');
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Profilni tahrirlash
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            const newName = prompt('Yangi ism:', currentUser.name);
            if (newName && newName.trim()) {
                currentUser.name = newName.trim();
                localStorage.setItem('tourvoyage_current_user', JSON.stringify(currentUser));
                
                // Users ro'yxatini yangilash
                const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].name = newName.trim();
                    localStorage.setItem('tourvoyage_users', JSON.stringify(users));
                }
                
                // Sahifani yangilash
                const profileUserName = document.getElementById('profileUserName');
                const userNameNav = document.getElementById('userNameNav');
                
                if (profileUserName) profileUserName.textContent = newName;
                if (userNameNav) userNameNav.textContent = newName;
                
                showToast('Profil yangilandi!', 'success');
            }
        });
    }
    
    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
    profileModal.show();
}

function showMyBookings() {
    // Profil modalida bronlar ko'rsatiladi
    showProfileModal();
}

// ==================== LIVE CHAT ====================

function openLiveChat() {
    if (!currentUser) {
        showToast('Iltimos, avval tizimga kiring!', 'warning');
        showLoginModal();
        return;
    }
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    // Chat tarixini yuklash
    const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
    const userChat = chatHistory.filter(c => c.userId == currentUser.id);
    
    // Sort by timestamp
    userChat.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    userChat.forEach(chat => {
        addChatMessage(chat.sender, chat.message, chat.timestamp);
    });
    
    // Yangi xabar yuborish
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendChatBtn) {
        sendChatBtn.onclick = function() {
            sendChatMessageToAdmin();
        };
    }
    
    if (chatInput) {
        chatInput.onkeypress = function(e) {
            if (e.key === 'Enter') sendChatMessageToAdmin();
        };
    }
    
    const chatModal = new bootstrap.Modal(document.getElementById('liveChatModal'));
    chatModal.show();
    
    // Avtomatik salomlashish
    setTimeout(() => {
        if (chatMessages.children.length === 0) {
            const welcomeMessage = `Salom ${currentUser.name}! Men TourVoyage administratoriman. Sizga qanday yordam bera olaman?`;
            addChatMessage('admin', welcomeMessage, new Date().toISOString());
            
            // Saqlash
            const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
            chatHistory.push({
                id: Date.now(),
                userId: currentUser.id,
                sender: 'admin',
                message: welcomeMessage,
                timestamp: new Date().toISOString(),
                readByUser: false
            });
            localStorage.setItem('tourvoyage_chat', JSON.stringify(chatHistory));
        }
    }, 500);
    
    // Scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function sendChatMessageToAdmin() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput ? chatInput.value.trim() : '';
    
    if (!message) return;
    
    // Xabarni ko'rsatish
    addChatMessage('user', message, new Date().toISOString());
    
    // Inputni tozalash
    if (chatInput) chatInput.value = '';
    
    // Saqlash
    const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
    chatHistory.push({
        id: Date.now(),
        userId: currentUser.id,
        sender: 'user',
        message: message,
        timestamp: new Date().toISOString(),
        readByAdmin: false
    });
    localStorage.setItem('tourvoyage_chat', JSON.stringify(chatHistory));
    
    // Admin uchun notifikatsiya
    const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
    notifications.push({
        id: Date.now(),
        userId: 'admin',
        title: 'Yangi chat xabari',
        message: `${currentUser.name}: ${message.substring(0, 50)}...`,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
    
    // Avtomatik javob
    setTimeout(() => {
        const responses = [
            "Xabaringizni qabul qildik. Tez orada javob beramiz!",
            "Rahmat! Qiziqishingiz uchun minnatdormiz. Sizga qanday yordam bera olaman?",
            "Tur paketlarimiz haqida qo'shimcha ma'lumot kerak bo'lsa, ayting!",
            "Xabaringiz administratorga yuborildi. Tez orada aloqaga chiqamiz."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('admin', response, new Date().toISOString());
        
        chatHistory.push({
            id: Date.now(),
            userId: currentUser.id,
            sender: 'admin',
            message: response,
            timestamp: new Date().toISOString(),
            readByUser: false
        });
        localStorage.setItem('tourvoyage_chat', JSON.stringify(chatHistory));
    }, 2000);
}

function addChatMessage(sender, message, timestamp) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messageDiv.innerHTML = `
        <div class="message-content">
            <div>${message}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==================== YORDAMCHI FUNKSIYALAR ====================

function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' :
                 type === 'error' ? '✗' :
                 type === 'warning' ? '⚠' : 'ℹ';
    
    toast.innerHTML = `
        <span style="font-weight: bold; font-size: 1.2rem; margin-right: 10px;">${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createDemoData() {
    // Agar ma'lumotlar mavjud bo'lmasa, demo yaratish
    if (!localStorage.getItem('tourvoyage_users')) {
        const demoUsers = [
            {
                id: 1,
                name: "Komron Qudratov",
                email: "qudratovkomron2004@gmail.com",
                phone: "+998505035704",
                password: "123456",
                avatar: "https://via.placeholder.com/150",
                registered: new Date().toISOString()
            }
        ];
        localStorage.setItem('tourvoyage_users', JSON.stringify(demoUsers));
    }
    
    if (!localStorage.getItem('tourvoyage_tours')) {
        const defaultTours = [
            {
                id: 1,
                name: "Istanbul - Turkiya",
                description: "Istanbulning ajoyib diqqatga sazovor joylariga sayohat.",
                price: 450,
                duration: "5 kun / 4 kecha",
                image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "City Tour",
                rating: 4.8,
                spots: 15,
                created: "2024-01-01"
            },
            {
                id: 2,
                name: "Dubai - BAA",
                description: "Dunyoning eng baland binosi Burj Khalifa va zamonaviy shahar manzaralari.",
                price: 850,
                duration: "7 kun / 6 kecha",
                image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Luxury",
                rating: 4.9,
                spots: 10,
                created: "2024-01-02"
            },        {
            id: 3,
            name: "Shveytsariya - Alp tog'lari",
            description: "Shveytsariya Alp tog'lari va ko'llariga ajoyib sayohat.",
            price: 1500,
            duration: "8 kun / 7 kecha",
            image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Luxury",
            rating: 4.9,
            spots: 12,
            created: "2024-01-03"
        },
        {
            id: 4,
            name: "Kanada - Milliy bog'lar",
            description: "Kanadaning tabiiy go'zalliklarini kashf eting.",
            price: 1200,
            duration: "10 kun / 9 kecha",
            image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Nature Tour",
            rating: 4.7,
            spots: 15,
            created: "2024-01-04"
        },
        {
            id: 5,
            name: "Avstraliya - Sirtmo'shuq",
            description: "Avstraliya sirtmo'shuqlari va Buyalari bilan tanishish.",
            price: 1300,
            duration: "9 kun / 8 kecha",
            image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Adventure",
            rating: 4.8,
            spots: 10,
            created: "2024-01-05"
        },
        {
            id: 6,
            name: "Yaponiya - An'ana va Texnologiya",
            description: "Yaponiyaning qadimiy an'analari va zamonaviy texnologiyalari.",
            price: 1100,
            duration: "7 kun / 6 kecha",
            image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Cultural",
            rating: 4.9,
            spots: 14,
            created: "2024-01-06"
        },
        {
            id: 7,
            name: "Germaniya - Tarixiy shaharlar",
            description: "Germaniyaning boy tarixiy merosini o'rganing.",
            price: 900,
            duration: "6 kun / 5 kecha",
            image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "City Tour",
            rating: 4.6,
            spots: 18,
            created: "2024-01-07"
        },
        {
            id: 8,
            name: "Birlashgan Qirollik - Qal'alar",
            description: "London va Shotlandiya qal'alariga ajoyib sayohat.",
            price: 950,
            duration: "7 kun / 6 kecha",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Royal & History",
            rating: 4.7,
            spots: 16,
            created: "2024-01-08"
        },
        {
            id: 9,
            name: "Singapur - Kelajak shahri",
            description: "Dunyoning eng zamonaviy shahri Singapurga sayohat.",
            price: 800,
            duration: "5 kun / 4 kecha",
            image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Modern City",
            rating: 4.8,
            spots: 20,
            created: "2024-01-09"
        },
        {
            id: 10,
            name: "Norvegiya - Fiordlar",
            description: "Norvegiya fiordlari va shimol yog'dusilarini tomosha qiling.",
            price: 1400,
            duration: "9 kun / 8 kecha",
            image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Fjord & Aurora",
            rating: 4.9,
            spots: 10,
            created: "2024-01-10"
        }
        ];
        localStorage.setItem('tourvoyage_tours', JSON.stringify(defaultTours));
    }
}

function getDefaultTours() {
    return [
        {
            id: 1,
            name: "Istanbul - Turkiya",
            description: "Istanbulning ajoyib diqqatga sazovor joylariga sayohat.",
            price: 450,
            duration: "5 kun / 4 kecha",
            image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "City Tour",
            rating: 4.8,
            spots: 15,
            created: "2024-01-01"
        },
        {
            id: 2,
            name: "Dubai - BAA",
            description: "Dunyoning eng baland binosi Burj Khalifa va zamonaviy shahar manzaralari.",
            price: 850,
            duration: "7 kun / 6 kecha",
            image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Luxury",
            rating: 4.9,
            spots: 10,
            created: "2024-01-02"
        },        {
            id: 3,
            name: "Shveytsariya - Alp tog'lari",
            description: "Shveytsariya Alp tog'lari va ko'llariga ajoyib sayohat.",
            price: 1500,
            duration: "8 kun / 7 kecha",
            image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Luxury",
            rating: 4.9,
            spots: 12,
            created: "2024-01-03"
        },
        {
            id: 4,
            name: "Kanada - Milliy bog'lar",
            description: "Kanadaning tabiiy go'zalliklarini kashf eting.",
            price: 1200,
            duration: "10 kun / 9 kecha",
            image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Nature Tour",
            rating: 4.7,
            spots: 15,
            created: "2024-01-04"
        },
        {
            id: 5,
            name: "Avstraliya - Sirtmo'shuq",
            description: "Avstraliya sirtmo'shuqlari va Buyalari bilan tanishish.",
            price: 1300,
            duration: "9 kun / 8 kecha",
            image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Adventure",
            rating: 4.8,
            spots: 10,
            created: "2024-01-05"
        },
        {
            id: 6,
            name: "Yaponiya - An'ana va Texnologiya",
            description: "Yaponiyaning qadimiy an'analari va zamonaviy texnologiyalari.",
            price: 1100,
            duration: "7 kun / 6 kecha",
            image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Cultural",
            rating: 4.9,
            spots: 14,
            created: "2024-01-06"
        },
        {
            id: 7,
            name: "Germaniya - Tarixiy shaharlar",
            description: "Germaniyaning boy tarixiy merosini o'rganing.",
            price: 900,
            duration: "6 kun / 5 kecha",
            image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "City Tour",
            rating: 4.6,
            spots: 18,
            created: "2024-01-07"
        },
        {
            id: 8,
            name: "Birlashgan Qirollik - Qal'alar",
            description: "London va Shotlandiya qal'alariga ajoyib sayohat.",
            price: 950,
            duration: "7 kun / 6 kecha",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Royal & History",
            rating: 4.7,
            spots: 16,
            created: "2024-01-08"
        },
        {
            id: 9,
            name: "Singapur - Kelajak shahri",
            description: "Dunyoning eng zamonaviy shahri Singapurga sayohat.",
            price: 800,
            duration: "5 kun / 4 kecha",
            image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Modern City",
            rating: 4.8,
            spots: 20,
            created: "2024-01-09"
        },
        {
            id: 10,
            name: "Norvegiya - Fiordlar",
            description: "Norvegiya fiordlari va shimol yog'dusilarini tomosha qiling.",
            price: 1400,
            duration: "9 kun / 8 kecha",
            image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Fjord & Aurora",
            rating: 4.9,
            spots: 10,
            created: "2024-01-10"
        }
    ];
}
// ==================== AI CHAT TIZIMI ====================

function setupAIChat() {
    const aiChatButton = document.getElementById('aiChatButton');
    if (aiChatButton) {
        aiChatButton.addEventListener('click', openAIChat);
    }
}

function openAIChat() {
    const chatMessages = document.getElementById('aiChatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    // AI ga salomlashish
    const greeting = currentUser ? 
        `Salom ${currentUser.name}! Men TourVoyage AI assistentiman. Sizga qanday yordam bera olaman?` :
        "Salom! Men TourVoyage AI assistentiman. Sizga qanday yordam bera olaman?";
    
    addAIMessage('ai', greeting);
    
    // Xabar yuborish
    const sendAIChatBtn = document.getElementById('sendAIChatBtn');
    const aiChatInput = document.getElementById('aiChatInput');
    
    if (sendAIChatBtn) {
        sendAIChatBtn.onclick = function() {
            sendAIMessage();
        };
    }
    
    if (aiChatInput) {
        aiChatInput.onkeypress = function(e) {
            if (e.key === 'Enter') sendAIMessage();
        };
    }
    
    const chatModal = new bootstrap.Modal(document.getElementById('aiChatModal'));
    chatModal.show();
    
    // Inputni focus qilish
    setTimeout(() => {
        if (aiChatInput) aiChatInput.focus();
    }, 500);
}

function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input ? input.value.trim() : '';
    
    if (!message) return;
    
    // Foydalanuvchi xabarini ko'rsatish
    addAIMessage('user', message);
    
    // Inputni tozalash va focus qilish
    if (input) {
        input.value = '';
        input.focus();
    }
    
    // AI javobini olish
    setTimeout(() => {
        const response = generateAIResponse(message);
        addAIMessage('ai', response);
    }, 1000);
}

function addAIMessage(sender, message) {
    const chatMessages = document.getElementById('aiChatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // Sender icon qo'shish
    const icon = sender === 'ai' ? 
        '<div class="ai-icon me-2" style="color: #667eea;"><i class="fas fa-robot"></i></div>' : 
        '<div class="user-icon me-2" style="color: #28a745;"><i class="fas fa-user"></i></div>';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="d-flex align-items-start">
                ${icon}
                <div style="flex: 1;">
                    <div>${message}</div>
                    <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(question) {
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    const userName = currentUser ? currentUser.name : "mehmon";
    
    const questionLower = question.toLowerCase();
    
    // Tur paketlar haqida
    if (questionLower.includes('qaysi') && (questionLower.includes('tur') || questionLower.includes('sayohat'))) {
        const tourNames = tours.map(t => t.name).join(', ');
        return `${userName}, bizda quyidagi tur paketlar mavjud: ${tourNames}. Qaysi biri haqida ma'lumot kerak?`;
    }
    
    // Narx haqida
    if (questionLower.includes('narx') || questionLower.includes('qancha') || questionLower.includes('arzon')) {
        const sortedTours = [...tours].sort((a, b) => a.price - b.price);
        const cheapest = sortedTours[0];
        const expensive = sortedTours[sortedTours.length - 1];
        return `Eng arzon tur: ${cheapest.name} - $${cheapest.price}. Eng qimmat tur: ${expensive.name} - $${expensive.price}.`;
    }
    
    // Istanbul haqida
    if (questionLower.includes('istanbul')) {
        return `${userName}, Istanbul Turkiyaning eng mashhur shahri. Bu shahar tarixiy ahamiyatga ega bo'lgan joylar, masalan: Ayasofya, Sultonahmet masjidi, Topkapi saroyi bilan mashhur. Bizning Istanbul turi 5 kun davom etadi va narxi $450.`;
    }
    
    // Dubai haqida
    if (questionLower.includes('dubai')) {
        return `${userName}, Dubai - Bu Birlashgan Arab Amirliklaridagi eng zamonaviy shahar. Burj Khalifa - dunyoning eng baland binosi, Dubai mol - sun'iy orol, va Burj Al Arab - 7 yulduzli mehmonxona bilan mashhur. Dubai turi 7 kun davom etadi va narxi $850.`;
    }
    
    // Viza haqida
    if (questionLower.includes('viza') || questionLower.includes('viz')) {
        return `Viza talablari sayohat mamlakatiga qarab farq qiladi. Turkiyaga O'zbekiston fuqarolari uchun viza talab qilinmaydi. Dubai uchun elektron viza (eVisa) kerak, biz buni bron qilishda yordam beramiz.`;
    }
    
    // Bron qilish
    if (questionLower.includes('bron') || questionLower.includes('sotib') || questionLower.includes('qilish')) {
        return `Bron qilish uchun avval tizimga kiring yoki ro'yxatdan o'ting. Keyin istalgan tur paketni tanlang va "Bron qilish" tugmasini bosing. To'lov amalga oshirilgach, sizning broningiz tasdiqlanadi.`;
    }
    
    // To'lov usullari
    if (questionLower.includes('to\'lov') || questionLower.includes('tulov') || questionLower.includes('karta')) {
        return `Biz quyidagi to'lov usullarini qabul qilamiz: Kredit karta (Visa, MasterCard), Payme, Click. Barcha to'lovlar xavfsiz va kafolatlangan.`;
    }
    
    // Kontakt ma'lumotlari
    if (questionLower.includes('kontakt') || questionLower.includes('aloqa') || questionLower.includes('telefon')) {
        return `Biz bilan bog'lanish uchun:\n📞 Telefon: +998 50 503 57 04\n📧 Email: qudratovkomron2004@gmail.com\n📍 Manzil: Samarqand shahri, O'zbekiston`;
    }
    
    // Ish vaqti
    if (questionLower.includes('ish vaqti') || questionLower.includes('qachon') || questionLower.includes('soat')) {
        return `Ish vaqtimiz:\n📅 Dushanba-Juma: 9:00 - 18:00\n📅 Shanba: 10:00 - 16:00\n📅 Yakshanba: Dam olish kuni`;
    }
    
    // Kechikish va bekor qilish
    if (questionLower.includes('bekor') || questionLower.includes('kechikish') || questionLower.includes('qaytarish')) {
        return `Bronni bekor qilish qoidalari:\n- Bron qilingandan 7 kun ichida 100% qaytarish\n- 3-7 kun ichida 50% qaytarish\n- 3 kundan kam vaqt qolganda qaytarish qilinmaydi\nKechikish holatida tez orada aloqaga chiqishingizni tavsiya qilamiz.`;
    }
    
    // Yordam
    if (questionLower.includes('yordam') || questionLower.includes('help') || questionLower.includes('qanday')) {
        return `Menga quyidagi mavzularda savol bering:\n🔹 Tur paketlar\n🔹 Narxlar\n🔹 Viza masalalari\n🔹 Bron qilish tartibi\n🔹 To'lov usullari\n🔹 Kontakt ma'lumotlari`;
    }
    
    // Salomlashish
    if (questionLower.includes('salom') || questionLower.includes('hello') || questionLower.includes('hi') || 
        questionLower.includes('assalom') || questionLower.includes('привет')) {
        return `Assalomu alaykum ${userName}! 😊 TourVoyage AI assistentiga xush kelibsiz! Sizga qanday yordam bera olaman?`;
    }
    
    // Rahmat
    if (questionLower.includes('rahmat') || questionLower.includes('thanks') || questionLower.includes('thank')) {
        const responses = [
            `Har qanday vaqt ${userName}! 😊`,
            `Sizga yordam bera olganimdan xursandman!`,
            `Yana savolingiz bo'lsa, menga murojaat qiling!`,
            `Sayohatingiz yoqimli bo'lsin! ✈️`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Xayrlashish
    if (questionLower.includes('xayr') || questionLower.includes('goodbye') || questionLower.includes('bye') || 
        questionLower.includes('пока') || questionLower.includes('до свидания')) {
        return `Xayr, ${userName}! Yana ko'rishguncha! 😊 TourVoyage bilan dunyoni kashf eting!`;
    }
    
    // Umumiy javoblar
    const responses = [
        `${userName}, men sizning savolingizni to'liq tushunmadim. Iltimos, batafsilroq so'rang yoki quyidagi mavzulardan birini tanlang: tur paketlar, narxlar, bron qilish, viza masalalari.`,
        `Men TourVoyage AI assistentiman va faqat sayohatga oid savollarga javob bera olaman. Iltimos, savolingizni qayta bering.`,
        `${userName}, sizga qanday yordam bera olishim mumkin? Tur paketlarimiz haqida ma'lumot kerak bo'lsa, ayting!`,
        `TourVoyage sifatli sayohat xizmatlarini taqdim etadi. Biz sizga eng yaxshi tur paketlarni tanlashda yordam beramiz.`,
        `Sayohat rejalaringiz haqida gapiraylik! Qaysi davlatga sayohat qilishni xohlaysiz?`,
        `${userName}, bizning tur paketlarimiz Istanbul, Dubai va boshqa mashhur shaharlarni o'z ichiga oladi. Qaysi tur sizni qiziqtiradi?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// ==================== EVENT LISTENERLAR ====================

function setupEventListeners() {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showToast('Iltimos, barcha maydonlarni to\'ldiring!', 'warning');
        return;
    }
    
    // Contact ma'lumotlarini saqlash
    const contacts = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
    const newContact = {
        id: Date.now(),
        name: name,
        email: email,
        message: message,
        date: new Date().toISOString(),
        status: 'yangi'
    };
    
    contacts.push(newContact);
    localStorage.setItem('tourvoyage_contacts', JSON.stringify(contacts));
    
    // Admin uchun notifikatsiya
    addNotification('admin', 'Yangi kontakt xabari', `${name} dan yangi xabar: ${message.substring(0, 50)}...`);
    
    // Formani tozalash
    e.target.reset();
    
    showToast('Xabaringiz muvaffaqiyatli yuborildi! Tez orada aloqaga chiqamiz.', 'success');
}

// ==================== TIL TANLASH ====================

function setupLanguageSelector() {
    const languageBtn = document.getElementById('languageToggle');
    const languageText = document.getElementById('currentLanguage');
    
    if (!languageBtn || !languageText) return;
    
    // Joriy tilni o'rnatish
    const languages = {
        'uz': 'O\'zbekcha',
        'ru': 'Русский',
        'en': 'English'
    };
    
    languageText.textContent = languages[currentLanguage] || 'O\'zbekcha';
    
    languageBtn.addEventListener('click', function() {
        if (currentLanguage === 'uz') currentLanguage = 'ru';
        else if (currentLanguage === 'ru') currentLanguage = 'en';
        else currentLanguage = 'uz';
        
        localStorage.setItem('tourvoyage_language', currentLanguage);
        languageText.textContent = languages[currentLanguage];
        
        showToast(`Til ${languages[currentLanguage]} tiliga o'zgartirildi`, 'success');
        
        // Sahifa elementlarini yangilash
        updatePageLanguage();
    });
}

function updatePageLanguage() {
    // Bu yerda sahifadagi barcha matnlarni tarjima qilishingiz mumkin
    // Misol uchun:
    const translations = {
        'uz': {
            'heroTitle': 'Biz bilan dunyoni kashf qiling',
            'tourButton': 'Tur paketlarini ko\'rish'
        },
        'ru': {
            'heroTitle': 'Откройте мир с нами',
            'tourButton': 'Посмотреть турпакеты'
        },
        'en': {
            'heroTitle': 'Discover the World with Us',
            'tourButton': 'View Tour Packages'
        }
    };
    
    const trans = translations[currentLanguage];
    if (trans) {
        // Elementlarni yangilash
        const heroTitle = document.querySelector('.hero-section h1');
        if (heroTitle) heroTitle.textContent = trans.heroTitle;
        
        const tourButton = document.querySelector('.hero-section .btn span');
        if (tourButton) tourButton.textContent = trans.tourButton;
    }
}

// ==================== OB-HAVO MA'LUMOTLARI ====================

function loadWeatherInfo() {
    const weatherContainer = document.getElementById('weather-info');
    if (!weatherContainer) return;
    
    const weatherData = [
        {
            city: "Istanbul, Turkiya",
            temp: "24°C",
            condition: "Quyoshli",
            humidity: "65%",
            wind: "10 km/soat",
            icon: "fas fa-sun",
            color: "bg-warning"
        },
        {
            city: "Dubai, BAA",
            temp: "35°C",
            condition: "Issiq",
            humidity: "45%",
            wind: "15 km/soat",
            icon: "fas fa-sun",
            color: "bg-danger"
        },
        {
            city: " Qatar",
            temp: "40°C",
            condition: "Issiq",
            humidity: "45%",
            wind: "15 km/soat",
            icon: "fas fa-sun",
            color: "bg-danger"
        }
    ];
    
    weatherContainer.innerHTML = '';
    weatherData.forEach(weather => {
        const weatherCard = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">${weather.city}</h5>
                            <div class="${weather.color} text-white p-2 rounded-circle">
                                <i class="${weather.icon}"></i>
                            </div>
                        </div>
                        
                        <div class="weather-details">
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-thermometer-half me-2 text-primary"></i>
                                <span>Harorat: <strong>${weather.temp}</strong></span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-cloud me-2 text-info"></i>
                                <span>Holat: <strong>${weather.condition}</strong></span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-tint me-2 text-info"></i>
                                <span>Namlik: <strong>${weather.humidity}</strong></span>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-wind me-2 text-success"></i>
                                <span>Shamol: <strong>${weather.wind}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        weatherContainer.innerHTML += weatherCard;
    });
}

// ==================== NOTIFIKATSIYALAR ====================

function updateNotifications() {
    const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
    const unreadCount = notifications.filter(n => !n.read && 
        (n.userId === 'all' || (currentUser && n.userId === currentUser.id))).length;
    
    const badge = document.getElementById('notificationCount');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function addNotification(userId, title, message) {
    const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
    const newNotification = {
        id: Date.now(),
        userId: userId,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(newNotification);
    localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
    updateNotifications();
    
    // Real-time bildirishnoma
    if ((userId === 'all' || (currentUser && userId === currentUser.id)) && !newNotification.read) {
        showToast(title, 'info');
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    
    return past.toLocaleDateString();
}

// ==================== AI CHAT STYLES ====================

// CSS qo'shish
const aiChatStyles = `
    .ai-chat-button {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        z-index: 1000;
        animation: pulse 2s infinite;
    }
    
    .ai-chat-button:hover {
        transform: scale(1.1) rotate(10deg);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
        100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
    }
    
    .ai-icon {
        color: #667eea;
        font-size: 1.2rem;
    }
    
    .user-icon {
        color: #28a745;
        font-size: 1.2rem;
    }
`;


// CSS qo'shish
const styleElement = document.createElement('style');
styleElement.textContent = aiChatStyles;
document.head.appendChild(styleElement);

// Qolgan funksiyalar (setupEventListeners, setupLanguageSelector, setupAIChat, setupContactForm, loadWeatherInfo, updateNotifications, addNotification, getTimeAgo) oldingi kabi qolsin</script>
