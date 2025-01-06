const { isEmpty } = require("../middlewares/object");
const axios = require("axios"); // Import axios
const { Order } = require("../models/order.model");
var ObjectID = require("mongodb").ObjectID;
const moment = require("moment");
const { createLogvnpay } = require("./logvnpay.controller");
const { cloneDeep } = require("lodash");
const {
  ScheduleCourseOnline,
} = require("../models/schedule.course.online.model");
const request = require("request");
const { CourseOnline } = require("../models/course.online.model");
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
function objectToQueryParams(obj) {
  return Object.entries(obj)
    .map(([key, value]) => {
      // Encode key and value as query parameters
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");
}

const getListOrder = async (req, res) => {
  try {
    const { page, limit, txtSearch } = req.query; // Number of documents per page
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { email: { $regex: txtSearch || "", $options: "i" } },
        { name: { $regex: txtSearch || "", $options: "i" } },
        { phone: { $regex: txtSearch || "", $options: "i" } },
      ],
    };

    // const limit = 10; // Number of documents per page
    // const page = 2; // For example, fetch the second page
    // const skip = (page - 1) * limit;
    const orderList = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { unwind: "$user" },
      // {
      //   $match: filter,
      // },
      {
        $sort: {
          vnp_CreateDate: -1,
        },
      },
      {
        $skip: skip, // Skip documents for pagination (based on page number).
      },
      {
        $limit: parseInt(limit), // Limit to a number of results per page.
      },
    ]).exec();
    console.log("orderList", orderList);
    res.status(200).send({ status: "success", data: orderList });
  } catch (error) {
    res.status(500).send(error);
  }
};
const getOrderDetails = async (req, res) => {
  try {
    const { vnp_TxnRef } = req.query;
    const order = await Order.find({
      vnp_TxnRef: vnp_TxnRef,
    });

    if (isEmpty(order)) {
      return res.json({
        status: "error",
        message: "Order not found",
      });
    } else {
      return res.json({
        status: "success",
        data: order[0],
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
      message: error,
    });
  }
};

const createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    let tmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    let date = new Date();
    let orderId = moment(date).format("YYYYMMDDHHmmss");
    let amount = req.query.amount;
    let checkout = req.query.checkout;
    let user_id = req.query.user_id;
    let vnp_BankCode = req.query.vnp_BankCode;
    let vnp_Params = {};
    if (vnp_BankCode !== null && vnp_BankCode !== "") {
      vnp_Params["vnp_BankCode"] = vnp_BankCode;
    }
    // need add in ipn
    let locale = req.query.language;
    if (isEmpty(locale)) {
      locale = "vn";
    }
    const hostName =
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_HOSTNAME
        : process.env.DEV_HOSTNAME;
    let returnUrl = hostName + "/" + process.env.vnp_ReturnUrl;
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    vnp_Params["vnp_CreateDate"] = createDate;
    let currCode = "VND";
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;

    // return will auto post
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_TxnRef"] = orderId + ipAddr.replace(/[^a-zA-Z0-9]/g, "");
    vnp_Params["vnp_OrderInfo"] = "Thanh_toan_cho_ma_GD_" + orderId;
    vnp_Params = sortObject(vnp_Params);

    let newobj = cloneDeep(vnp_Params);
    const query = objectToQueryParams(newobj);
    // createLogvnpay(query, ipAddr, "create", "create");

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // create order
    const newOrder = new Order({
      ...vnp_Params,
      product: JSON.parse(checkout),
      user_id: ObjectID(user_id),
    });
    console.log("vnp_Params", vnp_Params);
    await newOrder.save();
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    res.status(200).send({
      data: vnpUrl,
    });
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }
};

