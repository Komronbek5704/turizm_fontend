
        // Admin dashboard sahifasi JavaScript
        document.addEventListener('DOMContentLoaded', function() {
            initAdminDashboard();
        });

        let currentAdmin = null;
        let selectedChatUserId = null;

        function initAdminDashboard() {
            // Admin sessionni tekshirish
            checkAdminSession();
            
            // Dashboardni ishga tushirish
            loadAdminDashboard();
            
            // Event listenerlarni sozlash
            setupDashboardEventListeners();
            
            // Vaqtni yangilash
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
            
            // Real-time yangilash
            setInterval(updateUnreadCounts, 30000); // Har 30 soniyada
        }

        // Admin sessionni tekshirish
        function checkAdminSession() {
            const adminKey = 'tourvoyage_admin';
            const session = localStorage.getItem(adminKey);
            
            if (!session) {
                // Agar admin mavjud bo'lmasa, demo admin yaratish
                const demoAdmin = {
                    id: 1,
                    username: "Administrator",
                    email: "admin@tourvoyage.com",
                    created: new Date().toISOString()
                };
                
                localStorage.setItem(adminKey, JSON.stringify(demoAdmin));
                currentAdmin = demoAdmin;
            } else {
                try {
                    currentAdmin = JSON.parse(session);
                } catch (error) {
                    // Noto'g'ri session ma'lumotlari
                    localStorage.removeItem(adminKey);
                    checkAdminSession(); // Qayta urinish
                    return;
                }
            }
            
            // Admin ma'lumotlarini ko'rsatish
            if (document.getElementById('adminUsername')) {
                document.getElementById('adminUsername').textContent = currentAdmin.username;
            }
            if (document.getElementById('adminEmail')) {
                document.getElementById('adminEmail').textContent = currentAdmin.email;
            }
        }

        // Dashboardni yuklash
        function loadAdminDashboard() {
            showAdminLoading();
            
            // Simulate loading
            setTimeout(() => {
                // Barcha ma'lumotlarni yuklash
                loadAllData();
                
                hideAdminLoading();
            }, 1000);
        }

        // Barcha ma'lumotlarni yuklash
        function loadAllData() {
            // Stats ma'lumotlarini yuklash
            loadDashboardStats();
            
            // Xabarlarni yuklash
            loadMessages();
            
            // Bildirishnomalarni yuklash
            loadNotifications();
            
            // Chatlarni yuklash
            loadChatSessions();
            
            // Bronlarni yuklash
            loadAdminBookings();
            
            // Tur paketlarni yuklash
            loadAdminTours();
            
            // Foydalanuvchilarni yuklash
            loadAdminUsers();
            
            // Grafiklarni yuklash
            loadDashboardCharts();
            
            // Hisobot ma'lumotlarini yuklash
            loadReportStats();
            
            // So'nggi faoliyat
            loadRecentActivity();
            
            // O'qilmaganlar sonini yangilash
            updateUnreadCounts();
        }

        // Dashboard statistik ma'lumotlari
        function loadDashboardStats() {
            const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
            const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
            const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
            const messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
            
            // Jami bronlar
            if (document.getElementById('totalBookings')) {
                document.getElementById('totalBookings').textContent = bookings.length;
            }
            
            // Yangi xabarlar (o'qilmagan)
            const unreadMessages = messages.filter(m => m.status === 'yangi');
            if (document.getElementById('totalMessages')) {
                document.getElementById('totalMessages').textContent = unreadMessages.length;
            }
            
            // Foydalanuvchilar
            if (document.getElementById('totalUsers')) {
                document.getElementById('totalUsers').textContent = users.length;
            }
            
            // Daromad
            if (document.getElementById('totalRevenue')) {
                const confirmedBookings = bookings.filter(b => b.status === 'tasdiqlangan');
                const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
                document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString();
            }
        }

        // Xabarlarni yuklash (kontakt formasi orqali)
        function loadMessages() {
            const messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
            const messagesList = document.getElementById('messagesList');
            
            if (!messagesList) return;
            
            messagesList.innerHTML = '';
            
            if (messages.length === 0) {
                messagesList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-envelope fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Hozircha xabarlar mavjud emas</p>
                    </div>
                `;
                return;
            }
            
            // Sort by date (newest first)
            messages.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            messages.forEach(message => {
                const messageDate = new Date(message.date).toLocaleString('uz-UZ');
                const isUnread = message.status === 'yangi';
                
                const messageItem = document.createElement('div');
                messageItem.className = `message-item ${isUnread ? 'unread' : ''}`;
                messageItem.innerHTML = `
                    <div class="message-sender">
                        ${message.name}
                        ${isUnread ? '<span class="badge bg-warning ms-2">Yangi</span>' : ''}
                    </div>
                    <div class="message-content">${message.message}</div>
                    <div class="message-time">
                        <i class="far fa-clock"></i> ${messageDate}
                    </div>
                    <div class="message-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewMessage(${message.id})">
                            <i class="fas fa-eye me-1"></i>Ko'rish
                        </button>
                        <button class="btn btn-sm btn-success" onclick="markMessageAsRead(${message.id})">
                            <i class="fas fa-check me-1"></i>O'qilgan deb belgilash
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMessage(${message.id})">
                            <i class="fas fa-trash me-1"></i>O'chirish
                        </button>
                    </div>
                `;
                
                messagesList.appendChild(messageItem);
            });
        }

        // Bildirishnomalarni yuklash
        function loadNotifications() {
            const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
            const notificationsList = document.getElementById('notificationsList');
            
            if (!notificationsList) return;
            
            notificationsList.innerHTML = '';
            
            // Admin uchun faqat "all" yoki admin ga tegishli bildirishnomalar
            const adminNotifications = notifications.filter(n => 
                n.userId === 'all' || n.userId === 'admin'
            );
            
            if (adminNotifications.length === 0) {
                notificationsList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Hozircha bildirishnomalar mavjud emas</p>
                    </div>
                `;
                return;
            }
            
            // Sort by date (newest first)
            adminNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            adminNotifications.forEach(notification => {
                const timeAgo = getTimeAgo(notification.timestamp);
                const isUnread = !notification.read;
                
                const notificationItem = document.createElement('div');
                notificationItem.className = `message-item ${isUnread ? 'unread' : ''}`;
                notificationItem.innerHTML = `
                    <div class="message-sender">
                        ${notification.title}
                        ${isUnread ? '<span class="badge bg-danger ms-2">Yangi</span>' : ''}
                    </div>
                    <div class="message-content">${notification.message}</div>
                    <div class="message-time">
                        <i class="far fa-clock"></i> ${timeAgo}
                    </div>
                    <div class="message-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewNotification(${notification.id})">
                            <i class="fas fa-eye me-1"></i>Ko'rish
                        </button>
                        <button class="btn btn-sm btn-success" onclick="markNotificationAsRead(${notification.id})">
                            <i class="fas fa-check me-1"></i>O'qilgan deb belgilash
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteNotification(${notification.id})">
                            <i class="fas fa-trash me-1"></i>O'chirish
                        </button>
                    </div>
                `;
                
                notificationsList.appendChild(notificationItem);
            });
        }

        // Chat sessiyalarini yuklash
        function loadChatSessions() {
            const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
            const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
            const chatSessionsList = document.getElementById('chatSessionsList');
            
            if (!chatSessionsList) return;
            
            chatSessionsList.innerHTML = '';
            
            // Har bir foydalanuvchining oxirgi chat xabarini olish
            const userLastMessages = {};
            const userUnreadCounts = {};
            
            chatHistory.forEach(chat => {
                if (!userLastMessages[chat.userId] || 
                    new Date(chat.timestamp) > new Date(userLastMessages[chat.userId].timestamp)) {
                    
                    const user = users.find(u => u.id === chat.userId);
                    if (user) {
                        userLastMessages[chat.userId] = {
                            ...chat,
                            userName: user.name
                        };
                    }
                }
                
                // O'qilmagan chat xabarlarini hisoblash (faqat foydalanuvchi xabarlari)
                if (chat.sender === 'user' && !chat.readByAdmin) {
                    userUnreadCounts[chat.userId] = (userUnreadCounts[chat.userId] || 0) + 1;
                }
            });
            
            const uniqueUsers = Object.values(userLastMessages);
            
            if (uniqueUsers.length === 0) {
                chatSessionsList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Hozircha chat suhbatlari mavjud emas</p>
                    </div>
                `;
                return;
            }
            
            // Sort by last message time
            uniqueUsers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            uniqueUsers.forEach(chat => {
                const user = users.find(u => u.id === chat.userId);
                if (!user) return;
                
                const lastMessageTime = getTimeAgo(chat.timestamp);
                const unreadCount = userUnreadCounts[chat.userId] || 0;
                
                const chatItem = document.createElement('div');
                chatItem.className = 'message-item';
                chatItem.style.cursor = 'pointer';
                chatItem.innerHTML = `
                    <div class="message-sender d-flex justify-content-between align-items-center">
                        <span>${user.name}</span>
                        ${unreadCount > 0 ? `<span class="badge bg-danger">${unreadCount}</span>` : ''}
                    </div>
                    <div class="message-content">${chat.message.substring(0, 50)}${chat.message.length > 50 ? '...' : ''}</div>
                    <div class="message-time">
                        <i class="far fa-clock"></i> ${lastMessageTime}
                    </div>
                `;
                
                chatItem.addEventListener('click', function() {
                    selectChatSession(chat.userId, user.name);
                });
                
                chatSessionsList.appendChild(chatItem);
            });
        }

        // Chat sessiyasini tanlash
        function selectChatSession(userId, userName) {
            selectedChatUserId = userId;
            
            // Chat nomini yangilash
            document.getElementById('chatUserName').textContent = `${userName} bilan chat`;
            
            // Chat xabarlarini yuklash
            loadChatMessages(userId);
            
            // Javob berish bo'limini ko'rsatish
            document.getElementById('chatReplySection').style.display = 'block';
        }

        // Chat xabarlarini yuklash
        function loadChatMessages(userId) {
            const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
            const chatMessagesContainer = document.getElementById('chatMessagesContainer');
            
            if (!chatMessagesContainer) return;
            
            const userChats = chatHistory.filter(chat => chat.userId == userId);
            
            chatMessagesContainer.innerHTML = '';
            
            if (userChats.length === 0) {
                chatMessagesContainer.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-muted">Hozircha xabarlar mavjud emas</p>
                    </div>
                `;
                return;
            }
            
            // Sort by timestamp
            userChats.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            userChats.forEach(chat => {
                const messageTime = new Date(chat.timestamp).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${chat.sender}`;
                messageDiv.innerHTML = `
                    <div class="message-content">
                        <div>${chat.message}</div>
                        <div class="text-end" style="font-size: 0.7rem; opacity: 0.7;">${messageTime}</div>
                    </div>
                `;
                
                chatMessagesContainer.appendChild(messageDiv);
            });
            
            // Scroll to bottom
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            
            // O'qilmagan xabarlarni o'qilgan deb belgilash
            markUserChatsAsRead(userId);
        }

        // O'qilmagan chat xabarlarini o'qilgan deb belgilash
        function markUserChatsAsRead(userId) {
            const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
            let updated = false;
            
            const updatedChats = chatHistory.map(chat => {
                if (chat.userId == userId && chat.sender === 'user' && !chat.readByAdmin) {
                    updated = true;
                    return { ...chat, readByAdmin: true };
                }
                return chat;
            });
            
            if (updated) {
                localStorage.setItem('tourvoyage_chat', JSON.stringify(updatedChats));
                updateUnreadCounts();
                loadChatSessions();
            }
        }

        // So'nggi faoliyatni yuklash
        function loadRecentActivity() {
            const recentActivity = document.getElementById('recentActivity');
            if (!recentActivity) return;
            
            const activities = [];
            
            // So'nggi 5 ta faoliyatni yig'ish
            const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
            const messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
            
            // So'nggi bronlar
            bookings.slice(-3).forEach(booking => {
                activities.push({
                    type: 'booking',
                    text: `${booking.userName} ${booking.tourName} turini bron qildi`,
                    time: booking.date
                });
            });
            
            // So'nggi xabarlar
            messages.slice(-2).forEach(message => {
                activities.push({
                    type: 'message',
                    text: `${message.name} xabar yubordi`,
                    time: message.date
                });
            });
            
            // Sort by time
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            // Faqat 5 tasini ko'rsatish
            activities.slice(0, 5).forEach(activity => {
                const activityDiv = document.createElement('div');
                activityDiv.className = 'mb-3 pb-3 border-bottom';
                activityDiv.innerHTML = `
                    <div class="d-flex">
                        <div class="flex-shrink-0 me-3">
                            <i class="fas fa-${activity.type === 'booking' ? 'calendar-check' : 'envelope'} text-${activity.type === 'booking' ? 'primary' : 'success'}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-1">${activity.text}</p>
                            <small class="text-muted">${getTimeAgo(activity.time)}</small>
                        </div>
                    </div>
                `;
                recentActivity.appendChild(activityDiv);
            });
            
            if (activities.length === 0) {
                recentActivity.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-muted">Hozircha faoliyat mavjud emas</p>
                    </div>
                `;
            }
        }

        // ==================== TADBIRLAR ====================

        // Xabarni ko'rish
        window.viewMessage = function(messageId) {
            const messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
            const message = messages.find(m => m.id == messageId);
            
            if (!message) return;
            
            // Modalni to'ldirish
            document.getElementById('modalSender').textContent = message.name;
            document.getElementById('modalEmail').textContent = message.email;
            document.getElementById('modalTime').textContent = new Date(message.date).toLocaleString('uz-UZ');
            document.getElementById('modalMessage').textContent = message.message;
            
            // Modalni ochish
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            messageModal.show();
            
            // Javob berish tugmasi
            document.getElementById('replyToMessage').onclick = function() {
                messageModal.hide();
                // Email havolasini ochish
                window.open(`mailto:${message.email}?subject=TourVoyage: Xabaringizga javob&body=Hurmatli ${message.name}%0D%0A%0D%0A`, '_blank');
            };
        };

        // Xabarni o'qilgan deb belgilash
        window.markMessageAsRead = function(messageId) {
            let messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
            messages = messages.map(m => {
                if (m.id == messageId) {
                    return { ...m, status: 'o\'qilgan' };
                }
                return m;
            });
            
            localStorage.setItem('tourvoyage_contacts', JSON.stringify(messages));
            loadMessages();
            loadDashboardStats();
            updateUnreadCounts();
            showAdminToast('Xabar o\'qilgan deb belgilandi', 'success');
        };

        // Xabarni o'chirish
        window.deleteMessage = function(messageId) {
            if (confirm('Bu xabarni o\'chirishni xohlaysizmi?')) {
                let messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
                messages = messages.filter(m => m.id != messageId);
                localStorage.setItem('tourvoyage_contacts', JSON.stringify(messages));
                
                loadMessages();
                loadDashboardStats();
                updateUnreadCounts();
                showAdminToast('Xabar o\'chirildi', 'success');
            }
        };

        // Bildirishnomani ko'rish
        window.viewNotification = function(notificationId) {
            const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
            const notification = notifications.find(n => n.id == notificationId);
            
            if (!notification) return;
            
            alert(
                `Bildirishnoma ma'lumotlari:\n\n` +
                `Sarlavha: ${notification.title}\n` +
                `Xabar: ${notification.message}\n` +
                `Vaqt: ${getTimeAgo(notification.timestamp)}\n` +
                `Holati: ${notification.read ? 'O\'qilgan' : 'Yangi'}`
            );
        };

        // Bildirishnomani o'qilgan deb belgilash
        window.markNotificationAsRead = function(notificationId) {
            let notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
            notifications = notifications.map(n => {
                if (n.id == notificationId) {
                    return { ...n, read: true };
                }
                return n;
            });
            
            localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
            loadNotifications();
            updateUnreadCounts();
            showAdminToast('Bildirishnoma o\'qilgan deb belgilandi', 'success');
        };

        // Bildirishnomani o'chirish
        window.deleteNotification = function(notificationId) {
            if (confirm('Bu bildirishnomani o\'chirishni xohlaysizmi?')) {
                let notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
                notifications = notifications.filter(n => n.id != notificationId);
                localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
                
                loadNotifications();
                updateUnreadCounts();
                showAdminToast('Bildirishnoma o\'chirildi', 'success');
            }
        };

        // Javob yuborish
        document.getElementById('sendChatReply')?.addEventListener('click', function() {
            const input = document.getElementById('chatReplyInput');
            const message = input.value.trim();
            
            if (!message) {
                showAdminToast('Iltimos, xabar matnini kiriting!', 'warning');
                return;
            }
            
            if (!selectedChatUserId) {
                showAdminToast('Iltimos, avval chatni tanlang!', 'warning');
                return;
            }
            
            // Chat tarixiga qo'shish
            const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
            const newMessage = {
                id: Date.now(),
                userId: selectedChatUserId,
                sender: 'admin',
                message: message,
                timestamp: new Date().toISOString(),
                readByUser: false
            };
            
            chatHistory.push(newMessage);
            localStorage.setItem('tourvoyage_chat', JSON.stringify(chatHistory));
            
            // Chat xabarlarini yangilash
            loadChatMessages(selectedChatUserId);
            
            // Inputni tozalash
            input.value = '';
            
            // Foydalanuvchiga bildirishnoma yuborish
            const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
            const user = users.find(u => u.id == selectedChatUserId);
            
            if (user) {
                const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
                const newNotification = {
                    id: Date.now(),
                    userId: selectedChatUserId,
                    title: 'Admin javobi',
                    message: `Administrator sizning xabaringizga javob berdi: ${message.substring(0, 50)}...`,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                
                notifications.push(newNotification);
                localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
            }
            
            showAdminToast('Xabar yuborildi!', 'success');
        });

        // ==================== YORDAMCHI FUNKSIYALAR ====================

        // Vaqtni ko'rsatish uchun
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
            
            return past.toLocaleDateString('uz-UZ');
        }

        // O'qilmaganlar sonini yangilash
        function updateUnreadCounts() {
            // O'qilmagan xabarlar
            const messages = JSON.parse(localStorage.getItem('tourvoyage_contacts')) || [];
            const unreadMessages = messages.filter(m => m.status === 'yangi');
            
            // O'qilmagan bildirishnomalar (admin uchun)
            const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
            const unreadNotifications = notifications.filter(n => 
                (n.userId === 'all' || n.userId === 'admin') && !n.read
            );
            
            // O'qilmagan chatlar (admin tomonidan)
            const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
            const unreadChats = chatHistory.filter(c => 
                c.sender === 'user' && !c.readByAdmin
            );
            
            // Navbar badge yangilash
            const unreadMessagesCount = unreadMessages.length;
            const unreadNotificationsCount = unreadNotifications.length;
            const unreadChatsCount = new Set(unreadChats.map(c => c.userId)).size; // Har bir foydalanuvchi uchun 1 ta
            
            // Badgelarni yangilash
            updateBadge('unreadMessagesCount', unreadMessagesCount);
            updateBadge('unreadNotificationsCount', unreadNotificationsCount);
            updateBadge('unreadChatsCount', unreadChatsCount);
            
            // Topbar notification badge
            const totalUnread = unreadMessagesCount + unreadNotificationsCount + unreadChatsCount;
            const adminBadge = document.getElementById('adminNotificationBadge');
            
            if (adminBadge) {
                if (totalUnread > 0) {
                    adminBadge.textContent = totalUnread;
                    adminBadge.style.display = 'flex';
                } else {
                    adminBadge.style.display = 'none';
                }
            }
        }

        function updateBadge(elementId, count) {
            const element = document.getElementById(elementId);
            if (element) {
                if (count > 0) {
                    element.textContent = count;
                    element.style.display = 'flex';
                } else {
                    element.style.display = 'none';
                }
            }
        }

        // Event listenerlarni sozlash (oldin berilgan kodni qo'shing)
        // Vaqtni yangilash funksiyasi (oldin berilgan kodni qo'shing)
        // Dashboard bo'limlarini ko'rsatish (oldin berilgan kodni qo'shing)
        // Logout (oldin berilgan kodni qo'shing)
        // Admin loading va toast (oldin berilgan kodni qo'shing)

        // Qolgan funksiyalar (tur paketlari, bronlar, foydalanuvchilar, hisobotlar)
        // Oldingi kodlaringizni qo'shing...

        // Demo ma'lumotlar yaratish
        function createDemoData() {
            // Agar data yo'q bo'lsa, demo yaratish
            if (!localStorage.getItem('tourvoyage_contacts')) {
                const demoContacts = [
                    {
                        id: 1,
                        name: "Ali Valiyev",
                        email: "ali@example.com",
                        message: "Istanbul turi haqida ma'lumot kerak. Qancha vaqt davom etadi?",
                        date: new Date(Date.now() - 3600000).toISOString(),
                        status: "yangi"
                    },
                    {
                        id: 2,
                        name: "Sara Husanova",
                        email: "sara@example.com",
                        message: "Dubai uchun viza masalasi qanday? Yordam bera olasizmi?",
                        date: new Date(Date.now() - 7200000).toISOString(),
                        status: "o'qilgan"
                    }
                ];
                localStorage.setItem('tourvoyage_contacts', JSON.stringify(demoContacts));
            }
            
            if (!localStorage.getItem('tourvoyage_notifications')) {
                const demoNotifications = [
                    {
                        id: 1,
                        userId: "all",
                        title: "Yangi tur qo'shildi",
                        message: "Maldives uchun yangi tur paket qo'shildi!",
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        read: false
                    },
                    {
                        id: 2,
                        userId: "admin",
                        title: "Tizim yangilandi",
                        message: "Admin panel yangi funksiyalar bilan yangilandi",
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        read: true
                    }
                ];
                localStorage.setItem('tourvoyage_notifications', JSON.stringify(demoNotifications));
            }
        }

        // Dastur ishga tushganda demo ma'lumotlarni yaratish
        createDemoData();
        // ==================== QOLGAN FUNKSIYALARNI TO'LDIRISH ====================

// Event listenerlarni sozlash
function setupDashboardEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Navbar linklar
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showDashboardSection(sectionId);
            
            // Mobile da sidebar yopish
            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
            }
        });
    });
    
    // Refresh dashboard
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadAllData();
            showAdminToast('Dashboard yangilandi', 'success');
        });
    }
    
    // Notification bell
    const notificationBell = document.getElementById('adminNotificationBell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            showDashboardSection('notifications');
        });
    }
    
    // Add tour form
    const addTourForm = document.getElementById('addTourForm');
    if (addTourForm) {
        addTourForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewTour();
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutAdmin');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutAdmin();
        });
    }
    
    // Chat reply
    const sendChatReply = document.getElementById('sendChatReply');
    if (sendChatReply) {
        sendChatReply.addEventListener('click', sendChatMessage);
    }
    
    // Chat reply enter bosilganda
    const chatReplyInput = document.getElementById('chatReplyInput');
    if (chatReplyInput) {
        chatReplyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

// Vaqtni yangilash funksiyasi
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Dashboard bo'limlarini ko'rsatish
function showDashboardSection(sectionId) {
    // Barcha bo'limlarni yashirish
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Tanlangan bo'limni ko'rsatish
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Navbar linklarni yangilash
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Bo'limga o'tganda unga mos ma'lumotlarni yuklash
    switch(sectionId) {
        case 'dashboard':
            loadDashboardStats();
            loadDashboardCharts();
            loadRecentActivity();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'notifications':
            loadNotifications();
            break;
        case 'chat':
            loadChatSessions();
            break;
        case 'bookings':
            loadAdminBookings();
            break;
        case 'tours':
            loadAdminTours();
            break;
        case 'users':
            loadAdminUsers();
            break;
        case 'reports':
            loadReportStats();
            loadRevenueChart();
            break;
    }
}

// Admin logout
function logoutAdmin() {
    if (confirm('Admin paneldan chiqishni xohlaysizmi?')) {
        localStorage.removeItem('tourvoyage_admin');
        window.location.href = 'index.html';
    }
}

// Admin loading ko'rsatish
function showAdminLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// Admin loading yashirish
function hideAdminLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Admin toast notification
function showAdminToast(message, type = 'info') {
    // Toast container yaratish
    let toastContainer = document.getElementById('adminToastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'adminToastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            min-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Toast yaratish
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.style.cssText = `
        animation: slideIn 0.3s ease;
        margin-bottom: 10px;
    `;
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${toastId}').remove()"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // 5 sekunddan so'ng o'chirish
    setTimeout(() => {
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            toastElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                toastElement.remove();
            }, 300);
        }
    }, 5000);
    
    // Animation styles qo'shish
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Chat xabar yuborish
function sendChatMessage() {
    const input = document.getElementById('chatReplyInput');
    const message = input.value.trim();
    
    if (!message) {
        showAdminToast('Iltimos, xabar matnini kiriting!', 'warning');
        return;
    }
    
    if (!selectedChatUserId) {
        showAdminToast('Iltimos, avval chatni tanlang!', 'warning');
        return;
    }
    
    // Chat tarixiga qo'shish
    const chatHistory = JSON.parse(localStorage.getItem('tourvoyage_chat')) || [];
    const newMessage = {
        id: Date.now(),
        userId: selectedChatUserId,
        sender: 'admin',
        message: message,
        timestamp: new Date().toISOString(),
        readByUser: false,
        readByAdmin: true
    };
    
    chatHistory.push(newMessage);
    localStorage.setItem('tourvoyage_chat', JSON.stringify(chatHistory));
    
    // Chat xabarlarini yangilash
    loadChatMessages(selectedChatUserId);
    
    // Inputni tozalash
    input.value = '';
    
    // Foydalanuvchiga bildirishnoma yuborish
    const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
    const user = users.find(u => u.id == selectedChatUserId);
    
    if (user) {
        const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
        const newNotification = {
            id: Date.now(),
            userId: selectedChatUserId,
            title: 'Admin javobi',
            message: `Administrator sizning xabaringizga javob berdi: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        notifications.push(newNotification);
        localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
        
        // Yangilash
        updateUnreadCounts();
        if (window.innerWidth < 992) {
            document.getElementById('adminNotificationBadge').style.display = 'flex';
        }
    }
    
    showAdminToast('Xabar yuborildi!', 'success');
}

// ==================== TUR PAKETLARI VA BRONLAR ====================

// Tur paketlarini yuklash
function loadAdminTours() {
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    const toursList = document.getElementById('adminToursList');
    
    if (!toursList) return;
    
    toursList.innerHTML = '';
    
    if (tours.length === 0) {
        toursList.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-suitcase fa-3x text-muted mb-3"></i>
                <p class="text-muted">Hozircha tur paketlar mavjud emas</p>
            </div>
        `;
        return;
    }
    
    tours.forEach(tour => {
        const tourCard = document.createElement('div');
        tourCard.className = 'col-md-4 mb-4';
        tourCard.innerHTML = `
            <div class="card h-100">
                <img src="${tour.image || 'https://via.placeholder.com/300x200?text=Tour+Image'}" 
                     class="card-img-top" alt="${tour.name}" 
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${tour.name}</h5>
                    <p class="card-text">${(tour.description || '').substring(0, 100)}...</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-primary">${tour.duration}</span>
                            <h5 class="mt-2">$${tour.price}</h5>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="deleteTour(${tour.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        toursList.appendChild(tourCard);
    });
}

// Yangi tur qo'shish
function addNewTour() {
    const name = document.getElementById('tourName').value;
    const price = document.getElementById('tourPrice').value;
    const duration = document.getElementById('tourDuration').value;
    const image = document.getElementById('tourImage').value;
    const description = document.getElementById('tourDescription').value;
    
    if (!name || !price || !duration || !image || !description) {
        showAdminToast('Iltimos, barcha maydonlarni to\'ldiring!', 'warning');
        return;
    }
    
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    const newTour = {
        id: Date.now(),
        name: name,
        price: parseFloat(price),
        duration: duration,
        image: image,
        description: description,
        rating: 4.5,
        spots: 10,
        category: 'Popular',
        created: new Date().toISOString()
    };
    
    tours.push(newTour);
    localStorage.setItem('tourvoyage_tours', JSON.stringify(tours));
    
    // Formani tozalash
    document.getElementById('addTourForm').reset();
    
    // Tours bo'limiga o'tish va yangilash
    showDashboardSection('tours');
    loadAdminTours();
    
    showAdminToast('Yangi tur muvaffaqiyatli qo\'shildi!', 'success');
    
    // Bildirishnoma yaratish
    const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
    notifications.push({
        id: Date.now(),
        userId: 'all',
        title: 'Yangi tur qo\'shildi',
        message: `${name} turi qo'shildi! Narxi: $${price}`,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
    
    updateUnreadCounts();
}

// Turni o'chirish
window.deleteTour = function(tourId) {
    if (confirm('Bu turni o\'chirishni xohlaysizmi?')) {
        let tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || [];
        tours = tours.filter(tour => tour.id != tourId);
        localStorage.setItem('tourvoyage_tours', JSON.stringify(tours));
        
        loadAdminTours();
        showAdminToast('Tur o\'chirildi', 'success');
    }
};

// Bronlarni yuklash
function loadAdminBookings() {
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
    const allBookings = document.getElementById('allBookings');
    
    if (!allBookings) return;
    
    allBookings.innerHTML = '';
    
    if (bookings.length === 0) {
        allBookings.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-calendar-times fa-2x text-muted mb-3"></i>
                    <p class="text-muted">Hozircha bronlar mavjud emas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    bookings.forEach((booking, index) => {
        const tour = tours.find(t => t.id == booking.tourId) || { name: 'Noma\'lum tur' };
        const user = users.find(u => u.id == booking.userId) || { name: 'Noma\'lum' };
        const statusBadge = booking.status === 'tasdiqlangan' ? 'bg-success' : 
                           booking.status === 'kutilmoqda' ? 'bg-warning' : 'bg-danger';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${tour.name}</td>
            <td>${new Date(booking.date).toLocaleDateString('uz-UZ')}</td>
            <td>$${booking.price || tour.price || 0}</td>
            <td><span class="badge ${statusBadge}">${booking.status || 'kutilmoqda'}</span></td>
            <td>
                <button class="btn btn-sm btn-success me-1" onclick="changeBookingStatus(${booking.id}, 'tasdiqlangan')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="changeBookingStatus(${booking.id}, 'bekor qilindi')">
                    <i class="fas fa-times"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewBookingDetails(${booking.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        allBookings.appendChild(row);
    });
}

// Bron holatini o'zgartirish
window.changeBookingStatus = function(bookingId, newStatus) {
    let bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    bookings = bookings.map(booking => {
        if (booking.id == bookingId) {
            const updatedBooking = { ...booking, status: newStatus };
            
            // Foydalanuvchiga bildirishnoma yuborish
            const notifications = JSON.parse(localStorage.getItem('tourvoyage_notifications')) || [];
            notifications.push({
                id: Date.now(),
                userId: booking.userId,
                title: 'Bron holati o\'zgardi',
                message: `Sizning ${booking.tourName} tur uchun broningiz "${newStatus}" holatiga o'zgartirildi`,
                timestamp: new Date().toISOString(),
                read: false
            });
            localStorage.setItem('tourvoyage_notifications', JSON.stringify(notifications));
            
            return updatedBooking;
        }
        return booking;
    });
    
    localStorage.setItem('tourvoyage_bookings', JSON.stringify(bookings));
    loadAdminBookings();
    loadDashboardStats();
    
    showAdminToast(`Bron holati "${newStatus}" ga o'zgartirildi`, 'success');
    updateUnreadCounts();
};

// Bron tafsilotlarini ko'rish
window.viewBookingDetails = function(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const booking = bookings.find(b => b.id == bookingId);
    
    if (!booking) return;
    
    alert(
        `Bron ma'lumotlari:\n\n` +
        `Bron raqami: ${booking.id}\n` +
        `Foydalanuvchi: ${booking.userName}\n` +
        `Tur: ${booking.tourName}\n` +
        `Sana: ${booking.date}\n` +
        `Narx: $${booking.price}\n` +
        `Holati: ${booking.status}\n` +
        `To'lov usuli: ${booking.paymentMethod || 'Karta'}\n` +
        `To'lov sanasi: ${booking.paymentDate || 'Noma\'lum'}`
    );
};

// Foydalanuvchilarni yuklash
function loadAdminUsers() {
    const users = JSON.parse(localStorage.getItem('tourvoyage_users')) || [];
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const usersList = document.getElementById('usersList');
    
    if (!usersList) return;
    
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-users fa-2x text-muted mb-3"></i>
                    <p class="text-muted">Hozircha foydalanuvchilar mavjud emas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const userBookings = bookings.filter(b => b.userId == user.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'Ko\'rsatilmagan'}</td>
            <td>${userBookings}</td>
            <td>${new Date(user.registered || Date.now()).toLocaleDateString('uz-UZ')}</td>
        `;
        usersList.appendChild(row);
    });
}

// Dashboard grafiklari
function loadDashboardCharts() {
    // Oylik bronlar grafigi
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const monthlyData = getMonthlyBookingData(bookings);
    
    const monthlyCtx = document.getElementById('monthlyBookingsChart');
    if (monthlyCtx) {
        if (window.monthlyChart) window.monthlyChart.destroy();
        
        window.monthlyChart = new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthlyData.months,
                datasets: [{
                    label: 'Bronlar soni',
                    data: monthlyData.counts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Tur populyarligi
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    const tourPopularityData = getTourPopularityData(bookings, tours);
    
    const popularityCtx = document.getElementById('tourPopularityChart');
    if (popularityCtx) {
        if (window.popularityChart) window.popularityChart.destroy();
        
        window.popularityChart = new Chart(popularityCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: tourPopularityData.names,
                datasets: [{
                    data: tourPopularityData.counts,
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Daromad grafigi
function loadRevenueChart() {
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const revenueData = getMonthlyRevenueData(bookings);
    
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        if (window.revenueChart) window.revenueChart.destroy();
        
        window.revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: revenueData.months,
                datasets: [{
                    label: 'Daromad ($)',
                    data: revenueData.revenues,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 1
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
    }
}

// Hisobot statistikasi
function loadReportStats() {
    const bookings = JSON.parse(localStorage.getItem('tourvoyage_bookings')) || [];
    const tours = JSON.parse(localStorage.getItem('tourvoyage_tours')) || getDefaultTours();
    
    // O'rtacha bron narxi
    const confirmedBookings = bookings.filter(b => b.status === 'tasdiqlangan');
    const avgPrice = confirmedBookings.length > 0 ? 
        confirmedBookings.reduce((sum, b) => sum + (b.price || 0), 0) / confirmedBookings.length : 0;
    
    if (document.getElementById('avgBookingPrice')) {
        document.getElementById('avgBookingPrice').textContent = '$' + avgPrice.toFixed(2);
    }
    
    // Eng mashhur tur
    const tourCounts = {};
    confirmedBookings.forEach(booking => {
        if (booking.tourId) {
            tourCounts[booking.tourId] = (tourCounts[booking.tourId] || 0) + 1;
        }
    });
    
    let mostPopularTour = '-';
    let maxCount = 0;
    
    Object.keys(tourCounts).forEach(tourId => {
        if (tourCounts[tourId] > maxCount) {
            maxCount = tourCounts[tourId];
            const tour = tours.find(t => t.id == tourId);
            mostPopularTour = tour ? tour.name : 'Noma\'lum';
        }
    });
    
    if (document.getElementById('mostPopularTour')) {
        document.getElementById('mostPopularTour').textContent = mostPopularTour;
    }
    
    // Daromad o'sishi
    const revenueGrowth = calculateRevenueGrowth(bookings);
    if (document.getElementById('revenueGrowth')) {
        document.getElementById('revenueGrowth').textContent = revenueGrowth + '%';
    }
}

// ==================== YORDAMCHI FUNKSIYALAR ====================

function getMonthlyBookingData(bookings) {
    const monthlyCounts = {};
    const now = new Date();
    
    // Oxirgi 6 oy
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' });
        monthlyCounts[key] = 0;
    }
    
    // Bronlarni hisoblash
    bookings.forEach(booking => {
        try {
            const bookingDate = new Date(booking.date);
            const key = bookingDate.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' });
            
            if (monthlyCounts.hasOwnProperty(key)) {
                monthlyCounts[key]++;
            }
        } catch (e) {
            console.error('Date parsing error:', e);
        }
    });
    
    return {
        months: Object.keys(monthlyCounts),
        counts: Object.values(monthlyCounts)
    };
}

function getTourPopularityData(bookings, tours) {
    const tourCounts = {};
    const confirmedBookings = bookings.filter(b => b.status === 'tasdiqlangan');
    
    // Faqat top 5 ta turni ko'rsatish
    confirmedBookings.forEach(booking => {
        if (booking.tourId) {
            tourCounts[booking.tourId] = (tourCounts[booking.tourId] || 0) + 1;
        }
    });
    
    // Sort by count
    const sortedTours = Object.keys(tourCounts)
        .sort((a, b) => tourCounts[b] - tourCounts[a])
        .slice(0, 5);
    
    return {
        names: sortedTours.map(tourId => {
            const tour = tours.find(t => t.id == tourId);
            return tour ? tour.name.substring(0, 15) + (tour.name.length > 15 ? '...' : '') : 'Noma\'lum';
        }),
        counts: sortedTours.map(tourId => tourCounts[tourId])
    };
}

function getMonthlyRevenueData(bookings) {
    const monthlyRevenue = {};
    const now = new Date();
    const confirmedBookings = bookings.filter(b => b.status === 'tasdiqlangan');
    
    // Oxirgi 6 oy
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' });
        monthlyRevenue[key] = 0;
    }
    
    // Daromadlarni hisoblash
    confirmedBookings.forEach(booking => {
        try {
            const bookingDate = new Date(booking.date);
            const key = bookingDate.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' });
            
            if (monthlyRevenue.hasOwnProperty(key)) {
                monthlyRevenue[key] += (booking.price || 0);
            }
        } catch (e) {
            console.error('Date parsing error:', e);
        }
    });
    
    return {
        months: Object.keys(monthlyRevenue),
        revenues: Object.values(monthlyRevenue)
    };
}

function calculateRevenueGrowth(bookings) {
    const now = new Date();
    const confirmedBookings = bookings.filter(b => b.status === 'tasdiqlangan');
    
    // Joriy oy daromadi
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthRevenue = confirmedBookings
        .filter(b => {
            try {
                const date = new Date(b.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            } catch (e) {
                return false;
            }
        })
        .reduce((sum, b) => sum + (b.price || 0), 0);
    
    // O'tgan oy daromadi
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthRevenue = confirmedBookings
        .filter(b => {
            try {
                const date = new Date(b.date);
                return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
            } catch (e) {
                return false;
            }
        })
        .reduce((sum, b) => sum + (b.price || 0), 0);
    
    if (lastMonthRevenue === 0) return currentMonthRevenue > 0 ? '100' : '0';
    
    const growth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    return growth.toFixed(1);
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

// Dastur ishga tushganda demo ma'lumotlarni yaratish
function createDemoData() {
    // Agar data yo'q bo'lsa, demo yaratish
    if (!localStorage.getItem('tourvoyage_contacts')) {
        const demoContacts = [
            {
                id: 1,
                name: "Ali Valiyev",
                email: "ali@example.com",
                message: "Istanbul turi haqida ma'lumot kerak. Qancha vaqt davom etadi?",
                date: new Date(Date.now() - 3600000).toISOString(),
                status: "yangi"
            },
            {
                id: 2,
                name: "Sara Husanova",
                email: "sara@example.com",
                message: "Dubai uchun viza masalasi qanday? Yordam bera olasizmi?",
                date: new Date(Date.now() - 7200000).toISOString(),
                status: "o'qilgan"
            }
        ];
        localStorage.setItem('tourvoyage_contacts', JSON.stringify(demoContacts));
    }
    
    if (!localStorage.getItem('tourvoyage_notifications')) {
        const demoNotifications = [
            {
                id: 1,
                userId: "all",
                title: "Yangi tur qo'shildi",
                message: "Maldives uchun yangi tur paket qo'shildi!",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false
            },
            {
                id: 2,
                userId: "admin",
                title: "Tizim yangilandi",
                message: "Admin panel yangi funksiyalar bilan yangilandi",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                read: true
            }
        ];
        localStorage.setItem('tourvoyage_notifications', JSON.stringify(demoNotifications));
    }
    
    if (!localStorage.getItem('tourvoyage_chat')) {
        const demoChat = [
            {
                id: 1,
                userId: 1,
                sender: "user",
                message: "Salom! Istanbul turi haqida ma'lumot bera olasizmi?",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                readByAdmin: false
            },
            {
                id: 2,
                userId: 1,
                sender: "admin",
                message: "Salom! Albatta, Istanbul turi 5 kun davom etadi va narxi $450",
                timestamp: new Date(Date.now() - 3500000).toISOString(),
                readByUser: false
            }
        ];
        localStorage.setItem('tourvoyage_chat', JSON.stringify(demoChat));
    }
    
    if (!localStorage.getItem('tourvoyage_tours')) {
        localStorage.setItem('tourvoyage_tours', JSON.stringify(getDefaultTours()));
    }
}
   