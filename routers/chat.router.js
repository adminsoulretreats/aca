const express = require("express");
const chatRouter = express.Router();

const {
    initializeChat,
    getActiveSessions,
    getChatHistory,
    markMessagesAsRead,
    closeSession,
    sendEmail
} = require("../controllers/chat.controller");

// // Khởi tạo chat session mới hoặc lấy session hiện có
// chatRouter.post("/initialize", initializeChat);

// // Lấy danh sách các phiên chat đang hoạt động (cho admin)
// chatRouter.get("/sessions", getActiveSessions);

// // Lấy lịch sử chat của một phiên
// chatRouter.get("/history/:clientId", getChatHistory);

// // Đánh dấu tin nhắn đã đọc
// chatRouter.put("/read/:clientId", markMessagesAsRead);

// // Đóng phiên chat
// chatRouter.put("/close/:clientId", closeSession);

// // Make test chat
// chatRouter.get("/test", (req, res) => {
//     res.send("Hello World");
// });

chatRouter.post("/send-email", sendEmail);

module.exports = {
    chatRouter,
};