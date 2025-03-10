const { ChatMessage, ChatSession } = require('../models/chat.model');

// Khởi tạo hoặc lấy phiên chat cho client
const initializeChat = async (req, res) => {
    try {
        const { clientId } = req.body;

        if (!clientId) {
            return res.status(400).json({ message: 'Client ID is required' });
        }

        let chatSession = await ChatSession.findOne({ clientId });

        if (!chatSession) {
            chatSession = new ChatSession({ clientId });
            await chatSession.save();
        }

        // Lấy 50 tin nhắn gần nhất của phiên chat này
        const messages = await ChatMessage.find({ clientId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            session: chatSession,
            messages: messages.reverse()
        });
    } catch (error) {
        console.error('Error initializing chat:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Lấy danh sách phiên chat cho admin
const getActiveSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ status: 'active' })
            .sort({ lastMessage: -1 });

        // Lấy tin nhắn cuối cùng cho mỗi phiên chat
        const sessionsWithLastMessage = await Promise.all(sessions.map(async (session) => {
            const lastMessage = await ChatMessage.findOne({ clientId: session.clientId })
                .sort({ createdAt: -1 });
            return {
                ...session.toObject(),
                lastMessage
            };
        }));

        res.status(200).json(sessionsWithLastMessage);
    } catch (error) {
        console.error('Error getting active sessions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Lấy lịch sử chat của một phiên
const getChatHistory = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await ChatMessage.find({ clientId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ChatMessage.countDocuments({ clientId });

        res.status(200).json({
            messages: messages.reverse(),
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Đánh dấu tin nhắn đã đọc
const markMessagesAsRead = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { sender } = req.body; // 'admin' hoặc 'client'

        await ChatMessage.updateMany(
            {
                clientId,
                sender: sender === 'admin' ? 'client' : 'admin',
                read: false
            },
            { read: true }
        );

        // Cập nhật số tin nhắn chưa đọc
        await ChatSession.findOneAndUpdate(
            { clientId },
            { unreadCount: 0 }
        );

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Đóng phiên chat
const closeSession = async (req, res) => {
    try {
        const { clientId } = req.params;

        const session = await ChatSession.findOneAndUpdate(
            { clientId },
            { status: 'closed' },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.status(200).json({ message: 'Session closed successfully', session });
    } catch (error) {
        console.error('Error closing session:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/*
API Examples:

1. Khởi tạo chat session mới:
POST /api/chat/initialize
Body: {
    "clientId": "user123"
}

2. Lấy danh sách phiên chat đang hoạt động (cho admin):
GET /api/chat/sessions

3. Lấy lịch sử chat:
GET /api/chat/history/user123?page=1&limit=50 (bị lỗi)

4. Đánh dấu tin nhắn đã đọc:
PUT /api/chat/read/user123
Body: {
    "sender": "admin" // hoặc "client"
}

5. Đóng phiên chat:
PUT /api/chat/close/user123

Socket Events (Client-side):
- Kết nối: socket.connect()
- Tham gia phòng: socket.emit('join', clientId)
- Gửi tin nhắn: 
  socket.emit('send-message', {
    clientId: 'user123',
    message: 'Hello',
    sender: 'client' // hoặc 'admin'
    adminId: 'admin123' // chỉ cần khi sender là admin
  })
- Lắng nghe tin nhắn mới: 
  socket.on('new-message', (data) => {
    console.log(data.message, data.sender)
  })
- Thông báo đang gõ:
  socket.emit('typing', {
    clientId: 'user123',
    isTyping: true,
    sender: 'client' // hoặc 'admin'
  })
*/

module.exports = {
    initializeChat,
    getActiveSessions,
    getChatHistory,
    markMessagesAsRead,
    closeSession
}; 