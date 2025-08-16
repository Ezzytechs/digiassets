const { User } = require("../../models/users.model");
const Order = require("../../models/orders.model");
const Transaction = require("../../models/transaction.model");
const Asset = require("../../models/assets.model");
const Notification = require("../../models/notification.model");

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
    // Find buyer (if exists) and get id
    const buyer = await User.findOne({ email });
    const buyerId = buyer ? buyer._id : null;
    //create order and transaction for each assetId
    assets.map(async (asset, index) => {
      //find the asset ordered
      const orderedAsset = await Asset.findById(asset);

      //create new order data
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

      //create notification 
      const notification = new Notification({
        orderId: newOrder._id,
        to: orderedAsset.seller,
      });
      const savedNotification = await notification.save();
      if (!savedNotification) throw new Error("Unalbe to create order");
      
      //update asset to sold
      orderedAsset.isSold = true;
      const updateAssetToSold = await orderedAsset.save();
      if (!updateAssetToSold) throw new Error("Unable to place order");

      //create new transaction record
      const transaction = new Transaction({
        from: buyerId || null,
        nonRegUser: !buyer ? { email, phone } : undefined,
        to: orderedAsset.seller,
        amount: orderedAsset.price,
        type: "credit",
        tnxReference: tnxReference + index++,
        tnxDescription: `${asset.price} paid for asset ${asset.title}`,
        gatewayRef,
      });
      const newTransaction = await transaction.save();

      if (!newTransaction) throw new Error("Unable to create transaction");
    });

    return "Order placed successfully and success!";
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = placeOrderCommand;
