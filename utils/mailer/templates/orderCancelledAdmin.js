exports.orderCancelledAdminTemplate = ({ buyerName, sellerName, amount, reason, orderId }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#111827; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:650px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">

        <!-- Header -->
        <h2 style="color:#FACC15; margin-bottom:15px;">📢 Order Cancelled</h2>

        <!-- Main message -->
        <p style="line-height:1.6; color:#E5E7EB;">
          Hello Admin,  
          an order on <strong>DigiAssets</strong> has been cancelled and refunded successfully.  
          Below are the details of the cancelled order:
        </p>

        <!-- Order details -->
        <div style="margin:20px 0; padding:15px; background:#374151; border-radius:8px; color:#F3F4F6;">
          <p><strong>Buyer:</strong> ${buyerName}</p>
          <p><strong>Seller:</strong> ${sellerName}</p>
          <p><strong>Refunded Amount:</strong> $${amount}</p>
          <p><strong>Reason:</strong> ${reason || "Not specified"}</p>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center; margin:30px 0;">
          <a href="https://digiassets.com/admin/orders/${orderId}" 
             style="background:#9333EA; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; display:inline-block;">
            🔍 View Order
          </a>
        </div>

        <!-- Fraud warning -->
        <div style="margin-top:20px; padding:15px; background:#B91C1C; border-radius:8px; color:#fff;">
          <h3 style="margin-top:0;">⚠️ Fraud Alert</h3>
          <p style="margin:8px 0; line-height:1.6;">
            If the cancellation was due to <strong>fake credentials</strong> or  
            <strong>false asset information</strong>, please review this case immediately.  
            The asset must be <strong>removed</strong> from the marketplace and the seller’s account  
            may require <strong>suspension or a permanent ban</strong>.
          </p>
        </div>

        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets Wallet • Internal Admin Notification
        </p>
      </div>
    </div>
  </body>
</html>`;
};
