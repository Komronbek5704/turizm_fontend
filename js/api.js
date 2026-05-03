// ==================== API CONFIGURATION ====================
const API_BASE_URL = (() => {
    // Local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // Production on Vercel with Railway backend
    // Replace with your Railway backend URL when deployed
    if (window.location.hostname.includes('vercel.app')) {
        return 'https://tour-voyage-production.up.railway.app/api';
    }
    
    // Fallback for other environments
    return '/api';
})();

// ==================== API HELPER FUNCTIONS ====================

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add auth token if available
    const token = localStorage.getItem('tourvoyage_token');
    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ==================== AUTHENTICATION API ====================
const authAPI = {
    // Register new user
    async register(userData) {
        return await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Login user
    async login(credentials) {
        return await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Get current user profile
    async getProfile() {
        return await apiRequest('/auth/profile');
    },

    // Update user profile
    async updateProfile(userData) {
        return await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },
};

// ==================== TOURS API ====================
const toursAPI = {
    // Get all tours
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/tours${queryString ? '?' + queryString : ''}`);
    },

    // Get tour by ID
    async getById(id) {
        return await apiRequest(`/tours/${id}`);
    },

    // Get available tours
    async getAvailable(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/tours/available${queryString ? '?' + queryString : ''}`);
    },

    // Get popular tours
    async getPopular(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/tours/popular${queryString ? '?' + queryString : ''}`);
    },

    // Create new tour (admin only)
    async create(tourData) {
        return await apiRequest('/tours', {
            method: 'POST',
            body: JSON.stringify(tourData),
        });
    },

    // Update tour (admin only)
    async update(id, tourData) {
        return await apiRequest(`/tours/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tourData),
        });
    },

    // Delete tour (admin only)
    async delete(id) {
        return await apiRequest(`/tours/${id}`, {
            method: 'DELETE',
        });
    },

    // Get tour statistics (admin only)
    async getStats() {
        return await apiRequest('/tours/stats/admin');
    },
};

// ==================== BOOKINGS API ====================
const bookingsAPI = {
    // Create new booking
    async create(bookingData) {
        return await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    // Get all bookings (admin only)
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings${queryString ? '?' + queryString : ''}`);
    },

    // Get booking by ID
    async getById(id) {
        return await apiRequest(`/bookings/${id}`);
    },

    // Get user's bookings
    async getMyBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings/my${queryString ? '?' + queryString : ''}`);
    },

    // Update booking status (admin only)
    async updateStatus(id, status) {
        return await apiRequest(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    // Cancel booking
    async cancel(id) {
        return await apiRequest(`/bookings/${id}/cancel`, {
            method: 'PUT',
        });
    },

    // Get booking statistics (admin only)
    async getStats() {
        return await apiRequest('/bookings/stats/admin');
    },

    // Get monthly statistics (admin only)
    async getMonthlyStats(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings/stats/monthly${queryString ? '?' + queryString : ''}`);
    },

    // Get user booking statistics
    async getMyStats() {
        return await apiRequest('/bookings/my/stats');
    },

    // Get recent bookings (admin only)
    async getRecent(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings/recent/admin${queryString ? '?' + queryString : ''}`);
    },
};

// ==================== MESSAGES API ====================
const messagesAPI = {
    // Send contact message
    async send(messageData) {
        return await apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    },

    // Get all messages (admin only)
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/messages${queryString ? '?' + queryString : ''}`);
    },

    // Get message by ID (admin only)
    async getById(id) {
        return await apiRequest(`/messages/${id}`);
    },

    // Mark message as read (admin only)
    async markAsRead(id) {
        return await apiRequest(`/messages/${id}/read`, {
            method: 'PUT',
        });
    },

    // Delete message (admin only)
    async delete(id) {
        return await apiRequest(`/messages/${id}`, {
            method: 'DELETE',
        });
    },

    // Get message statistics (admin only)
    async getStats() {
        return await apiRequest('/messages/stats');
    },

    // Get unread messages count (admin only)
    async getUnreadCount() {
        return await apiRequest('/messages/unread');
    },

    // Get recent messages (admin only)
    async getRecent(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/messages/recent${queryString ? '?' + queryString : ''}`);
    },
};

// ==================== CHAT API ====================
const chatAPI = {
    // Send chat message
    async sendMessage(messageData) {
        return await apiRequest('/chat', {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    },

    // Get user's chat messages
    async getUserMessages(userId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/chat/user/${userId}${queryString ? '?' + queryString : ''}`);
    },

    // Get all chat messages (admin only)
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/chat/all${queryString ? '?' + queryString : ''}`);
    },

    // Get chat sessions (admin only)
    async getSessions() {
        return await apiRequest('/chat/sessions');
    },

    // Mark chat as read
    async markAsRead(userId) {
        return await apiRequest(`/chat/read/${userId}`, {
            method: 'PUT',
        });
    },

    // Get unread chat messages count
    async getUnreadCount() {
        return await apiRequest('/chat/unread');
    },

    // Get chat statistics (admin only)
    async getStats() {
        return await apiRequest('/chat/stats');
    },

    // Get recent chat messages (admin only)
    async getRecent(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/chat/recent${queryString ? '?' + queryString : ''}`);
    },

    // Delete chat message (admin only)
    async delete(id) {
        return await apiRequest(`/chat/${id}`, {
            method: 'DELETE',
        });
    },
};

// ==================== ERROR HANDLING ====================
function handleAPIError(error, defaultMessage = 'Xatolik yuz berdi') {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Token expired or invalid
        localStorage.removeItem('tourvoyage_token');
        localStorage.removeItem('tourvoyage_user');
        window.location.href = 'index.html';
        return 'Sessiya muddati tugagan, iltimos qayta kirishingiz kerak';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return 'Sizda bu amalni bajarish uchun ruxsat yo\'q';
    }
    
    if (error.message.includes('404') || error.message.includes('not found')) {
        return 'So\'ralgan ma\'lumot topilmadi';
    }
    
    if (error.message.includes('Network') || error.message.includes('fetch')) {
        return 'Internet bog\'lanishida xatolik, iltimos keyinroq urinib ko\'ring';
    }
    
    return error.message || defaultMessage;
}

// ==================== EXPORT ====================
window.api = {
    auth: authAPI,
    tours: toursAPI,
    bookings: bookingsAPI,
    messages: messagesAPI,
    chat: chatAPI,
    handleAPIError,
    API_BASE_URL
};
