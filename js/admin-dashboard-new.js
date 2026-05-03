// ==================== ASOSIY DAVLATLAR ====================
let currentUser = null;
let currentSection = 'dashboard';
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    initAdminDashboard();
});

async function initAdminDashboard() {
    // Check admin authentication
    await checkAdminAuth();
    
    // Load initial data
    await loadDashboardData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup sidebar toggle
    setupSidebar();
    
    // Setup real-time updates
    setupRealTimeUpdates();
}

// ==================== AUTHENTICATION ====================

async function checkAdminAuth() {
    const token = localStorage.getItem('tourvoyage_token');
    const savedUser = localStorage.getItem('tourvoyage_user');
    
    if (!token || !savedUser) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        const response = await api.auth.getProfile();
        currentUser = response.user;
        
        if (currentUser.role !== 'admin') {
            localStorage.removeItem('tourvoyage_token');
            localStorage.removeItem('tourvoyage_user');
            window.location.href = 'admin-login.html';
            return;
        }
        
        updateAdminUI();
        
    } catch (error) {
        localStorage.removeItem('tourvoyage_token');
        localStorage.removeItem('tourvoyage_user');
        window.location.href = 'admin-login.html';
    }
}

function updateAdminUI() {
    const adminUsername = document.getElementById('adminUsername');
    const adminEmail = document.getElementById('adminEmail');
    
    if (adminUsername) adminUsername.textContent = currentUser.name;
    if (adminEmail) adminEmail.textContent = currentUser.email;
}

function logoutAdmin() {
    if (confirm('Admin paneldan chiqishni istaysizmi?')) {
        localStorage.removeItem('tourvoyage_token');
        localStorage.removeItem('tourvoyage_user');
        window.location.href = 'admin-login.html';
    }
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
    try {
        // Load all dashboard statistics
        await Promise.all([
            loadDashboardStats(),
            loadRecentActivity(),
            loadCharts(),
            updateNotificationCounts()
        ]);
        
        // Hide loading overlay
        hideLoading();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        hideLoading();
        showAlert(api.handleAPIError(error, 'Dashboard ma\'lumotlarini yuklashda xatolik'), 'danger');
    }
}

