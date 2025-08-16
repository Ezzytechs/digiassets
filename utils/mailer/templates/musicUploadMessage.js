const musicUploadMessage = (userName, websiteName, musicTitle, supportEmail, musicPageLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Music is Live! - ${websiteName}</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background: #fff; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 20px; background: #1DB954; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; }
        .header h1 { margin: 0; }
        .content { padding: 20px; text-align: center; }
        .content p { font-size: 16px; color: #333; text-align:justify; }
        .highlight { color: #1DB954; font-weight: bold; }
        .cta-button { display: inline-block; background: #1DB954; color: white; text-decoration: none; font-size: 18px; padding: 12px 24px; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Music Uploaded Successfully! 🎶</h1>
        </div>
        <div class="content">
          <p>Hi <span class="highlight">${userName}</span>,</p>
          <p>Your track "<strong>${musicTitle}</strong>" has been successfully uploaded to <strong>${websiteName}</strong>!</p>
          <p>Our team will review your submission, and it will soon be available on major streaming platforms, reaching thousands of listeners worldwide.</p>
         <p>Get ready to earn from every stream and download!</p>
          <a href="${musicPageLink}" class="cta-button">View Your Track</a>
          <p>Want to maximize your earnings? Share your track and boost your visibility!</p>
        </div>
        <div class="footer">
          <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          <p>&copy; 2025 ${websiteName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = musicUploadMessage;
