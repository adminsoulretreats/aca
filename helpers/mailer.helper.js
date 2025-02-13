const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	// service: "gmail",
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORDEMAIL, // App password gmail (Google policy from 2022)
	},
})

/**
 *
 * @param {*} target : Gửi tới ai
 * @param {*} subject : Đối tượng
 * @param {*} content : Nội dung
 */
const mailer = async (target, subject, content, html) => {
	let mailOptions = {
		from: process.env.EMAIL,
		to: target,
		subject: subject,
		text: content,
		html: html,
	}

	try {
		let info = await transporter.sendMail(mailOptions)
		console.log("Email sent: " + info.response)
	} catch (error) {
		console.error("Lỗi gửi email:", error)
	}
}

module.exports = {
	mailer,
}
