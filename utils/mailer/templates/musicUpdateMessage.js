const musicUpdateMessage = (userName, websiteName, musicTitle, totalStreams, totalEarnings, supportEmail, viewLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Music Has Been Updated! - ${websiteName}</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background: #fff; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 20px; background: #1DB954; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; }
        .header h1 { margin: 0; }
        .content { padding: 20px; text-align: center; }
        .content p { font-size: 16px; color: #333; text-align:justify; }
        .highlight { color: #1DB954; font-weight: bold; }
        .stat-box { display: inline-block; background: #f8f8f8; padding: 10px 20px; margin: 10px; border-radius: 5px; font-size: 18px; font-weight: bold; color: #333; }
        .cta-button { display: inline-block; background: #1DB954; color: white; text-decoration: none; font-size: 18px; padding: 12px 24px; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 15px; font-size: 14px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Music is Gaining Streams! 🚀</h1>
        </div>
        <div class="content">
          <p>Hi <span class="highlight">${userName}</span>,</p>
          <p>Great news! Your track "<strong>${musicTitle}</strong>" is making waves on <strong>${websiteName}</strong>!</p>
          <p>Your latest stats:</p>
          <div class="stat-box">🎧 Streams: ${totalStreams}</div>
          <div class="stat-box">💰 Earnings: $${totalEarnings}</div>
          <p>Your streams and earnings have been updated. Keep sharing your track to boost your numbers!</p>
          <a href="${viewLink}" class="cta-button">Check Your Stats</a>
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

module.exports = musicUpdateMessage;