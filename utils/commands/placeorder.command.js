const { User } = require("../../models/users.model");
const Order = require("../../models/orders.model");
const Transaction = require("../../models/transaction.model");
const Asset = require("../../models/assets.model");
const Notification = require("../../models/notification.model");
const Credential = require("../../models/credential.model");
const emailObserver = require("../observers/email.observer");
const credentials = require("../../configs/credentials");
const emailTemplate = require("../mailer");

const placeOrderCommand = async ({
  email,
  phone,
  assets,
  tnxReference,
  gatewayRef,
}) => {
  try {
    if (
      !email ||
      !phone ||
      !assets ||
      !Array.isArray(assets) ||
      assets.length === 0
    ) {
      throw new Error("Email, phone, and Asset list are required.");
    }

    // Find buyer if registered
    const buyer = await User.findOne({ email });
    const buyerId = buyer ? buyer._id : null;

    // Process assets one by one
    for (let i = 0; i < assets.length; i++) {
      const assetId = assets[i];
      const orderedAsset = await Asset.findById(assetId).populate("seller");
      if (!orderedAsset) throw new Error("Asset not found");

      // Create order
      const order = new Order({
        seller: orderedAsset.seller,
        buyer: buyerId,
        price: orderedAsset.price,
        nonRegUser: !buyer ? { email, phone } : undefined,
        asset: orderedAsset._id,
        payRef: gatewayRef,
      });
      const newOrder = await order.save();
      if (!newOrder) throw new Error("Unable to create order");

      // Create notification
      const notification = new Notification({
        orderId: newOrder._id,
        to: orderedAsset.seller,
      });
      const savedNotification = await notification.save();
      if (!savedNotification) throw new Error("Unable to create notification");

      // If featured asset → move credentials & update order
      if (orderedAsset.status === "featured") {
        await Credential.findOneAndUpdate(
          { orderId: orderedAsset._id },
          { orderId: newOrder._id }
        );
        newOrder.status = "credentials_submitted";
        await newOrder.save();
      }

      // Mark asset as sold
      orderedAsset.status = "sold";
      await orderedAsset.save();
      const from = buyerId ? { from: buyerId } : null;
      // Create transaction
      const transaction = new Transaction({
        ...from,
        nonRegUser: !buyer ? { email, phone } : undefined,
        to: orderedAsset.seller,
        amount: orderedAsset.price,
        type: "credit",
        tnxReference: `${tnxReference}_${i}`,
        tnxDescription: `${orderedAsset.price} paid for asset ${orderedAsset.title}`,
        gatewayRef,
      });
      await transaction.save();

      //email seller,
      emailObserver.emit("SEND_MAIL", {
        to: orderedAsset.seller?.email,
        subject: "Order Successfull",
        templateFunc: emailTemplate.orderSuccessfullSellerTemplate,
        templateData: {
          sellerName: orderedAsset.seller.username,
          buyerName: buyer ? buyer.username : email,
          price: orderedAsset.price,
          assetTitle: orderedAsset.title,
          dashboardUrl:credentials.dashboardurl
        },
      });

      //email buyer
      emailObserver.emit("SEND_MAIL", {
        to: email,
        subject: "New Asset Purchase",
        templateFunc: emailTemplate.orderSuccessfullBuyerTemplate,
        templateData: {
          buyerName: buyer ? buyer.username : email,
          assetTitle: orderedAsset.title,
          price: orderedAsset.price,
        },
      });

      //email admin
      emailObserver.emit("SEND_MAIL", {
        to: credentials.siteEmail,
        subject: "New Asset Purchase",
        templateFunc: emailTemplate.orderSuccessfullAdminTemplate,
        templateData: {
          buyerName: buyer ? buyer.username : "Not User",
          sellerName: orderedAsset.seller?.username,
          assetTitle: orderedAsset.title,
          price: orderedAsset.price,
          dashboardUrl: credentials.dashboardurlAdmin,
        },
      });
    }

    return "Order placed successfully!";
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = placeOrderCommand;
