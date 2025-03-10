require("dotenv").config();
// Import library
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { rootRouter } = require("./routers/rootRouter");
const http = require('http');
const { initializeSocket } = require('./services/socket.service');

const app = express();
const server = http.createServer(app);
const db = require("./config/db");
const path = require("path");

// Initialize Socket.IO
const io = initializeSocket(server);

const publicPathDirectory = path.join(__dirname, "./public");

app.use(bodyParser.json());
const corsOptions = {
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/", rootRouter);
app.use("/public", express.static(publicPathDirectory));

db.connect();

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Backend đang chạy trên PORT: ${port}`);
});
