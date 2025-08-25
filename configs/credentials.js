require("dotenv").config();
const {SITE_EMAIL, SITE_SUPPORT_EMAIL, SITE_PHONE} = process.env;
//frontend url
const siteURL="http://localhost:3000"
//"https://digiassets.vercel.app";

const credentials={
    siteEmail:SITE_EMAIL,
    supportEmail:SITE_SUPPORT_EMAIL,
    siteURL,
    phoneNumber:SITE_PHONE,
    siteName:"DigiAssets",
    loginURL:`${siteURL}/login`,
    assetPage:`${siteURL}/assets/my-assets`,
    dashboardLink:`${siteURL}/user/my-dashboard`,
    }

module.exports=credentials