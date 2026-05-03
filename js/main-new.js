// ==================== ASOSIY DAVLATLAR ====================
let currentUser = null;
let currentLanguage = localStorage.getItem('tourvoyage_language') || 'uz';

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    // Foydalanuvchi holatini tekshirish
    await checkUserStatus();
    
    // Ma'lumotlarni yuklash
    await loadTourPackages();
    loadWeatherInfo();
    await updateNotifications();
    
    // Event listenerlarni sozlash
    setupEventListeners();
    
    // Til tanlashni sozlash
    setupLanguageSelector();
    
    // AI Chat sozlash
    setupAIChat();
    
    // Contact form sozlash
    setupContactForm();
}

// ==================== USER AUTHENTICATION ====================

async function checkUserStatus() {
    const token = localStorage.getItem('tourvoyage_token');
    const savedUser = localStorage.getItem('tourvoyage_user');
    
    if (token && savedUser) {
        try {
            // Verify token with server
            const response = await api.auth.getProfile();
            currentUser = response.user;
            updateUserUI();
        } catch (error) {
            // Token invalid, remove saved data
            localStorage.removeItem('tourvoyage_token');
            localStorage.removeItem('tourvoyage_user');
            currentUser = null;
            updateUserUI();
        }
    } else {
        updateUserUI();
    }
}

function updateUserUI() {
    const authButtonsContainer = document.getElementById('authButtonsContainer');
    const userMenuContainer = document.getElementById('userMenuContainer');
    const userNameNav = document.getElementById('userNameNav');
    const userAvatarNav = document.getElementById('userAvatarNav');
    
    if (currentUser) {
        // Show user menu, hide auth buttons
        authButtonsContainer.style.display = 'none';
        userMenuContainer.style.display = 'block';
        
        if (userNameNav) userNameNav.textContent = currentUser.name;
        if (userAvatarNav && currentUser.avatar_url) {
            userAvatarNav.src = currentUser.avatar_url;
        }
    } else {
        // Show auth buttons, hide user menu
        authButtonsContainer.style.display = 'block';
        userMenuContainer.style.display = 'none';
    }
}

async function login(email, password) {
    try {
        const response = await api.auth.login({ email, password });
        
        // Save token and user data
        localStorage.setItem('tourvoyage_token', response.token);
        localStorage.setItem('tourvoyage_user', JSON.stringify(response.user));
        
        currentUser = response.user;
        updateUserUI();
        
        // Close login modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) loginModal.hide();
        
        showAlert('Muvaffaqiyatli kirish!', 'success');
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Kirishda xatolik'), 'danger');
    }
}

async function register(userData) {
    try {
        const response = await api.auth.register(userData);
        
        // Save token and user data
        localStorage.setItem('tourvoyage_token', response.token);
        localStorage.setItem('tourvoyage_user', JSON.stringify(response.user));
        
        currentUser = response.user;
        updateUserUI();
        
        // Close register modal
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        if (registerModal) registerModal.hide();
        
        showAlert("Ro'yxatdan o'tish muvaffaqiyatli!", 'success');
        
    } catch (error) {
        showAlert(api.handleAPIError(error, "Ro'yxatdan o'tishda xatolik"), 'danger');
    }
}

function logout() {
    localStorage.removeItem('tourvoyage_token');
    localStorage.removeItem('tourvoyage_user');
    currentUser = null;
    updateUserUI();
    showAlert('Tizimdan chiqdingiz', 'info');
}

// ==================== TUR PAKETLARI ====================

