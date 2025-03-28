const express = require("express");
const {
    getOnlineCourseStatistics,
    getOfflineCourseStatistics,
    getPlatformStatistics,
    getAccountStatistics
} = require("../controllers/statistics.controller");

// Create new router for statistics
const staticticsRouter = express.Router();

// Statistics routes
staticticsRouter.get("/online-courses", getOnlineCourseStatistics);
staticticsRouter.get("/account", getAccountStatistics);
// staticticsRouter.get("/offline-courses", getOfflineCourseStatistics);
// staticticsRouter.get("/platform", getPlatformStatistics);

// Export the router
module.exports = {
    staticticsRouter
}
