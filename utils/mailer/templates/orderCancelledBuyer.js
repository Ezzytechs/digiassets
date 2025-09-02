exports.orderCancelledBuyerTemplate= ({ buyerName, amount }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#111827; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">

        <!-- Header -->
        <h2 style="color:#22C55E; margin-bottom:15px;">✅ Refund Issued Successfully</h2>

        <!-- Main message -->
        <p style="line-height:1.6; color:#E5E7EB;">
          Hi <strong>${buyerName}</strong>,  
          your recent order has been <strong style="color:#FACC15;">cancelled</strong> and a refund of  
          <strong>$${amount}</strong> has been credited back to your DigiAssets Wallet's bank account details.
        </p>

        <!-- Call to action -->
        <p style="margin:25px 0; text-align:center;">
          <a href="#"
             style="background:#9333EA; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
             💳 View Wallet Balance
          </a>
        </p>

        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets Wallet • Secure Marketplace for Digital Assets
        </p>
      </div>
    </div>
  </body>
</html>`;
};
