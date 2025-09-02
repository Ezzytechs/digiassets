exports.orderCancelledSellerTemplate = ({ sellerName }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#111827; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">

        <!-- Header -->
        <h2 style="color:#F87171; margin-bottom:15px;">❌ Order Cancelled</h2>

        <!-- Main message -->
        <p style="line-height:1.6; color:#E5E7EB;">
          Hi <strong>${sellerName}</strong>,  
          an order associated with your listed asset has been  
          <strong style="color:#FACC15;">cancelled</strong> and the buyer has been refunded successfully.
        </p>

        <!-- Warning section -->
        <div style="margin-top:20px; padding:15px; background:#B91C1C; border-radius:8px; color:#fff;">
          <h3 style="margin-top:0;">⚠️ Important Notice</h3>
          <p style="margin:8px 0; line-height:1.6;">
            If this cancellation was due to <strong>fake credentials</strong> or  
            <strong>false information provided</strong> about your asset,  
            your account will be <strong>permanently banned</strong> and the asset will be <strong>removed from the marketplace</strong>.
          </p>
        </div>

        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets Wallet • Secure Marketplace for Digital Assets
        </p>
      </div>
    </div>
  </body>
</html>`;
};