const vnpay_return = async (req, res) => {
  var vnp_Params = req.query;
  var secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  try {
    // vnp_Params = sortObject(vnp_Params);
    var secretKey = process.env.vnp_HashSecret;

    var querystring = require("qs");
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      var vnp_TxnRef = vnp_Params["vnp_TxnRef"];
      const order = await Order.find({
        vnp_TxnRef: vnp_TxnRef,
      });
      //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
      if (isEmpty(order)) {
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Order not found" });
      } else {
        let checkAmout = order[0].vnp_Amount === vnp_Params["vnp_Amount"];
        if (!checkAmout) {
          return res
            .status(200)
            .json({ RspCode: "04", Message: "Invalid amount" });
        }
        // status = 0 : init, 1: successful, 2: error
        let user_id = order[0].user_id;
        let product = order[0].product;
        if (Array.isArray(product) && product.length > 0) {
          // Use an async function to allow `await` in a `forEach` loop
          for (const ele of product) {
            if (ele.type === "courseOnline") {
              console.log("ele", ele);
              let schedule_id = ObjectID(ele.schedule_id);
              const detailSchedule = await ScheduleCourseOnline.findOne({
                _id: schedule_id,
              });
              if (detailSchedule) {
                console.log("Schedule found:");
                let course_id = ObjectID(ele.course_id);
                const detailCourseOnline = await CourseOnline.findOne({
                  _id: course_id,
                });
                if (detailCourseOnline) {
                  // CourseOnline exist, handle the case
                  console.log("CourseOnline found:");

                  const currentDate = new Date();

                  let studentList = detailSchedule.studentList;
                  const index = studentList.findIndex(
                    (stu) => stu._id.toString() === user_id.toString()
                  );
                  if (index !== -1) {
                    // handle user already in course
                    console.log("handle user already in course");
                    // Optionally make some update if necessary

                    if (ele.pharse === "Trọn bộ") {
                      console.log("ele.pharse", ele.pharse);
                      studentList[index].lesson.forEach(
                        (les) => (les.permission = true)
                      );
                      console.log(
                        "studentList[index].lesson",
                        studentList[index].lesson
                      );
                    } else {
                      let indexLesson = studentList[index].lesson.findIndex(
                        (les) => les.pharse === ele.pharse
                      );
                      if (indexLesson !== -1) {
                        studentList[index].lesson[
                          indexLesson
                        ].permission = true;
                      }
                    }
                    // Now update the schedule
                    await ScheduleCourseOnline.findByIdAndUpdate(
                      schedule_id,
                      {
                        studentList: studentList,
                      },
                      { new: true } // Ensures you get the updated document back
                    );
                  } else {
                    // User not yet in course => adduser to Course
                    console.log("User not yet in course ");

                    if (ele.pharse === "Trọn bộ") {
                      detailCourseOnline.lesson.forEach(
                        (les) => (les.permission = true)
                      );
                    } else {
                      let indexLesson = detailCourseOnline.lesson.findIndex(
                        (les) => les.pharse === ele.pharse
                      );
                      if (indexLesson !== -1) {
                        detailCourseOnline.lesson[
                          indexLesson
                        ].permission = true;
                      }
                    }
                    const data = {
                      _id: user_id,
                      lesson: detailCourseOnline.lesson,
                      addAtDate: currentDate,
                    };
                    detailSchedule.studentList.unshift(data);
                    await ScheduleCourseOnline.findByIdAndUpdate(
                      schedule_id,
                      {
                        studentList: detailSchedule.studentList,
                      },
                      { new: true }
                    );
                  }
                } else {
                  // CourseOnline does not exist, handle the case
                  console.log("No schedule found with this ID.");
                }
              } else {
                // detailSchedule does not exist, handle the case
                console.log("No schedule found with this ID.");
              }
              // console.log("detailSchedule", detailSchedule);
            }
          }
        }
        if (order[0].status === "1") {
          return res.status(200).json({
            RspCode: "00",
            Message: "Confirm Success",
            order: order[0],
          });
        }
        if (order[0].status === "2") {
          return res
            .status(200)
            .json({ RspCode: "03", Message: "Confirm Error", order: order[0] });
        }
        if (order[0].status === "0") {
          console.log("order[0].status = 0");
          return res.status(200).json({
            RspCode: "24",
            Message: "Customer cancel",
            order: order[0],
          });
        }
      }
    } else {
      res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).send({
      RspCode: "99",
      Message: "Exception Error",
    });
  }
};