async function loadDashboardStats() {
    try {
        // Get booking stats
        const bookingStats = await api.bookings.getStats();
        document.getElementById('totalBookings').textContent = bookingStats.stats.total_bookings || 0;
        
        // Get message stats
        const messageStats = await api.messages.getStats();
        document.getElementById('totalMessages').textContent = messageStats.stats.unread_messages || 0;
        
        // Get user stats
        const userStats = await api.auth.getProfile(); // This would need a separate endpoint
        document.getElementById('totalUsers').textContent = '50'; // Placeholder
        
        // Calculate revenue
        document.getElementById('totalRevenue').textContent = `$${bookingStats.stats.total_revenue || 0}`;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadRecentActivity() {
    try {
        const recentBookings = await api.bookings.getRecent({ limit: 5 });
        const activityContainer = document.getElementById('recentActivity');
        
        if (!activityContainer) return;
        
        if (recentBookings.bookings.length === 0) {
            activityContainer.innerHTML = '<p class="text-muted">So\'nggi faoliyatlar yo\'q</p>';
            return;
        }
        
        activityContainer.innerHTML = recentBookings.bookings.map(booking => `
            <div class="activity-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${booking.user_name}</strong>
                        <span class="text-muted"> bron qildi:</span>
                        <span class="text-primary">${booking.tour_name}</span>
                    </div>
                    <small class="text-muted">${new Date(booking.created_at).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function loadCharts() {
    try {
        // Load monthly bookings chart
        await loadMonthlyBookingsChart();
        
        // Load tour popularity chart
        await loadTourPopularityChart();
        
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

async function loadMonthlyBookingsChart() {
    try {
        const response = await api.bookings.getMonthlyStats();
        const monthlyData = response.stats || [];
        
        const ctx = document.getElementById('monthlyBookingsChart');
        if (!ctx) return;
        
        // Prepare data for all months
        const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
        const data = new Array(12).fill(0);
        
        monthlyData.forEach(item => {
            const monthIndex = parseInt(item.month) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                data[monthIndex] = parseInt(item.booking_count);
            }
        });
        
        if (charts.monthlyBookings) {
            charts.monthlyBookings.destroy();
        }
        
        charts.monthlyBookings = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Bronlar soni',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading monthly bookings chart:', error);
    }
}

async function loadTourPopularityChart() {
    try {
        const response = await api.tours.getAll({ limit: 10 });
        const tours = response.tours || [];
        
        const ctx = document.getElementById('tourPopularityChart');
        if (!ctx) return;
        
        // For demo purposes, using random popularity data
        // In real implementation, this would come from booking data
        const tourNames = tours.slice(0, 5).map(tour => tour.name);
        const popularityData = tours.slice(0, 5).map(() => Math.floor(Math.random() * 20) + 5);
        
        if (charts.tourPopularity) {
            charts.tourPopularity.destroy();
        }
        
        charts.tourPopularity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: tourNames,
                datasets: [{
                    data: popularityData,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
    } catch (error) {
        console.error('Error loading tour popularity chart:', error);
    }
}

// ==================== SECTION MANAGEMENT ====================

function showDashboardSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked nav link
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    currentSection = sectionId;
    
    // Load section-specific data
    loadSectionData(sectionId);
}

async function loadSectionData(sectionId) {
    try {
        switch (sectionId) {
            case 'messages':
                await loadMessages();
                break;
            case 'notifications':
                await loadNotifications();
                break;
            case 'chat':
                await loadChatSessions();
                break;
            case 'bookings':
                await loadBookings();
                break;
            case 'tours':
                await loadTours();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'reports':
                await loadReports();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${sectionId} data:`, error);
        showAlert(api.handleAPIError(error), 'danger');
    }
}

// ==================== MESSAGES ====================

async function loadMessages() {
    try {
        const response = await api.messages.getAll();
        const messages = response.messages || [];
        
        const messagesContainer = document.getElementById('messagesList');
        if (!messagesContainer) return;
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p class="text-muted">Xabarlar mavjud emas</p>';
            return;
        }
        
        messagesContainer.innerHTML = messages.map(message => `
            <div class="message-item ${message.is_read ? 'read' : 'unread'}" data-id="${message.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6>${message.name} <small class="text-muted">(${message.email})</small></h6>
                        ${message.subject ? `<p class="mb-1"><strong>${message.subject}</strong></p>` : ''}
                        <p class="mb-1">${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}</p>
                        <small class="text-muted">${new Date(message.created_at).toLocaleString()}</small>
                    </div>
                    <div class="message-actions">
                        ${!message.is_read ? `<button class="btn btn-sm btn-success" onclick="markMessageAsRead(${message.id})"><i class="fas fa-check"></i></button>` : ''}
                        <button class="btn btn-sm btn-primary" onclick="viewMessage(${message.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMessage(${message.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function markMessageAsRead(messageId) {
    try {
        await api.messages.markAsRead(messageId);
        await loadMessages();
        await updateNotificationCounts();
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}

async function viewMessage(messageId) {
    try {
        const response = await api.messages.getById(messageId);
        const message = response.message;
        
        // Show message modal
        const modalHtml = `
            <div class="modal fade" id="messageViewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Xabar ma'lumotlari</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="message-details">
                                <h6>Yuboruvchi:</h6>
                                <p>${message.name}</p>
                                
                                <h6>Email:</h6>
                                <p>${message.email}</p>
                                
                                <h6>Xabar vaqti:</h6>
                                <p>${new Date(message.created_at).toLocaleString()}</p>
                                
                                ${message.subject ? `
                                    <h6>Mavzu:</h6>
                                    <p>${message.subject}</p>
                                ` : ''}
                                
                                <h6>Xabar matni:</h6>
                                <p style="white-space: pre-wrap;">${message.message}</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Yopish</button>
                            ${!message.is_read ? `<button type="button" class="btn btn-primary" onclick="markMessageAsRead(${message.id})">O'qilgan deb belgilash</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('messageViewModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('messageViewModal'));
        modal.show();
        
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Ushbu xabarni o\'chirishni istaysizmi?')) return;
    
    try {
        await api.messages.delete(messageId);
        await loadMessages();
        await updateNotificationCounts();
        showAlert('Xabar muvaffaqiyatli o\'chirildi', 'success');
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}

// ==================== TOURS ====================

async function loadTours() {
    try {
        const response = await api.tours.getAll();
        const tours = response.tours || [];
        
        const toursContainer = document.getElementById('adminToursList');
        if (!toursContainer) return;
        
        if (tours.length === 0) {
            toursContainer.innerHTML = '<p class="text-muted">Tur paketlar mavjud emas</p>';
            return;
        }
        
        toursContainer.innerHTML = tours.map(tour => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card">
                    <img src="${tour.image_url}" class="card-img-top" alt="${tour.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${tour.name}</h5>
                        <p class="card-text">${tour.description.substring(0, 100)}...</p>
                        <p><strong>Narx:</strong> $${tour.price}</p>
                        <p><strong>Davomiyligi:</strong> ${tour.duration}</p>
                        <p><strong>Bo'sh joylar:</strong> ${tour.available_spots}</p>
                        <div class="btn-group w-100">
                            <button class="btn btn-sm btn-primary" onclick="editTour(${tour.id})">Tahrirlash</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTour(${tour.id})">O'chirish</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

async function handleAddTourForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('tourName').value,
        description: document.getElementById('tourDescription').value,
        price: parseFloat(document.getElementById('tourPrice').value),
        duration: document.getElementById('tourDuration').value,
        image_url: document.getElementById('tourImage').value,
        destination: document.getElementById('tourDestination').value || 'Unknown',
        available_spots: parseInt(document.getElementById('tourSpots').value) || 20
    };
    
    try {
        await api.tours.create(formData);
        
        showAlert('Tur muvaffaqiyatli qo\'shildi', 'success');
        event.target.reset();
        
        // Reload tours
        await loadTours();
        
        // Switch to tours section
        showDashboardSection('tours');
        
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}

// ==================== BOOKINGS ====================

async function loadBookings() {
    try {
        const response = await api.bookings.getAll();
        const bookings = response.bookings || [];
        
        const bookingsContainer = document.getElementById('allBookings');
        if (!bookingsContainer) return;
        
        if (bookings.length === 0) {
            bookingsContainer.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Bronlar mavjud emas</td></tr>';
            return;
        }
        
        bookingsContainer.innerHTML = bookings.map((booking, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${booking.user_name}</td>
                <td>${booking.tour_name}</td>
                <td>${new Date(booking.travel_date).toLocaleDateString()}</td>
                <td>$${booking.total_price}</td>
                <td><span class="badge bg-${getBookingStatusColor(booking.status)}">${getBookingStatusText(booking.status)}</span></td>
                <td>
                    <select class="form-select form-select-sm" onchange="updateBookingStatus(${booking.id}, this.value)">
                        <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Kutilmoqda</option>
                        <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Tasdiqlangan</option>
                        <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Bekor qilingan</option>
                        <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Bajarilgan</option>
                    </select>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        await api.bookings.updateStatus(bookingId, status);
        showAlert('Bron holati muvaffaqiyatli yangilandi', 'success');
        await loadBookings();
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}

// ==================== CHAT ====================

async function loadChatSessions() {
    try {
        const response = await api.chat.getSessions();
        const sessions = response.sessions || [];
        
        const sessionsContainer = document.getElementById('chatSessionsList');
        if (!sessionsContainer) return;
        
        if (sessions.length === 0) {
            sessionsContainer.innerHTML = '<p class="text-muted">Chat sessiyalari mavjud emas</p>';
            return;
        }
        
        sessionsContainer.innerHTML = sessions.map(session => `
            <div class="chat-session ${session.unread_count > 0 ? 'unread' : ''}" onclick="loadChatMessages(${session.user_id})">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${session.user_name}</h6>
                        <small class="text-muted">${session.user_email}</small>
                    </div>
                    <div class="text-end">
                        ${session.unread_count > 0 ? `<span class="badge bg-danger">${session.unread_count}</span>` : ''}
                        <small class="text-muted d-block">${new Date(session.last_message_time).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading chat sessions:', error);
    }
}

async function loadChatMessages(userId) {
    try {
        const response = await api.chat.getUserMessages(userId);
        const messages = response.messages || [];
        
        const chatContainer = document.getElementById('chatMessagesContainer');
        const chatUserName = document.getElementById('chatUserName');
        const replySection = document.getElementById('chatReplySection');
        
        if (!chatContainer) return;
        
        // Update chat header
        if (chatUserName) {
            const session = await findChatSession(userId);
            chatUserName.textContent = session ? `${session.user_name} bilan suhbat` : 'Chat suhbati';
        }
        
        // Show reply section
        if (replySection) {
            replySection.style.display = 'block';
            replySection.dataset.userId = userId;
        }
        
        // Load messages
        chatContainer.innerHTML = messages.map(msg => `
            <div class="chat-message ${msg.sender_type === 'user' ? 'user-message' : 'admin-message'}">
                <div class="message-content">
                    <strong>${msg.sender_type === 'user' ? 'Foydalanuvchi' : 'Admin'}:</strong>
                    <p>${msg.message}</p>
                    <small class="text-muted">${new Date(msg.created_at).toLocaleString()}</small>
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Mark messages as read
        await api.chat.markAsRead(userId);
        
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

async function sendChatReply() {
    const replySection = document.getElementById('chatReplySection');
    const chatInput = document.getElementById('chatReplyInput');
    const userId = replySection ? replySection.dataset.userId : null;
    const message = chatInput ? chatInput.value.trim() : '';
    
    if (!message || !userId) return;
    
    try {
        await api.chat.sendMessage({ message, user_id: parseInt(userId) });
        
        if (chatInput) chatInput.value = '';
        
        // Reload messages
        await loadChatMessages(userId);
        
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}

// ==================== NOTIFICATIONS ====================

async function updateNotificationCounts() {
    try {
        // Get unread messages count
        const messagesResponse = await api.messages.getUnreadCount();
        const messagesCount = messagesResponse.count || 0;
        
        // Get unread chat count
        const chatResponse = await api.chat.getUnreadCount();
        const chatCount = chatResponse.count || 0;
        
        // Update badges
        updateBadge('unreadMessagesCount', messagesCount);
        updateBadge('adminNotificationBadge', messagesCount + chatCount);
        updateBadge('unreadChatsCount', chatCount);
        
    } catch (error) {
        console.error('Error updating notification counts:', error);
    }
}

function updateBadge(elementId, count) {
    const badge = document.getElementById(elementId);
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logoutAdmin');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
    }
    
    // Navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showDashboardSection(section);
        });
    });
    
    // Add tour form
    const addTourForm = document.getElementById('addTourForm');
    if (addTourForm) {
        addTourForm.addEventListener('submit', handleAddTourForm);
    }
    
    // Chat reply
    const sendChatReplyBtn = document.getElementById('sendChatReply');
    const chatReplyInput = document.getElementById('chatReplyInput');
    
    if (sendChatReplyBtn) {
        sendChatReplyBtn.addEventListener('click', sendChatReply);
    }
    
    if (chatReplyInput) {
        chatReplyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatReply();
            }
        });
    }
    
    // Refresh dashboard
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.querySelector('i').classList.add('fa-spin');
            loadDashboardData().finally(() => {
                this.querySelector('i').classList.remove('fa-spin');
            });
        });
    }
}

// ==================== SIDEBAR ====================

function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// ==================== REAL-TIME UPDATES ====================

function setupRealTimeUpdates() {
    // Update notifications every 30 seconds
    setInterval(updateNotificationCounts, 30000);
    
    // Update time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
}

function updateTimeDisplay() {
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.textContent = new Date().toLocaleTimeString();
    }
}

// ==================== HELPER FUNCTIONS ====================

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    setTimeout(() => {
        const alert = document.querySelector('.alert:last-of-type');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

function getBookingStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'success',
        'cancelled': 'danger',
        'completed': 'info'
    };
    return colors[status] || 'secondary';
}

function getBookingStatusText(status) {
    const texts = {
        'pending': 'Kutilmoqda',
        'confirmed': 'Tasdiqlangan',
        'cancelled': 'Bekor qilingan',
        'completed': 'Bajarilgan'
    };
    return texts[status] || status;
}

async function findChatSession(userId) {
    try {
        const response = await api.chat.getSessions();
        const sessions = response.sessions || [];
        return sessions.find(session => session.user_id === userId);
    } catch (error) {
        return null;
    }
}

// Placeholder functions for features not yet implemented
async function loadNotifications() {
    // Implementation would go here
}

async function loadUsers() {
    // Implementation would go here
}

async function loadReports() {
    // Implementation would go here
}

async function editTour(tourId) {
    // Implementation would go here
    showAlert('Tour tahrirlash funksiyasi tez orada qo\'shiladi', 'info');
}

async function deleteTour(tourId) {
    if (!confirm('Ushbu tur paketini o\'chirishni istaysizmi?')) return;
    
    try {
        await api.tours.delete(tourId);
        showAlert('Tur muvaffaqiyatli o\'chirildi', 'success');
        await loadTours();
    } catch (error) {
        showAlert(api.handleAPIError(error), 'danger');
    }
}
