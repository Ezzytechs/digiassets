exports.registrationSuccessTemplate = ({ userName, assetPageUrl }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">

        <!-- Header -->
        <h2 style="font-size:22px; color:#FACC15; margin-bottom:15px;">
          🎉 Welcome to DigiAssets, ${userName}!
        </h2>

        <!-- Message -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          We’re excited to have you on board! Your account has been 
          <strong style="color:#FACC15;">successfully created</strong>, and you are now part of a trusted digital marketplace 
          where <em>security meets opportunity</em>.
        </p>

        <p style="line-height:1.6; margin:15px 0; color:#E5E7EB;">
          With DigiAssets, you can:
          <ul style="margin:15px 0; padding-left:20px; color:#E5E7EB;">
            <li>🔐 Buy and sell verified digital assets with confidence</li>
            <li>💸 Receive secure payments, instantly</li>
            <li>📈 Access powerful tools to manage and grow your assets</li>
          </ul>
        </p>

        <!-- Call to action -->
        <p style="margin:25px 0; text-align:center;">
          <a href=${assetPageUrl}
             style="background:#9333EA; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
             🚀 Explore Marketplace
          </a>
        </p>

        <!-- Encouragement -->
        <p style="line-height:1.6; margin:15px 0; color:#9CA3AF; text-align:center;">
          Start exploring opportunities today, and let your digital assets work for you.  
        </p>

        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets • All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>`;
};