const vnpay_ipn = async (req, res) => {
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  var vnp_Params = req.query;
  var secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  try {
    let newobj = cloneDeep(vnp_Params);
    const query = objectToQueryParams(newobj);
    // vnp_Params = sortObject(vnp_Params);
    var secretKey = process.env.vnp_HashSecret;

    var querystring = require("qs");
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      var vnp_TxnRef = vnp_Params["vnp_TxnRef"];
      const order = await Order.find({
        vnp_TxnRef: vnp_TxnRef,
      });
      //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
      if (isEmpty(order)) {
        createLogvnpay(query, ipAddr, "Order not found", "IPN");
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Order not found" });
      } else {
        let checkAmout = order[0].vnp_Amount === vnp_Params["vnp_Amount"];
        if (!checkAmout) {
          createLogvnpay(query, ipAddr, "Invalid amount", "IPN");
          return res
            .status(200)
            .json({ RspCode: "04", Message: "Invalid amount" });
        }
        // status = 0 : init, 1: successful, 2: error
        if (order[0].status !== "0") {
          createLogvnpay(query, ipAddr, "Order already confirmed", "IPN");
          return res
            .status(200)
            .json({ RspCode: "02", Message: "Order already confirmed" });
        }
        if (
          vnp_Params["vnp_ResponseCode"] !== "00" &&
          vnp_Params["vnp_TransactionStatus"] !== "00"
        ) {
          order[0].status = "2";
          console.log("order[0].status = 2");
        } else {
          order[0].status = "1";
          console.log("order[0].status = 1");
          // update user / schedule
          let user_id = order[0].user_id;
          let product = order[0].product;

          if (Array.isArray(product) && product.length > 0) {
            // Use an async function to allow `await` in a `forEach` loop
            for (const ele of product) {
              if (ele.type === "courseOnline") {
                console.log("ele", ele);
                let schedule_id = ObjectID(ele.schedule_id);
                const detailSchedule = await ScheduleCourseOnline.findOne({
                  _id: schedule_id,
                });
                if (detailSchedule) {
                  console.log("Schedule found:");
                  let course_id = ObjectID(ele.course_id);
                  const detailCourseOnline = await CourseOnline.findOne({
                    _id: course_id,
                  });
                  if (detailCourseOnline) {
                    // CourseOnline exist, handle the case
                    console.log("CourseOnline found:");

                    const currentDate = new Date();

                    let studentList = detailSchedule.studentList;
                    const index = studentList.findIndex(
                      (stu) => stu._id.toString() === user_id.toString()
                    );
                    if (index !== -1) {
                      // handle user already in course
                      console.log("handle user already in course");
                      // Optionally make some update if necessary

                      if (ele.pharse === "Trọn bộ") {
                        studentList[index].lesson.forEach(
                          (les) => (les.permission = true)
                        );
                      } else {
                        let indexLesson = studentList[index].lesson.findIndex(
                          (les) => les.pharse === ele.pharse
                        );
                        if (indexLesson !== -1) {
                          studentList[index].lesson[
                            indexLesson
                          ].permission = true;
                        }
                      }
                      // Now update the schedule
                      await ScheduleCourseOnline.findByIdAndUpdate(
                        schedule_id,
                        {
                          studentList: studentList,
                        },
                        { new: true } // Ensures you get the updated document back
                      );
                    } else {
                      // User not yet in course => adduser to Course
                      console.log("User not yet in course ");

                      if (ele.pharse === "full") {
                        detailCourseOnline.lesson.forEach(
                          (les) => (les.permission = true)
                        );
                      } else {
                        let indexLesson = detailCourseOnline.lesson.findIndex(
                          (les) => les.pharse === ele.pharse
                        );
                        if (indexLesson !== -1) {
                          detailCourseOnline.lesson[
                            indexLesson
                          ].permission = true;
                        }
                      }
                      const data = {
                        _id: user_id,
                        lesson: detailCourseOnline.lesson,
                        addAtDate: currentDate,
                      };
                      detailSchedule.studentList.unshift(data);
                      await ScheduleCourseOnline.findByIdAndUpdate(
                        schedule_id,
                        {
                          studentList: detailSchedule.studentList,
                        },
                        { new: true }
                      );
                    }
                  } else {
                    // CourseOnline does not exist, handle the case
                    console.log("No schedule found with this ID.");
                  }
                } else {
                  // detailSchedule does not exist, handle the case
                  console.log("No schedule found with this ID.");
                }
                // console.log("detailSchedule", detailSchedule);
              }
            }
          }
        }
        await Order.findOneAndUpdate(
          { vnp_TxnRef: vnp_TxnRef },
          { ...order[0] },
          { new: true }
        ).exec();

        createLogvnpay(query, ipAddr, "Confirm Success", "IPN");
        return res
          .status(200)
          .json({ RspCode: "00", Message: "Confirm Success" });
      }
    } else {
      createLogvnpay(query, ipAddr, "Invalid signature", "IPN");
      res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    }
  } catch (error) {
    createLogvnpay(query, ipAddr, "Exception Error", "IPN");
    res.status(500).send({
      RspCode: "99",
      Message: "Exception Error",
    });
  }
};

