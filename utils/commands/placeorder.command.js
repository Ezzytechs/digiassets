const { User } = require("../../models/users.model");
const Order = require("../../models/orders.model");
const Transaction = require("../../models/transaction.model");
const Asset = require("../../models/assets.model");
const Notification = require("../../models/notification.model");
const Credential = require("../../models/credential.model");

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
      const orderedAsset = await Asset.findById(assetId);
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

      // Create transaction
      const transaction = new Transaction({
        from: buyerId || "non-user",
        nonRegUser: !buyer ? { email, phone } : undefined,
        to: orderedAsset.seller,
        amount: orderedAsset.price,
        type: "credit",
        tnxReference: `${tnxReference}_${i}`,
        tnxDescription: `${orderedAsset.price} paid for asset ${orderedAsset.title}`,
        gatewayRef,
      });
      await transaction.save();
    }

    return "Order placed successfully!";
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = placeOrderCommand;