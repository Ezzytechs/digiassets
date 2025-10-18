exports.sellerFundReceivedTemplate = ({ sellerName, amount }) => {
  const year = new Date().getFullYear();
  return `
  <div style="background-color: rgb(17 24 39 / var(--tw-bg-opacity, 1)); padding:20px; font-family:Arial,sans-serif; color:#fff;">
    <div style="max-width:600px; margin:auto; background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1)); padding:20px; border-radius:12px;">
      <h2>✅ Funds Received</h2>
      <p style="color:#aaa;">Hi ${sellerName}, your payment of <strong>$${amount}</strong> has been credited successfully.</p>
      <p><a href="#" style="background: rgb(147 51 234 / var(--tw-bg-opacity, 1)); color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none;">Check Balance</a></p>
      <p style="font-size:12px; color:#aaa;">© ${year} DigiAssets Wallet</p>
    </div>
  </div>
  `;
};
