const Order = require("../models/orders.model");
const Asset = require("../models/assets.model");
const Wallet = require("../models/wallet.model");
const { User } = require("../models/users.model");
const Category = require("../models/category.model");
const Transaction = require("../models/transaction.model");
const {
  initializeTransaction,
  makeTransfer,
  verifyPayment,
} = require("../utils/payment");
const placeOrderCommand = require("../utils/commands/placeorder.command");
const calculateAssetDetailsCommand = require("../utils/commands/calculateAssets.command");

exports.initPayment = async (req, res) => {
  try {
    const { email, phone, assets } = req.body;
    if (
      !email ||
      !phone ||
      !assets ||
      !Array.isArray(assets) ||
      assets.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Email, Phone number and assets IDs are required" });
    }
    //get user details
    const user = await User.findOne({ email });

    // Calculate total
    const { assetDetails, assetTotalAmount } =
      await calculateAssetDetailsCommand(assets, null);
    //draft payment data
    const transactionData = {
      asset: [...assetDetails],
      paymentReference: new Date(),
      paymentDescription: `${assetTotalAmount} paid for digital assets`,
      totalAmount: assetTotalAmount,
      email,
      phone,
      userId: user?._id || null,
    };
    //init payment
    const initPayment = initializeTransaction(transactionData);
    if (!initPayment)
      return res.status(400).json({
        message:
          "Unable to process your order. Please try again later. Thank you",
      });
    res.status(200).json(initPayment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPament = async (req, res) => {
  try {
    const { reference } = req.query;
    //Check if reference is provided
    if (!reference) {
      return res.status(400).json({ message: "No reference provided" });
    }
    //check if payment has been verified
    const checkTransaction = await Transaction.findOne({
      gatewayRef: reference,
    });
    if (checkTransaction)
      return res
        .status(200)
        .json({ message: "Transaction verified successfully" });

    //Verify payment on payment gateway
    const transaction = await verifyPayment(reference);
    if (!transaction) {
      return res.status(400).json({ message: "Unable to verify transaction" });
    }
   // check payment status
    if (transaction.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Transaction not successful" });
    }

    //Get transaction meta data from payment gateway
    const { asset, email, phone, paymentReference } = transaction.metaData;

    //calculate asset total amount on database
    const { assetDetails, assetTotalAmount } =
      await calculateAssetDetailsCommand(asset, null);
    //compare the total amount of assets ordered with the amount paid in transaction
    if (assetTotalAmount < transaction.amountPaid)
      return res.status(400).json({
        message: `Your payment remaining ${
          assetTotalAmount - transaction.amountPaid
        } to balance. Contact Admin now`,
      });

    const order = await placeOrderCommand({
      email,
      phone,
      assets: asset,
      tnxReference: paymentReference,
      gatewayRef: reference,
    });
    if (!order) {
      return res.status(400).json({ message: "Unable to place order" });
    }
    //email seller,
    //email buyer
    //email admin
    res.status(201).json({success:true, message:order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.MakeTransafer = async (req, res) => {
  try {
    const { orderId } = req.body;
    //get user details from order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "credentials_submitted")
      return res
        .status(400)
        .json({ message: "Credentials for this order is yet to be submitted" });

    //get asset details
    const asset = await Asset.findById(order.assets.asset);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    //get user wallet
    const wallet = await Wallet.findOne({ user: asset.seller });
    if (!wallet)
      return res.status(404).json({ message: "User wallet not found" });
    if (!wallet.accountDetails.sortCode || wallet.accountDetails.sortCode === 0)
      return res.status(403).json({
        message:
          "User wallet missing important credentials. User must update wallet to recieve funds.",
      });

    //deduct percentage
    const category = await Category.findById(asset.category);
    const amountToPay = asset.price * (1 - category.deductionPercentage / 100);
    if (amountToPay <= 0) {
      return res.status(400).json({ message: "Invalid amount to pay" });
    }
    const transactionData = {
      amount: amountToPay,
      reference: `TRANSFER-${new Date().getTime()}`,
      narration: `Payment for asset: ${asset.title}`,
      bankCode: wallet.accountDetails.bankCode,
      accountNumber: wallet.accountDetails.accountNumber,
      currency: "NGN",
    };
    const sendMoney = await makeTransfer(transactionData);
    if (!sendMoney) {
      return res
        .status(400)
        .json({ message: "Unable to initiate the transfer. Please try again" });
    }

    const transaction = new Transaction({
      to: asset.seller,
      from: order.buyer || null,
      nonRegUser: !order.buyer ? { ...order.nonRegUser } : undefined,
      gateWayRef: "Payment completed",
      amount: asset.price,
      type: "debit",
      tnxReference: transactionData.reference,
      tnxDescription: transactionData.narration,
    });
    order.status = "completed";
    await order.save();
    //send status
    //email user
    //email admin
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.creditWallet = async (req, res) => {
//   //get wallet
//   //credit wallet
//   //create transaction [debit-website account, credit-user wallet ]
// };
