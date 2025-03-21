const { CourseOnline } = require("../models/course.online.model");
const { User } = require("../models/users.model");

// Get statistics for online courses
const getOnlineCourseStatistics = async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const fansipanCount = await User.countDocuments({
            'mountainRegister.fansipan': { $exists: true, $eq: true },
            createdAt: { $gte: startDate, $lte: endDate }
        });
        const kinabaluCount = await User.countDocuments({
            'mountainRegister.kinabalu': { $exists: true, $eq: true },
            createdAt: { $gte: startDate, $lte: endDate }
        });
        const kilimanjaroCount = await User.countDocuments({
            'mountainRegister.kilimanjaro': { $exists: true, $eq: true },
            createdAt: { $gte: startDate, $lte: endDate }
        });
        const aconcaquaCount = await User.countDocuments({
            'mountainRegister.aconcaqua': { $exists: true, $eq: true },
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const totalUsers = await User.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        res.status(200).json({
            success: true,
            data: {
                dateRange: {
                    startDate,
                    endDate
                },
                totalUsers,
                mountainStats: {
                    fansipan: fansipanCount,
                    kinabalu: kinabaluCount,
                    kilimanjaro: kilimanjaroCount,
                    aconcaqua: aconcaquaCount
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error getting mountain registration statistics",
            error: error.message
        });
    }
};

const getAccountStatistics = async (req, res) => {
    try {
        // Lấy tổng số lượng user
        const totalUsers = await User.countDocuments();

        // Lấy danh sách user đã đăng ký ít nhất một khóa học
        const registeredUsers = await User.find({
            $or: [
                { 'mountainRegister.fansipan': true },
                { 'mountainRegister.kinabalu': true },
                { 'mountainRegister.kilimanjaro': true },
                { 'mountainRegister.aconcaqua': true }
            ]
        }).select('name phone email');

        // Đếm số lượng user đăng ký mỗi khóa học
        const countByCourse = await User.aggregate([
            {
                $group: {
                    _id: null,
                    fansipan: { $sum: { $cond: [{ $eq: ["$mountainRegister.fansipan", true] }, 1, 0] } },
                    kinabalu: { $sum: { $cond: [{ $eq: ["$mountainRegister.kinabalu", true] }, 1, 0] } },
                    kilimanjaro: { $sum: { $cond: [{ $eq: ["$mountainRegister.kilimanjaro", true] }, 1, 0] } },
                    aconcaqua: { $sum: { $cond: [{ $eq: ["$mountainRegister.aconcaqua", true] }, 1, 0] } }
                }
            }
        ]);

        if (!registeredUsers.length) {
            return res.status(404).json({
                success: false,
                message: "No registered users found",
                totalUsers
            });
        }

        res.status(200).json({
            success: true,
            totalUsers,
            registeredUserCount: registeredUsers.length,
            courseRegistrationCounts: countByCourse[0] || { fansipan: 0, kinabalu: 0, kilimanjaro: 0, aconcaqua: 0 },
            data: registeredUsers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error getting account statistics", error: error.message });
    }
};




// // Get statistics for offline courses
// const getOfflineCourseStatistics = async (req, res) => {
//     try {
//         const totalOfflineCourses = await Course.countDocuments();
//         const activeOfflineCourses = await Course.countDocuments({ status: "active" });

//         res.status(200).json({
//             success: true,
//             data: {
//                 totalOfflineCourses,
//                 activeOfflineCourses
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error getting offline course statistics",
//             error: error.message
//         });
//     }
// };

// // Get general platform statistics
// const getPlatformStatistics = async (req, res) => {
//     try {
//         const totalUsers = await User.countDocuments();
//         const totalTeachers = await User.countDocuments({ role: "teacher" });
//         const totalStudents = await User.countDocuments({ role: "student" });
//         const totalCourses = await Promise.all([
//             Course.countDocuments(),
//             CourseOnline.countDocuments()
//         ]);

//         res.status(200).json({
//             success: true,
//             data: {
//                 totalUsers,
//                 totalTeachers,
//                 totalStudents,
//                 totalCourses: totalCourses[0] + totalCourses[1]
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Error getting platform statistics",
//             error: error.message
//         });
//     }
// };

module.exports = {
    getOnlineCourseStatistics,
    getAccountStatistics,
    // getOfflineCourseStatistics,
    // getPlatformStatistics
}; 