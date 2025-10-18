exports.paymentFailedBuyerTemplate = ({ buyerName, assetTitle, failureReason }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#111827; color:#F9FAFB; margin:0; padding:20px;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <h2 style="font-size:22px; color:#EF4444; margin-bottom:15px;">
          ⚠️ Payment Failed
        </h2>
        
        <!-- Greeting -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Hi <strong>${buyerName}</strong>,
        </p>
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Unfortunately, your attempt to purchase <strong style="color:#FACC15;">${assetTitle}</strong> could not be completed because the payment initiation failed.
        </p>
        
        <!-- Failure Reason -->
        <div style="background:#111827; border:1px solid #374151; border-radius:12px; padding:20px; margin:20px 0;">
          <h3 style="color:#FACC15; margin-bottom:10px;">Details</h3>
          <p style="margin:5px 0; color:#F87171;"><strong>Reason:</strong> ${failureReason || "Unknown error occurred"}</p>
        </div>
        
        <!-- Next Steps -->
        <p style="line-height:1.6; margin:10px 0; color:#E5E7EB;">
          Please try again using a valid payment method, or contact our support team if the issue persists.
        </p>
        
        <!-- CTA -->
        <p style="margin:25px 0; text-align:center;">
          <a href="#" 
             style="background:#2563EB; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
             Retry Payment
          </a>
        </p>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
          © ${year} DigiAssets. Need help? Contact support anytime.
        </p>
      </div>
    </div>
  </body>
</html>`;
};