async function loadTourPackages() {
    const toursContainer = document.getElementById('tour-packages');
    if (!toursContainer) return;
    
    try {
        const response = await api.tours.getAll({ limit: 20 });
        const tours = response.tours || [];
        
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
                    <img src="${tour.image_url || 'https://via.placeholder.com/300x200?text=Tour+Image'}" 
                         class="card-img-top" alt="${tour.name}" 
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title tour-name">${tour.name}</h5>
                        <p class="card-text flex-grow-1">${tour.description || 'Sayohat tavsifi'}</p>
                        <div class="mb-3">
                            <p class="mb-1"><i class="fas fa-clock me-2"></i>${tour.duration || '5 kun / 4 kecha'}</p>
                            <p class="mb-1"><i class="fas fa-users me-2"></i>Bo'sh joylar: ${tour.available_spots || 10}</p>
                            <p class="mb-1 tour-rating">
                                <i class="fas fa-star"></i> 4.5/5
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
        
    } catch (error) {
        console.error('Error loading tours:', error);
        toursContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-muted">Tur paketlarini yuklashda xatolik</h4>
                <p class="text-muted">${api.handleAPIError(error)}</p>
            </div>
        `;
    }
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
    if (!currentUser) {
        showAlert('Iltimos avval tizimga kiring', 'warning');
        // Open login modal
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }
    
    try {
        // Get tour details
        const response = await api.tours.getById(tourId);
        const tour = response.tour;
        
        // Show booking modal
        showBookingModal(tour);
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Tur ma\'lumotlarini olishda xatolik'), 'danger');
    }
}

function showBookingModal(tour) {
    const modalHtml = `
        <div class="modal fade" id="bookingModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Tur bron qilish</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <h6>${tour.name}</h6>
                            <p class="text-muted">${tour.description}</p>
                            <p><strong>Narx:</strong> $${tour.price} / kishi</p>
                            <p><strong>Davomiyligi:</strong> ${tour.duration}</p>
                        </div>
                        <form id="bookingForm">
                            <div class="mb-3">
                                <label for="travelDate" class="form-label">Sayohat sanasi</label>
                                <input type="date" class="form-control" id="travelDate" required>
                            </div>
                            <div class="mb-3">
                                <label for="numberOfPeople" class="form-label">Kishilar soni</label>
                                <input type="number" class="form-control" id="numberOfPeople" min="1" max="${tour.available_spots}" value="1" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Jami narx:</label>
                                <h5 class="text-primary" id="totalPrice">$${tour.price}</h5>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Bekor qilish</button>
                        <button type="button" class="btn btn-primary" onclick="confirmBooking(${tour.id}, ${tour.price})">
                            Bron qilish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('bookingModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
    
    // Setup price calculation
    document.getElementById('numberOfPeople').addEventListener('input', function() {
        const people = parseInt(this.value);
        const totalPrice = tour.price * people;
        document.getElementById('totalPrice').textContent = `$${totalPrice}`;
    });
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('travelDate').min = today;
}

async function confirmBooking(tourId, pricePerPerson) {
    const travelDate = document.getElementById('travelDate').value;
    const numberOfPeople = parseInt(document.getElementById('numberOfPeople').value);
    
    if (!travelDate) {
        showAlert('Iltimos sayohat sanasini tanlang', 'warning');
        return;
    }
    
    try {
        const bookingData = {
            tour_id: tourId,
            travel_date: travelDate,
            number_of_people: numberOfPeople
        };
        
        const response = await api.bookings.create(bookingData);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        modal.hide();
        
        showAlert('Tur muvaffaqiyatli bron qilindi!', 'success');
        
        // Reload tours to update available spots
        await loadTourPackages();
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Bron qilishda xatolik'), 'danger');
    }
}

// ==================== CONTACT FORM ====================

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('contactMessage').value
        };
        
        try {
            await api.messages.send(formData);
            
            showAlert('Xabaringiz muvaffaqiyatli yuborildi!', 'success');
            contactForm.reset();
            
        } catch (error) {
            showAlert(api.handleAPIError(error, 'Xabar yuborishda xatolik'), 'danger');
        }
    });
}

// ==================== CHAT FUNCTIONALITY ====================

function setupAIChat() {
    const aiChatButton = document.getElementById('aiChatButton');
    if (!aiChatButton) return;
    
    aiChatButton.addEventListener('click', function() {
        // For now, open regular chat modal
        // In future, this could integrate with AI service
        openLiveChat();
    });
}

