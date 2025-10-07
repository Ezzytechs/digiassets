const {
  registrationSuccessTemplate,
} = require("./templates/registrationSuccessTemplate.js");
const { assetSoldTemplate } = require("./templates/assetSoldTemplate.js");
const {
  credentialsSubmittedTemplate,
} = require("./templates/credentialsSubmittedTemplate.js");
const { otpTemplate } = require("./templates/otpTemplate.js");
const {
  passwordChangedTemplate,
} = require("./templates/passwordChangedTemplate.js");
const {
  loginNotificationTemplate,
} = require("./templates/loginNotificationTemplate");

const {
  adminPaymentToSellerTemplate,
} = require("./templates/adminPaymentToSellerTemplate.js");
const {
  sellerFundReceivedTemplate,
} = require("./templates/sellerFundReceivedTemplate.js");
const { orderCancelledBuyerTemplate } = require("./templates/orderCancelledBuyer.js");
const {
  orderCancelledSellerTemplate,
} = require("./templates/orderCancelledSeller.js");
const {
  orderCancelledAdminTemplate,
} = require("./templates/orderCancelledAdmin.js");
const {
  oderCancelledNonRegUserTemplate,
} = require("./templates/orderCancelledNonRegUser.js");
const {orderReportedAdminTemplate} = require("./templates/orderReportedAdminTemplate.js")
const {orderReportedBuyerTemplate} = require("./templates/orderReportedBuyerTemplate.js")
const {orderReportedSellerTemplate} = require("./templates/orderReportedSellerTemplate.js")
const {
  orderSuccessfullBuyerTemplate,
} = require("./templates/orderSuccessfullBuyerTemplate.js");
const {
  orderSuccessfullSellerTemplate,
} = require("./templates/orderSuccessfullSellerTemplate.js");
const {
  orderSuccessfullAdminTemplate,
} = require("./templates/orderSuccessfullAdminTemplate.js");
const {
  credentialsSubmittedAdminTemplate,
} = require("./templates/credentialsSubmittedAdminTemplate.js");
const {
  credentialsSubmittedNonRegUserTemplate,
} = require("./templates/credentialsSubmittedNonRegUserTemplate");
const {
  paymentFailedAdminTemplate,
} = require("./templates/paymentInitiationFailedAdminTemplate.js");
const {
  paymentFailedBuyerTemplate,
} = require("./templates/PaymentInitiationFailedBuyerTemplate.js");

module.exports = {
  registrationSuccessTemplate,
  assetSoldTemplate,
  credentialsSubmittedTemplate,
  credentialsSubmittedNonRegUserTemplate,
  credentialsSubmittedAdminTemplate,
  otpTemplate,
  passwordChangedTemplate,
  loginNotificationTemplate,
  adminPaymentToSellerTemplate,
  sellerFundReceivedTemplate,
  orderCancelledSellerTemplate,
  orderCancelledAdminTemplate,
  oderCancelledNonRegUserTemplate,
  paymentFailedAdminTemplate,
  paymentFailedBuyerTemplate,
  orderCancelledBuyerTemplate,
  orderReportedAdminTemplate,
  orderReportedBuyerTemplate,
  orderReportedSellerTemplate,
  orderSuccessfullAdminTemplate,
  orderSuccessfullBuyerTemplate,
  orderSuccessfullSellerTemplate,
};
