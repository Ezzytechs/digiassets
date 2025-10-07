exports.orderReportedBuyerTemplate = ({ buyerName, orderId, assetTitle, amount, reportDate, supportUrl }) => {
const year = new Date().getFullYear();
return `<!doctype html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#0b1020; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:700px; margin:40px auto; padding:20px;">
      <div style="background:#111827; border-radius:16px; padding:30px 28px; box-shadow:0 6px 24px rgba(0,0,0,0.6);">
    <!-- Header -->
    <h2 style="color:#22C55E; margin-bottom:12px;">🛡️ We received your report</h2>

    <!-- Main message -->
    <p style="line-height:1.6; color:#E5E7EB;">
      Hi <strong>${buyerName}</strong>,
    </p>

    <p style="line-height:1.6; color:#E5E7EB;">
      Thank you — we have received your report regarding <strong>${assetTitle}</strong> (Order ID: <strong>${orderId}</strong>) submitted on <strong>${reportDate}</strong>.
    </p>

    <div style="background: linear-gradient(90deg, rgba(34,197,94,0.03), rgba(249,115,22,0.03)); padding:14px; border-radius:10px; margin:12px 0;">
      <p style="margin:0; color:#F3F4F6;"><strong>Amount:</strong> $${amount}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Status:</strong> Under review</p>
    </div>

    <p style="color:#E5E7EB; margin-top:12px;">
      The seller has a <strong>48-hour</strong> window to submit updated credentials or corrected information. If the seller provides acceptable credentials within 48 hours, you will be notified and we will proceed accordingly. If the seller fails to do so within the 48-hour review window, we will issue a refund to your DigiAssets Wallet for the full amount <$${amount}>.
    </p>

    <p style="margin:20px 0; text-align:center;">
      <a href="${supportUrl || '#'}"
         style="background:#F97316; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
         🔔 View Report Status / Contact Support
      </a>
    </p>

    <p style="font-size:13px; color:#9CA3AF;">
      Note: During the review, the asset will be temporarily flagged and may be removed from public listings until the investigation completes.
    </p>

    <!-- Footer -->
    <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
      © ${year} DigiAssets Wallet • Dispute & Refunds Team
    </p>
  </div>
</div>

  </body>
</html>`; };
