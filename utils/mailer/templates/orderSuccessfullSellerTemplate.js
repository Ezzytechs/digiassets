exports.orderSuccessfullSellerTemplate = ({ sellerName, buyerName, assetTitle, price, dashboardUrl }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#34D399; margin-bottom:15px;">✅ New Order Received</h2>
        
        <!-- Content -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hi <strong>${sellerName}</strong>,<br>
          You have received a new order for your asset on DigiAssets.
        </p>
        
        <div style="background:#111827; border:1px solid #374151; border-radius:12px; padding:20px; margin:20px 0;">
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Buyer:</strong> ${buyerName}</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Asset:</strong> ${assetTitle}</p>
          <p style="margin:5px 0; color:#E5E7EB;"><strong>Price:</strong> $${price}</p>
        </div>
        
        <p style="line-height:1.6; margin:15px 0; color:#F87171; font-weight:bold;">
          ⚠️ Important: You are required to submit the login credentials for this asset within <u>48 hours</u>. 
          Failure to do so will result in the order being cancelled and the buyer will be refunded.
        </p>

        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Submit the credentials and manage your orders from your 
          <a href="${dashboardUrl}" style="color:#34D399; text-decoration:none;">Seller Dashboard</a>.
        </p>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:15px;">
          © ${year} DigiAssets • Seller Notification
        </p>
      </div>
    </div>
  </body>
</html>`;
};
