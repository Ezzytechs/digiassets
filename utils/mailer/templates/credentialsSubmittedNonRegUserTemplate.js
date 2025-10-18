exports.credentialsSubmittedNonRegUserTemplate = ({ sellerName, assetTitle, loginName, password, note }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#22C55E; margin-bottom:15px;">
          🔑 Credentials Submitted
        </h2>
        
        <!-- Greeting -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hi <strong>${sellerName}</strong>,
        </p>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          The credentials for <strong style="color:#FACC15;">${assetTitle}</strong> have been submitted successfully.
        </p>
        
        <!-- Credentials Section -->
        <div style="background:#111827; border:1px solid #374151; border-radius:12px; padding:20px; margin:20px 0;">
          <h3 style="color:#FACC15; margin-bottom:10px;">Your Credentials</h3>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Login Name:</strong> ${loginName}</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Password:</strong> ${password}</p>
          ${
            note
              ? `<p style="margin:5px 0; color:#E5E7EB;"><strong>Note:</strong> ${note}</p>`
              : ""
          }
        </div>

        <!-- Call-to-action Button -->
        <p style="margin:25px 0; text-align:center;">
          <a href="#"
             style="background:#9333EA; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
             📂 Save Credentials
          </a>
        </p>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets • Secure Marketplace for Digital Assets
        </p>
      </div>
    </div>
  </body>
</html>`;
};
