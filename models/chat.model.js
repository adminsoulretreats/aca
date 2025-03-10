const { Schema, model } = require("mongoose");

const ChatMessageSchema = new Schema({
    sender: {
        type: String,
        required: true, // 'client' hoặc 'admin'
        enum: ['client', 'admin']
    },
    clientId: {
        type: String,
        required: true // ID định danh của client (có thể là session ID hoặc một ID tự tạo)
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    adminId: {
        type: String,
        default: null // ID của admin đang xử lý chat này
    }
}, { timestamps: true });

// Index để tìm kiếm nhanh theo clientId
ChatMessageSchema.index({ clientId: 1 });

const ChatMessage = model('ChatMessage', ChatMessageSchema);

// Schema cho phiên chat
const ChatSessionSchema = new Schema({
    clientId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    lastMessage: {
        type: Date,
        default: Date.now
    },
    adminId: {
        type: String,
        default: null
    },
    unreadCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const ChatSession = model('ChatSession', ChatSessionSchema);

module.exports = {
    ChatMessage,
    ChatSession
}; 