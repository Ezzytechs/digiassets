const musicReceivedMessage = (userName, websiteName, musicTitle, supportEmail, dashboardLink) => {
  console.log(dashboardLink)
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Music Has Been Received! - ${websiteName}</title>
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
          <h1>Your Music is Being Processed! 🎶</h1>
        </div>
        <div class="content">
          <p>Hi <span class="highlight">${userName}</span>,</p>
          <p>We’re excited to inform you that we have successfully received your track "<strong>${musicTitle}</strong>" on <strong>${websiteName}</strong>!</p>
          <p>Your music is now ready to be promoted across major platforms, reaching thousands of potential listeners worldwide.</p>
          <p>Stay tuned! We’ll keep udpating you on weekly basis how your music is doing across these platforms.</p>
          <a href="${dashboardLink}" class="cta-button">Check Your Dashboard</a>
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

module.exports = musicReceivedMessage;