const getDetailPaymentVnpay = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    let date = new Date();

    let crypto = require("crypto");

    let vnp_TmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;
    let vnp_Api = process.env.vnp_Api;
    console.log("req.body", req.body);
    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    console.log("vnp_TxnRef", vnp_TxnRef);
    console.log(
      "vnp_TransactionDate",
      vnp_TransactionDate,
      typeof vnp_TransactionDate
    );
    let vnp_RequestId = moment(date).format("HHmmss");
    let vnp_Version = "2.1.0";
    let vnp_Command = "querydr";
    let vnp_OrderInfo = "Truy van GD ma:" + vnp_TxnRef;

    let vnp_IpAddr = "14.161.32.157";
    // req.headers["x-forwarded-for"] ||
    // req.connection.remoteAddress ||
    // req.socket.remoteAddress ||
    // req.connection.socket.remoteAddress;
    console.log("vnp_IpAddr", vnp_IpAddr);
    let currCode = "VND";
    let vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");

    let data =
      vnp_RequestId +
      "|" +
      vnp_Version +
      "|" +
      vnp_Command +
      "|" +
      vnp_TmnCode +
      "|" +
      vnp_TxnRef +
      "|" +
      vnp_TransactionDate +
      "|" +
      vnp_CreateDate +
      "|" +
      vnp_IpAddr +
      "|" +
      vnp_OrderInfo;

    console.log("data", data);
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, "utf-8")).digest("hex");

    let dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
    };
    console.log("vnp_Api", vnp_Api);
    console.log("dataObj", dataObj);
    // /merchant_webapi/api/transaction
    // Make a POST request using axios

    request(
      {
        url: vnp_Api,
        method: "POST",
        json: true,
        body: dataObj,
      },
      function (error, response, body) {
        console.log("response.body", body);
        console.log("response", response);
      }
    );
    // Log the response from the API
    // console.log(response.data);
    // Optionally send a response back to the client
    res.status(200).json(response);
  } catch (err) {
    // console.log("err", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDetailRefundVnpay = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    let date = new Date();

    let config = require("config");
    let crypto = require("crypto");

    let vnp_TmnCode = config.get("vnp_TmnCode");
    let secretKey = config.get("vnp_HashSecret");
    let vnp_Api = config.get("vnp_Api");

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    let vnp_Amount = req.body.amount * 100;
    let vnp_TransactionType = req.body.transType;
    let vnp_CreateBy = req.body.user;

    let currCode = "VND";

    let vnp_RequestId = moment(date).format("HHmmss");
    let vnp_Version = "2.1.0";
    let vnp_Command = "refund";
    let vnp_OrderInfo = "Hoan tien GD ma:" + vnp_TxnRef;

    let vnp_IpAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");

    let vnp_TransactionNo = "0";

    let data =
      vnp_RequestId +
      "|" +
      vnp_Version +
      "|" +
      vnp_Command +
      "|" +
      vnp_TmnCode +
      "|" +
      vnp_TransactionType +
      "|" +
      vnp_TxnRef +
      "|" +
      vnp_Amount +
      "|" +
      vnp_TransactionNo +
      "|" +
      vnp_TransactionDate +
      "|" +
      vnp_CreateBy +
      "|" +
      vnp_CreateDate +
      "|" +
      vnp_IpAddr +
      "|" +
      vnp_OrderInfo;
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, "utf-8")).digest("hex");

    let dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TransactionType: vnp_TransactionType,
      vnp_TxnRef: vnp_TxnRef,
      vnp_Amount: vnp_Amount,
      vnp_TransactionNo: vnp_TransactionNo,
      vnp_CreateBy: vnp_CreateBy,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
    };

    // Make a POST request using axios
    const response = await axios.post(vnp_Api, dataObj);

    // Log the response from the API
    console.log(response.data);
    // Optionally send a response back to the client
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  createPaymentUrl,
  vnpay_return,
  vnpay_ipn,
  getListOrder,
  getOrderDetails,
  getDetailPaymentVnpay,
  getDetailRefundVnpay,
};
