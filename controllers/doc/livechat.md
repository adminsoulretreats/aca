# Live Chat API Documentation

## Overview
This API provides real-time chat functionalities for users and administrators. It includes session management, chat history retrieval, and message handling using REST API and WebSockets.

## Base URL
```
https://yourdomain.com/api/chat
```

## Authentication
Currently, authentication is not required for API access, but it is recommended to implement authentication for security purposes.

---

## **1. Initialize Chat Session**
### **Endpoint:**
```
POST /initialize
```
### **Description:**
Creates or retrieves a chat session for a given client.

### **Request Body:**
```json
{
    "clientId": "user123"
}
```
### **Response:**
```json
{
    "session": {
        "clientId": "user123",
        "status": "active"
    },
    "messages": []
}
```
### **Errors:**
- `400 Bad Request`: Missing clientId
- `500 Internal Server Error`: Server error

---

## **2. Get Active Sessions**
### **Endpoint:**
```
GET /sessions
```
### **Description:**
Retrieves a list of active chat sessions, sorted by the last message timestamp.

### **Response:**
```json
[
    {
        "clientId": "user123",
        "status": "active",
        "lastMessage": {
            "message": "Hello",
            "createdAt": "2025-03-10T12:00:00Z"
        }
    }
]
```
### **Errors:**
- `500 Internal Server Error`: Server error

---

## **3. Get Chat History**
### **Endpoint:**
```
GET /history/:clientId?page=1&limit=50
```
### **Description:**
Fetches chat messages for a given session, paginated.

### **Response:**
```json
{
    "messages": [
        {
            "message": "Hello",
            "sender": "client",
            "createdAt": "2025-03-10T12:00:00Z"
        }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 2
}
```
### **Errors:**
- `500 Internal Server Error`: Server error

---

## **4. Mark Messages as Read**
### **Endpoint:**
```
PUT /read/:clientId
```
### **Description:**
Marks unread messages as read by the opposite sender.

### **Request Body:**
```json
{
    "sender": "admin"
}
```
### **Response:**
```json
{
    "message": "Messages marked as read"
}
```
### **Errors:**
- `500 Internal Server Error`: Server error

---

## **5. Close Chat Session**
### **Endpoint:**
```
PUT /close/:clientId
```
### **Description:**
Closes an active chat session.

### **Response:**
```json
{
    "message": "Session closed successfully"
}
```
### **Errors:**
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Server error

---

## **WebSocket Events**

### **1. Connect and Join Room**
```js
socket.connect();
socket.emit('join', clientId);
```

### **2. Send Message**
```js
socket.emit('send-message', {
    clientId: 'user123',
    message: 'Hello',
    sender: 'client'
});
```

### **3. Receive New Message**
```js
socket.on('new-message', (data) => {
    console.log(data.message);
});
```

### **4. Typing Notification**
```js
socket.emit('typing', {
    clientId: 'user123',
    isTyping: true,
    sender: 'client'
});
```

---

## Notes
- Ensure proper error handling for real-time chat.
- Consider implementing authentication and authorization for security.
- Optimize database queries for performance.

