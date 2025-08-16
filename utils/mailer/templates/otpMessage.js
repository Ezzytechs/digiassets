const otpMessage = (userName, websiteName, otpCode, supportEmail) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Reset Your Password - ${websiteName}</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background: #fff; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 20px; background: #1DB954; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; }
        .header h1 { margin: 0; }
        .content { padding: 20px; text-align: center; }
        .content p { font-size: 16px; color: #333; text-align:justify; }
        .otp-code { display: inline-block; background: #1DB954; color: white; font-weight: bold; font-size: 24px; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>You recently requested to reset your password for your <strong>${websiteName}</strong> account.</p>
          <p>Use the OTP below to reset your password:</p>
          <div class="otp-code">${otpCode}</div>
          <p>This OTP is valid for a limited time and should not be shared with anyone.</p>
        </div>
        <div class="footer">
          <p>If you did not request this, please ignore this email or contact support.</p>
          <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          <p>&copy; 2025 ${websiteName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = otpMessage;
