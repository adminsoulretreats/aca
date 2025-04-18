const express = require("express");
const orderRouter = express.Router();

// Controller
const {
  createPaymentUrl,
  vnpay_return,
  vnpay_ipn,
  getOrderDetails,
  getDetailPayment,
  getDetailPaymentVnpay,
  getListOrder,
  getOrderById,
} = require("../controllers/order.controller");
const {
  ipWhitelistMiddleware,
  authenticate,
  authorize,
} = require("../middlewares/auth/verify-token.middleware");

// Admin route - can view all orders
orderRouter.get("/list", getListOrder);
// User route - can only view their own orders
orderRouter.get("/my-orders", getListOrder);
orderRouter.get("/details", getOrderDetails);
orderRouter.get("/create_payment_url", createPaymentUrl);
orderRouter.get("/vnpay_ipn", ipWhitelistMiddleware, vnpay_ipn);
orderRouter.get("/vnpay_return", vnpay_return);
orderRouter.post(
  "/querydr_vnpay",
  authenticate,
  authorize(["admin"]),
  getDetailPaymentVnpay
);
// Get specific order by ID (with access control in the controller)
// This must be at the end to avoid conflicts with other routes
orderRouter.get("/:id", getOrderById);

module.exports = {
  orderRouter,
};
