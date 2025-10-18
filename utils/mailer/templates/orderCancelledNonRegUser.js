exports.oderCancelledNonRegUserTemplate = ({ buyerName, amount, refundEmail }) => {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#111827; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <div style="background:#1F2937; border-radius:16px; padding:30px 25px; box-shadow:0 6px 20px rgba(0,0,0,0.5);">

        <!-- Header -->
        <h2 style="color:#22C55E; margin-bottom:15px;">✅ Refund Processed</h2>

        <!-- Main message -->
        <p style="line-height:1.6; color:#E5E7EB;">
          Hello <strong>${buyerName}</strong>,  
          your recent order has been <strong style="color:#FACC15;">cancelled by the seller</strong>.  
          A refund of <strong>$${amount}</strong> is available to be paid to you. Kindly send your account details to this mail ${refundEmail} payment processing. Thank you
        </p>

        <!-- Call to action -->
        <p style="line-height:1.6; color:#E5E7EB;">
          You should receive the funds shortly. If you don’t see the refund within 1–3 business days,  
          please reach out to our support team for assistance.
        </p>

        <!-- Support info -->
        <p style="margin:25px 0; text-align:center;">
          <a href="mailto:support@digiassets.com"
             style="background:#9333EA; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
             📩 Contact Support
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
