exports.orderSuccessfullAdminTemplate = ({ buyerName, sellerName, assetTitle, price, dashboardUrl }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#FACC15; margin-bottom:15px;">📢 New Order Alert</h2>
        
        <!-- Content -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          A new order has been placed on DigiAssets.
        </p>
        
        <div style="background:#111827; border:1px solid #374151; border-radius:12px; padding:20px; margin:20px 0;">
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Buyer:</strong> ${buyerName}</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Seller:</strong> ${sellerName}</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Asset:</strong> ${assetTitle}</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Price:</strong> $${price}</p>
        </div>
        
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Check the <a href="${dashboardUrl}" style="color:#FACC15; text-decoration:none;">Admin Dashboard</a> for full details.
        </p>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:15px;">
          © ${year} DigiAssets • Admin Alert
        </p>
      </div>
    </div>
  </body>
</html>`;
};
