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
} = require("../controllers/order.controller");
const {
  ipWhitelistMiddleware,
  authenticate,
  authorize,
} = require("../middlewares/auth/verify-token.middleware");

orderRouter.get("/list", authenticate, authorize(["admin"]), getListOrder);
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

module.exports = {
  orderRouter,
};
