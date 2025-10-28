require("dotenv").config();
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "key-yourkeyhere",
});
console.log("Mailgun API Key:", process.env.MAILGUN_API_KEY);
const sendEmail = async ({ to, subject, html }) => {
  mg.messages
    .create("sandbox7e704fca32b8459e8dfbbd2c29e8519b.mailgun.org", {
      from: "Excited User <mailgun@YOUR-SANDBOX-DOMAIN>",
      to: ["test@example.com"],
      subject: "Hello",
      text: "Testing some Mailgun awesomness!",
      html: "<h1>Testing some Mailgun awesomness!</h1>",
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.error(err)); // logs any error
};

module.exports = {
  sendEmail,
};