function openLiveChat() {
    if (!currentUser) {
        showAlert('Iltimos avval tizimga kiring', 'warning');
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }
    
    const chatModal = new bootstrap.Modal(document.getElementById('liveChatModal'));
    chatModal.show();
    
    // Load chat messages
    loadChatMessages();
}

async function loadChatMessages() {
    try {
        const response = await api.chat.getUserMessages(currentUser.id);
        const messages = response.messages || [];
        
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = '';
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${msg.sender_type === 'user' ? 'user-message' : 'admin-message'}`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <strong>${msg.sender_type === 'user' ? 'Siz' : 'Admin'}:</strong>
                    <p>${msg.message}</p>
                    <small class="text-muted">${new Date(msg.created_at).toLocaleString()}</small>
                </div>
            `;
            chatContainer.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    try {
        await api.chat.sendMessage({ message });
        
        chatInput.value = '';
        
        // Reload messages
        await loadChatMessages();
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Xabar yuborishda xatolik'), 'danger');
    }
}

// ==================== NOTIFICATIONS ====================

async function updateNotifications() {
    if (!currentUser) return;
    
    try {
        // Get unread messages count
        const messagesResponse = await api.messages.getUnreadCount();
        const messagesCount = messagesResponse.count || 0;
        
        // Get unread chat count
        const chatResponse = await api.chat.getUnreadCount();
        const chatCount = chatResponse.count || 0;
        
        const totalCount = messagesCount + chatCount;
        
        const notificationBadge = document.getElementById('notificationCount');
        if (notificationBadge) {
            if (totalCount > 0) {
                notificationBadge.textContent = totalCount;
                notificationBadge.style.display = 'inline-block';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error updating notifications:', error);
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Login/Register buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('loginModal'));
            modal.show();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('registerModal'));
            modal.show();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Live chat button
    const liveChatBtn = document.getElementById('liveChatBtn');
    if (liveChatBtn) {
        liveChatBtn.addEventListener('click', openLiveChat);
    }
    
    // Send chat message
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Profile view
    const viewProfile = document.getElementById('viewProfile');
    if (viewProfile) {
        viewProfile.addEventListener('click', showProfileModal);
    }
    
    // My bookings
    const myBookings = document.getElementById('myBookings');
    if (myBookings) {
        myBookings.addEventListener('click', showMyBookingsModal);
    }
}

// ==================== USER PROFILE ====================

async function showProfileModal() {
    if (!currentUser) return;
    
    try {
        // Get user booking stats
        const statsResponse = await api.bookings.getMyStats();
        const stats = statsResponse.stats;
        
        const modalHtml = `
            <div class="modal fade" id="profileModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="profile-header">
                            <div class="profile-avatar-container">
                                <img src="${currentUser.avatar_url || 'https://via.placeholder.com/150'}" alt="Profil rasmi" class="profile-avatar">
                                <div class="profile-avatar-change" onclick="document.getElementById('avatarInput').click()">
                                    <i class="fas fa-camera"></i>
                                </div>
                            </div>
                            <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                            <h4>${currentUser.name}</h4>
                            <p>${currentUser.email}</p>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="stats-card">
                                        <i class="fas fa-suitcase"></i>
                                        <h3>${stats.total_bookings || 0}</h3>
                                        <p>Jami bronlar</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="stats-card">
                                        <i class="fas fa-dollar-sign"></i>
                                        <h3>$${stats.total_spent || 0}</h3>
                                        <p>Jami sarflangan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Yopish</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('profileModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('profileModal'));
        modal.show();
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Profil ma\'lumotlarini olishda xatolik'), 'danger');
    }
}

// ==================== MY BOOKINGS ====================

async function showMyBookingsModal() {
    if (!currentUser) return;
    
    try {
        const response = await api.bookings.getMyBookings();
        const bookings = response.bookings || [];
        
        const modalHtml = `
            <div class="modal fade" id="myBookingsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Mening bronlarim</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tur</th>
                                            <th>Sana</th>
                                            <th>Narxi</th>
                                            <th>Holati</th>
                                            <th>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${bookings.map((booking, index) => `
                                            <tr>
                                                <td>${index + 1}</td>
                                                <td>${booking.tour_name}</td>
                                                <td>${new Date(booking.travel_date).toLocaleDateString()}</td>
                                                <td>$${booking.total_price}</td>
                                                <td><span class="badge bg-${getStatusColor(booking.status)}">${getStatusText(booking.status)}</span></td>
                                                <td>
                                                    ${booking.status === 'pending' || booking.status === 'confirmed' ? 
                                                        `<button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">Bekor qilish</button>` : 
                                                        '-'
                                                    }
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Yopish</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('myBookingsModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('myBookingsModal'));
        modal.show();
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Bronlarni olishda xatolik'), 'danger');
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Ushbu bronni bekor qilishni istaysizmi?')) return;
    
    try {
        await api.bookings.cancel(bookingId);
        
        showAlert('Bron muvaffaqiyatli bekor qilindi', 'success');
        
        // Reload bookings
        await showMyBookingsModal();
        
    } catch (error) {
        showAlert(api.handleAPIError(error, 'Bronni bekor qilishda xatolik'), 'danger');
    }
}

// ==================== HELPER FUNCTIONS ====================

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'success',
        'cancelled': 'danger',
        'completed': 'info'
    };
    return colors[status] || 'secondary';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Kutilmoqda',
        'confirmed': 'Tasdiqlangan',
        'cancelled': 'Bekor qilingan',
        'completed': 'Bajarilgan'
    };
    return texts[status] || status;
}

function showAlert(message, type = 'info') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert:last-of-type');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// ==================== LANGUAGE ====================

function setupLanguageSelector() {
    const languageToggle = document.getElementById('languageToggle');
    if (!languageToggle) return;
    
    languageToggle.addEventListener('click', function() {
        currentLanguage = currentLanguage === 'uz' ? 'en' : 'uz';
        localStorage.setItem('tourvoyage_language', currentLanguage);
        document.getElementById('currentLanguage').textContent = currentLanguage === 'uz' ? 'O\'zbekcha' : 'English';
        
        // In a real app, this would translate the UI
        // For now, just update the language indicator
    });
    
    document.getElementById('currentLanguage').textContent = currentLanguage === 'uz' ? 'O\'zbekcha' : 'English';
}

// ==================== WEATHER ====================

function loadWeatherInfo() {
    // This would integrate with a real weather API
    // For now, showing placeholder data
    const weatherContainer = document.getElementById('weather-info');
    if (!weatherContainer) return;
    
    const cities = [
        { name: 'Paris', temp: '18°C', condition: 'Cloudy' },
        { name: 'Dubai', temp: '35°C', condition: 'Sunny' },
        { name: 'Tokyo', temp: '22°C', condition: 'Clear' },
        { name: 'New York', temp: '15°C', condition: 'Rainy' }
    ];
    
    weatherContainer.innerHTML = cities.map(city => `
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="card text-center">
                <div class="card-body">
                    <h5 class="card-title">${city.name}</h5>
                    <p class="display-4">${city.temp}</p>
                    <p class="text-muted">${city.condition}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== LOGIN/REGISTER FORMS ====================

// These would be implemented with actual modals
// For now, they're placeholders that would be connected to the HTML

async function handleLoginForm(event) {
    event.preventDefault();
    
    const email = event.target.email.value;
    const password = event.target.password.value;
    
    await login(email, password);
}

async function handleRegisterForm(event) {
    event.preventDefault();
    
    const userData = {
        name: event.target.name.value,
        email: event.target.email.value,
        password: event.target.password.value,
        phone: event.target.phone.value
    };
    
    await register(userData);
}
