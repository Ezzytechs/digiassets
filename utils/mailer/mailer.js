const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jameze49@gmail.com",
    pass: process.env.MAIL_SENDER_KEY,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: "jameze49@gmail.com",
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  sendEmail,
};
