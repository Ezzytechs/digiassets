const musicUploadMessageAdmin = (adminName, userName, musicTitle, websiteName, dashboardUrl, supportEmail) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Music Uploaded - ${websiteName}</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background: #fff; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 20px; background: #1DB954; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; }
        .header h1 { margin: 0; }
        .content { padding: 20px; text-align: center; }
        .content p { font-size: 16px; color: #333; }
        .button { display: inline-block; background: #1DB954; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-size: 16px; margin-top: 15px; }
        .button:hover { background: #17a44a; }
        .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Music Uploaded</h1>
        </div>
        <div class="content">
          <p>Hi ${adminName},</p>
          <p><strong>${userName}</strong> has just uploaded a new music track titled <strong>"${musicTitle}"</strong> on <strong>${websiteName}</strong>.</p>
          <p>To review the upload, click the button below to access the admin dashboard:</p>
          <a href="${dashboardUrl}" class="button">View Upload</a>
          <p>If this was not expected, please verify the content and take necessary action.</p>
        </div>
        <div class="footer">
          <p>Need assistance? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          <p>&copy; 2025 ${websiteName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = musicUploadMessageAdmin;
