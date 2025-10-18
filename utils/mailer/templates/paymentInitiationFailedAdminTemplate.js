exports.paymentFailedAdminTemplate = ({
  adminName,
  buyerName,
  buyerEmail,
  failureReason,
}) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#EF4444; margin-bottom:15px;">
          ⚠️ Payment Initiation Failed
        </h2>
        
        <!-- Greeting -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hi <strong>${adminName}</strong>,
        </p>
       
        <!-- Order Details -->
        <div style="background:#111827; border:1px solid #374151; border-radius:12px; padding:20px; margin:20px 0;">
          <h3 style="color:#FACC15; margin-bottom:10px;">Order Attempt Details</h3>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Buyer Email:</strong> ${buyerName} (${buyerEmail})</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Asset:</strong> ${assetTitle}</p>
          <p style="margin:5px 0; color:#F87171;"><strong>Failure Reason:</strong> ${
            failureReason || "Unknown error"
          }</p>
        </div>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets • Internal Notification
        </p>
      </div>
    </div>
  </body>
</html>`;
};
