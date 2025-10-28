exports.sellerFundReceivedTemplate = ({
  sellerName,
  amount,
  assetName,
  orderLink,
}) => {
  const year = new Date().getFullYear();
  return `
  <div style="background-color: rgb(17 24 39); padding:20px; font-family:Arial, sans-serif; color:#fff;">
    <div style="max-width:600px; margin:auto; background-color:rgb(31 41 55); padding:24px; border-radius:12px;">
      
      <h2 style="color:#fff; margin-bottom:10px;">✅ Payment Credited to Your Bank Account</h2>
      
      <p style="color:#ccc; line-height:1.6;">
        Hi <strong>${sellerName}</strong>,<br/>
        We’re pleased to inform you that the payment of <strong>$${amount}</strong> for your asset 
        <strong>${assetName}</strong> has been successfully credited to your registered bank account.
      </p>

      <p style="margin:24px 0;">
        <a href="${orderLink}" 
           style="background: rgb(147 51 234); color:#fff; padding:12px 24px; border-radius:8px; 
                  text-decoration:none; font-weight:bold; display:inline-block;">
          View Order Details
        </a>
      </p>

      <p style="font-size:12px; color:#aaa; margin-top:20px;">
        © ${year} DigiAssets Wallet. All rights reserved.
      </p>
    </div>
  </div>
  `;
};
