const Order = require("../models/orders.model");
const Asset = require("../models/assets.model");
const Wallet = require("../models/wallet.model");
const { User } = require("../models/users.model");
const Category = require("../models/category.model");
const Transaction = require("../models/transaction.model");
const emailObserver = require("../utils/observers/email.observer");
const {
  initializeTransaction,
  makeTransfer,
  verifyPayment,
  convertToLocalCurrency,
} = require("../utils/payment");
const placeOrderCommand = require("../utils/commands/placeorder.command");
const calculateAssetDetailsCommand = require("../utils/commands/calculateAssets.command");
const credentials = require("../configs/credentials");
const emailTemplate = require("../utils/mailer");

exports.initPayment = async (req, res) => {
  let user = null;
  try {
    const { email, phone = "NA", assets, country } = req.body;
    if (!email || !assets || !Array.isArray(assets) || assets.length === 0) {
      return res
        .status(400)
        .json({ message: "Email and assets IDs are required" });
    }
    //get user details
    user = await User.findOne({ email });

    // Calculate total
    const { assetDetails, assetTotalAmount } =
      await calculateAssetDetailsCommand(assets, null);
    const now = new Date();
    const { convertedAmount, currency } = await convertToLocalCurrency(
      assetTotalAmount,
      country
    );
    //draft payment data
    const transactionData = {
      asset: [...assetDetails],
      paymentReference: now.toLocaleString(),
      paymentDescription: `${convertedAmount} paid for digital assets`,
      buyerName: `${user?.fName || email}`,
      totalAmount: convertedAmount,
      currency,
      email,
      phone,
      amountInUSD: assetTotalAmount,
      userId: user?._id || null,
    };

    //init payment
    const initPayment = await initializeTransaction(transactionData);
    if (!initPayment)
      return res.status(400).json({
        message:
          "Unable to initialize your payment. Please try again later. Thank you",
      });
    res.status(200).json(initPayment);
  } catch (err) {
    emailObserver.emit("SEND_MAIL", {
      to: credentials.adminName,
      subject: "Payment initialization failed!",
      templateFunc: emailTemplate.paymentFailedAdminTemplate,
      templateData: {
        adminName: credentials.adminName,
        buyerName: user ? user.username : "Not User",
        buyerEmail: req.body.email,
        failureReason: err.message || "Unknown reason",
      },
    });

    emailObserver.emit("SEND_MAIL", {
      to: req.body.email,
      subject: "Payment failed!",
      templateFunc: emailTemplate.paymentFailedBuyerTemplate,
      templateData: {
        buyerName: user ? user.username : "Not user",
        assetTitle: "Asset",
        failureReason: "Error from payment server",
      },
    });
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
        .json({ success: true, message: "Transaction verified successfully" });

    //Verify payment on payment gateway
    const transaction = await verifyPayment(reference);
    if (!transaction) {
      return res.status(400).json({ message: "Unable to verify transaction" });
    }
    // check payment status
    if (transaction.status !== "successful") {
      return res.status(400).json({ message: "Transaction not successful" });
    }

    //Get transaction meta data from payment gateway
    const { asset, email, phone, paymentReference, amountInUSD } =
      transaction.meta;
    //calculate asset total amount on database
    const assets = JSON.parse(asset);
    const { assetDetails, assetTotalAmount } =
      await calculateAssetDetailsCommand(assets, null);

    //compare the total amount of assets ordered with the amount paid in transaction
    if (Number(assetTotalAmount) !== Number(amountInUSD))
      return res.status(400).json({
        message: `Your payment remaining ${
          amountToPay - transaction.amountPaid
        } to balance. Contact Admin now`,
      });

    const order = await placeOrderCommand({
      email,
      phone,
      assets,
      tnxReference: paymentReference,
      gatewayRef: reference,
    });
    if (!order) {
      return res.status(400).json({ message: "Unable to place order" });
    }
    res.status(201).json({ success: true, message: order });
  } catch (err) {
    console.log(err);
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
    const asset = await Asset.findById(order.asset);
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
