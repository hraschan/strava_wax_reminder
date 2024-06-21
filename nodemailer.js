var nodemailer = require("nodemailer");

const MAIL_USER = process.env.MAIL_USER || "";
const MAIL_PASS = process.env.MAIL_PASS || "";
const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  secure: true,
});

module.exports = transporter;
