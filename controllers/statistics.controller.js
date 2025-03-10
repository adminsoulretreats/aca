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
    // getOfflineCourseStatistics,
    // getPlatformStatistics
}; 