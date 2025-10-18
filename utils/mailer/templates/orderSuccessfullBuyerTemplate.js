const credentials = require("../../../configs/credentials");

exports.orderSuccessfullBuyerTemplate = ({ buyerName, assetTitle, price }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#10B981; margin-bottom:15px;">✅ Order Successful</h2>
        
        <!-- Content -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hi <strong>${buyerName}</strong>,
        </p>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Your purchase of <strong style="color:#FACC15;">${assetTitle}</strong> was successful 🎉
          The total amount paid: <strong style="color:#FACC15;">$${price}</strong>.
        </p>
        
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          The seller will provide the required credentials soon. You’ll be notified once they are submitted.
        </p>
        
        <!-- Divider -->
        <div style="border-top:1px solid #374151; margin:20px 0;"></div>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:15px;">
          © ${year} DigiAssets • Purchase Confirmation
        </p>
      </div>
    </div>
  </body>
</html>`;
};
