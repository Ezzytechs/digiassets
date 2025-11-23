require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.SITE_EMAIL; 

  if (!from) {
    throw new Error("MAIL_FROM_EMAIL is not defined in environment variables");
  }

  const msg = {
    to,
    from,
    subject,
    html,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log("✅ Email sent successfully");
    return response;
  } catch (err) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
    throw new Error(err.message);
  }
};

module.exports = { sendEmail };
