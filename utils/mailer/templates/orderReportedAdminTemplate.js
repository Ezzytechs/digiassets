exports.orderReportedAdminTemplate = ({ adminName, orderId, buyerName, sellerName, assetTitle, amount, reportDate, adminDashboardUrl }) => {
const year = new Date().getFullYear();
return `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#0b1020; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:700px; margin:40px auto; padding:20px;">
      <div style="background:#111827; border-radius:16px; padding:30px 28px; box-shadow:0 6px 24px rgba(0,0,0,0.6);">
    <!-- Header -->
    <h2 style="color:#F97316; margin-bottom:12px;">⚠️ Reported Order — Immediate Review Needed</h2>

    <!-- Intro -->
    <p style="line-height:1.6; color:#E5E7EB;">
      Hi <strong>${adminName}</strong>,
    </p>

    <!-- Report summary -->
    <div style="background: linear-gradient(90deg, rgba(249,115,22,0.06), rgba(248,113,113,0.03)); padding:14px; border-radius:10px; margin:12px 0;">
      <p style="margin:0; color:#F3F4F6;"><strong>Order ID:</strong> ${orderId}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Asset:</strong> ${assetTitle}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Amount:</strong> $${amount}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Buyer:</strong> ${buyerName}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Seller:</strong> ${sellerName}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Reported on:</strong> ${reportDate}</p>
    </div>

    <!-- Action -->
    <p style="margin:18px 0 6px 0; color:#E5E7EB;">
      A buyer has reported this sale as <strong style="color:#FACC15;">fake</strong>. Please review the evidence and the seller's credentials.
    </p>

    <p style="margin:18px 0; text-align:center;">
      <a href="${adminDashboardUrl}"
         style="background:#9333EA; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
         🔎 Review Report in Admin Dashboard
      </a>
    </p>

    <p style="line-height:1.6; color:#9CA3AF; font-size:13px;">
      Recommended actions: suspend the seller temporarily, request new credentials from seller (48-hour window), or initiate a refund to the buyer. Please follow the dispute workflow and mark the case resolved once actioned.
    </p>

    <!-- Footer -->
    <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
      © ${year} DigiAssets Wallet • Admin Notification
    </p>
  </div>
</div>
  </body>
</html>`; 
};
