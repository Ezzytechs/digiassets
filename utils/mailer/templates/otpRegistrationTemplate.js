const credentials = require("../../../configs/credentials");

exports.registrationOtpTemplate = ({ userName, otp }) => {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #111827; color: #F9FAFB; margin: 0; padding: 20px;">
    <div style="max-width: 500px; margin: 40px auto; padding: 20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        <h1 style="font-size:22px; color:#34D399; margin-bottom:15px;">👋 Welcome to ${credentials.appName}!</h1>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hello <strong>${userName}</strong>,
        </p>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          To complete your registration, please verify your email by entering the OTP below:
        </p>
        <div style="font-size:28px; font-weight:bold; letter-spacing:3px; color:#34D399; margin:20px 0; padding:12px; background:#0d131f; border-radius:10px; text-align:center; border:1px solid #34D399;">
          ${otp}
        </div>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          This OTP is valid for <strong>24 hours</strong>. After that, it will expire and your registration data will be permanently deleted.
        </p>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          If you did not attempt to register an account, you can safely ignore this email.
        </p>
      </div>
      <div style="text-align:center; margin-top:25px; font-size:13px; color:#9CA3AF;">
        &copy; ${year} ${credentials.appName}. Need help? 
        <a href="mailto:${credentials.supportEmail}" style="color:#34D399; text-decoration:none;">
          ${credentials.supportEmail}
        </a>
      </div>
    </div>
  </body>
</html>`;
};
