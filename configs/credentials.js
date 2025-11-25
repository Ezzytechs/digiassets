require("dotenv").config();
const { SITE_EMAIL, SITE_SUPPORT_EMAIL, SITE_PHONE } = process.env;

//frontend url
// const siteURL="http://localhost:3000"

const siteURL = "https://digizzet.com";

const credentials = {
  siteEmail: SITE_EMAIL,
  supportEmail: SITE_SUPPORT_EMAIL,
  appUrl: siteURL,
  phoneNumber: SITE_PHONE,
  adminName: "DigiAsset Admin",
  appName: "DigiAssets",
  loginURL: `${siteURL}/login`,
  assetPage: `${siteURL}/assets/my-assets`,
  orderViewPage: `${siteURL}/user/my-dashboard/purchases/all`,
  orderViewPageAdmin: `${siteURL}/admin/orders/all`,
  dashboardurl: `${siteURL}/user/my-dashboard`,
  dashboardurlAdmin: `${siteURL}/user/my-dashboard`,
};

module.exports = credentials;
