const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "blisshype.com@gmail.com",
    pass: "anjv ixan eufa xlsb",
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "blisshype.com@gmail.com",
    to: to,
    subject: subject,
    html: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error occurred: " + error.message);
    }
  //  console.log("Email sent: " + info.response);
  });
};

module.exports = {
  sendEmail,
};
