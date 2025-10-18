exports.passwordChangedTemplate = ({ userName }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#FACC15; margin-bottom:15px;">
          🔒 Password Changed
        </h2>
        
        <!-- Content -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hi <strong>${userName}</strong>, your <span style="color:#FACC15;">DigiAssets password</span> was successfully changed.
        </p>
        <p style="line-height:1.6; margin:15px 0; color:#E5E7EB;">
          If <strong>you did not make this change</strong>, please secure your account immediately to prevent unauthorized access.
        </p>
        
        <!-- Call-to-action Button -->
        <p style="margin:25px 0; text-align:center;">
          <a href="#"
             style="background:#9333EA; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
             Secure My Account
          </a>
        </p>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets • Security First. Always.
        </p>
      </div>
    </div>
  </body>
</html>`;
};
