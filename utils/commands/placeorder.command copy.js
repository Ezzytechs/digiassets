const mongoose = require("mongoose");
const {User} = require("../../models/users.model");
const Order = require("../../models/orders.model");
const Transaction = require("../../models/transaction.model");
const Asset = require("../../models/assets.model");

const placeOrderCommand = async ({
  email,
  phone,
  assets,
  tnxReference,
  gatewayRef,
}) => {
  console.log({email, phone, assets, tnxReference, gatewayRef})
   
  // const session = await mongoose.startSession();
  // session.startTransaction();
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

    // Find user (if exists)
    const buyer = await User.findOne({ email }).session(session);
    const buyerId = buyer ? buyer._id : null;

    const orders = [];

    for (const item of assets) {
      const { asset: assetId, quantity = 1 } = item;

      const asset = await Asset.findById(assetId).session(session);
      if (!asset) throw new Error(`Asset with ID: ${assetId} not found`);
      // Create order
      const orderDoc = await Order.create(
        [
          {
            seller: asset.owner,
            buyer: buyerId,
            price:asset.price,
            nonRegUser: !buyer ? { email, phone } : undefined,
            assets: { asset: asset._id, quantity },
            payRef: gatewayRef,
          },
        ],
        // { session }
      );
      await orderDoc.save()

      // Create transaction
     const transaction= await Transaction.create(
        [
          {
            from: buyerId || null, 
            nonRegUser: !buyer ? { email, phone } : undefined,
            to: seller,
            amount: asset.price,
            type: "credit",
            tnxReference,
            tnxDescription: `${asset.price} paid for asset ${asset.title}`,
            gatewayRef,
          },
        ],
        // { session }
      );

      // orders.push(orderDoc[0]);
    }

    // await session.commitTransaction();
    // session.endSession();
    return orders;
  } catch (err) {
    console.log(err)
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

module.exports = placeOrderCommand;
