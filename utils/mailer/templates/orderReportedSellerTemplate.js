exports.orderReportedSellerTemplate = ({ sellerName, orderId, assetTitle, amount, reportDate, supportUrl }) => {
const year = new Date().getFullYear();
return `<!doctype html>

<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color:#0b1020; margin:0; padding:20px; color:#F9FAFB;">
    <div style="max-width:700px; margin:40px auto; padding:20px;">
      <div style="background:#111827; border-radius:16px; padding:30px 28px; box-shadow:0 6px 24px rgba(0,0,0,0.6);">
    <!-- Header -->
    <h2 style="color:#FB7185; margin-bottom:12px;">⚠️ Your sale has been reported as fake</h2>

    <!-- Main message -->
    <p style="line-height:1.6; color:#E5E7EB;">
      Hi <strong>${sellerName}</strong>,
    </p>

    <p style="line-height:1.6; color:#E5E7EB;">
      An order for <strong>${assetTitle}</strong> (Order ID: <strong>${orderId}</strong>) reported on <strong>${reportDate}</strong> has been flagged by the buyer as <strong style="color:#FACC15;">fake</strong>.
    </p>

    <div style="background: linear-gradient(90deg, rgba(251,113,133,0.03), rgba(249,115,22,0.03)); padding:14px; border-radius:10px; margin:12px 0;">
      <p style="margin:0; color:#F3F4F6;"><strong>Amount:</strong> $${amount}</p>
      <p style="margin:6px 0 0 0; color:#F3F4F6;"><strong>Time to respond:</strong> <strong style="color:#FACC15;">48 hours</strong></p>
    </div>

    <p style="color:#E5E7EB; margin-top:12px;">
      You have less than <strong>48 hours</strong> to submit valid credentials or correct the listing. If you provide acceptable evidence within 48 hours, the case will be re-evaluated and your asset may be reinstated. If you fail to respond or the credentials are insufficient, the following actions will be taken:
    </p>

    <ul style="color:#E5E7EB; line-height:1.6; margin:10px 0 0 18px;">
      <li>Permanent ban of your seller account.</li>
      <li>Removal and deletion of all your assets from the marketplace.</li>
      <li>Possible forfeiture of current payouts related to the reported listing.</li>
    </ul>

    <p style="margin:18px 0 6px 0; text-align:center;">
      <a href="${supportUrl || '#'}"
         style="background:#6B21A8; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
         💬 Contact Support
      </a>
    </p>

    <p style="font-size:13px; color:#9CA3AF;">
      This action ensures marketplace safety and trust. If you believe this is an error, submit supporting evidence immediately using the button above. Or go to your dashboard => sales => reported => view and update the pre-submitted credentials.
    </p>

    <!-- Footer -->
    <p style="font-size:12px; color:#9CA3AF; text-align:center; margin-top:20px;">
      © ${year} DigiAssets Wallet • Trust & Safety
    </p>
  </div>
</div>

  </body>
</html>`; };
