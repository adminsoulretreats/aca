const { Server } = require('socket.io');
const { ChatMessage, ChatSession } = require('../models/chat.model');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        // Client joins their room
        socket.on('join', (clientId) => {
            socket.join(clientId);
            console.log(`Client ${clientId} joined their room`);
        });

        // Admin joins a specific client's room
        socket.on('admin-join', (clientId) => {
            socket.join(clientId);
            console.log(`Admin joined room ${clientId}`);
        });

        // Handle new message
        socket.on('send-message', async (data) => {
            try {
                const { clientId, message, sender, adminId } = data;

                // Lưu tin nhắn vào database
                const newMessage = new ChatMessage({
                    clientId,
                    message,
                    sender,
                    adminId: sender === 'admin' ? adminId : null
                });
                await newMessage.save();

                // Cập nhật phiên chat
                await ChatSession.findOneAndUpdate(
                    { clientId },
                    {
                        lastMessage: new Date(),
                        $inc: { unreadCount: 1 },
                        status: 'active',
                        adminId: sender === 'admin' ? adminId : null
                    }
                );

                // Gửi tin nhắn đến room tương ứng
                io.to(clientId).emit('new-message', {
                    message: newMessage,
                    sender
                });

                // Nếu là tin nhắn từ client, thông báo cho admin
                if (sender === 'client') {
                    io.emit('new-client-message', {
                        clientId,
                        message: newMessage
                    });
                }
            } catch (error) {
                console.error('Error handling message:', error);
                socket.emit('error', { message: 'Error sending message' });
            }
        });

        // Handle typing status
        socket.on('typing', (data) => {
            const { clientId, isTyping, sender } = data;
            socket.to(clientId).emit('typing-status', { isTyping, sender });
        });

        // Handle when client or admin leaves
        socket.on('leave', (clientId) => {
            socket.leave(clientId);
            console.log(`Client/Admin left room ${clientId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

// Hàm để gửi tin nhắn từ server
const sendSystemMessage = async (clientId, message) => {
    try {
        const systemMessage = new ChatMessage({
            clientId,
            message,
            sender: 'admin',
            adminId: 'system'
        });
        await systemMessage.save();

        if (io) {
            io.to(clientId).emit('new-message', {
                message: systemMessage,
                sender: 'system'
            });
        }
    } catch (error) {
        console.error('Error sending system message:', error);
    }
};

module.exports = {
    initializeSocket,
    sendSystemMessage
}; 