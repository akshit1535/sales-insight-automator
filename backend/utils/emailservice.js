const nodemailer = require("nodemailer");

exports.sendEmail = async (to, summary) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: to,
        subject: "Sales Data Summary",
        text: summary
    });

};