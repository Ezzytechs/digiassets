const Order = require("../models/orders.model");
const { User } = require("../models/users.model");
const { Wallet } = require("../models/wallet.model");
const { Transaction } = require("../models/transaction.model");
const Credential = require("../models/credential.model");
const { encrypt, decrypt } = require("../utils/encryption");
const { paginate } = require("../utils/pagination");
const { makeTransfer } = require("../utils/payment");
const emailObserver = require("../utils/observers/email.observer");
const Notification = require("../models/notification.model");
//cancel order by id
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    //get the order
    const order = await Order.findById(id).populate("assets.asset");
    if (!order)
      return res
        .status(400)
        .json({ message: "Order with this ID did not exit" });
    //check if the login details has been provided
    if (order.status === "credentials_submitted")
      return res.status(400).json({
        message: "Credentials has been submitted by the seller",
      });
    if (order.seller !== req.user.userId || order.buyer !== req.user.userId)
      return res.status(403).json({ message: "Unauthorized!" });

    let deletedTransaction;

    if (order.nonRegUser.email) {
      //send mail to new user
      emailObserver.emit("SEND_MAIL", {
        to: order.nonRegUser.email,
        subject: `Refund Notification`,
        templateFunc: () =>
          emailTemplate.welcomeMessage(
            user.username,
            credentials.siteName,
            credentials.loginURL,
            credentials.supportEmail
          ),
      });

      deletedTransaction = await Transaction.findOneAndDelete({
        to: order.seller,
        "nonRegUser.email": order.nonRegUser.email,
        status: "paid",
        gatewayRef: order.payRef,
      });
    } else {
      //Get the buyer wallet for refund
      const buyerWallet = await Wallet.findOne({ user: order.buyer });
      if (!buyerWallet)
        return res.status(400).json({ message: "Buyer does not have wallet" });
      //check if the wallet has the neccessary credentials
      if (
        !buyerWallet.accountDetails.sortCode ||
        !buyerWallet.accountDetails.bankName
      )
        return res
          .status(400)
          .json({ message: "buyer wallet missing important credentials" });
      //construct the transfer details
      const transferDetails = {
        amount: order.assets.price,
        reference: `refund to ${buyerWallet.accountDetails.accountNumber} for ${order.assets.title}`,
        narration: "Refund",
        destinationBankCode: buyerWallet.accountDetails.sortCode,
        destinationAccountNumber: buyerWallet.accountDetails.accountNumber,
      };
      const refundBuyer = await makeTransfer(transferDetails);
      if (!refundBuyer)
        return res.status(400).json({
          message: "Unable to refund buyer. Please try again after sometimes.",
        });
      deletedTransaction = await Transaction.findOneAndDelete({
        to: order.seller,
        gatewayRef: order.payRef,
        from: order.buyer,
      });
    }
    if (!deletedTransaction)
      return res
        .status(400)
        .json({ message: "Unable to delete the transaction" });

    order.status = "cancelled";
    await order.save();
    //send mail to new user
    emailObserver.emit("SEND_MAIL", {
      to: order.nonRegUser.email,
      subject: `Refund Successful`,
      templateFunc: () =>
        emailTemplate.welcomeMessage(
          user.username,
          credentials.siteName,
          credentials.loginURL,
          credentials.supportEmail
        ),
    });

    res.status(200).json({ order, message: "Refund successful" });
  } catch (err) {
    res.staus(500).json({ message: err.message });
  }
};

//get all orders -admin [include query to filter]
exports.getAllOrders = async (req, res) => {
  try {
    let { limit = 20, page = 1, ...query } = req.query || {};
    const options = {
      filter: { ...query },
      limit,
      page,
      populate: "seller buyer asset",
    };
    const orders = await paginate(Order, options);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get orders statistics
exports.getOrderStats = async (req, res) => {
  try {
    // Get counts based on status
    const [total, paid, credentialed_submitted, completed, cancelled] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: "paid" }),
        Order.countDocuments({ status: "credentialed_submitted" }),
        Order.countDocuments({ status: "completed" }),
        Order.countDocuments({ status: "cancelled" }),
      ]);

    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Registered users' orders
    const registeredOrdersCount = await Order.countDocuments({
      userId: { $ne: null },
    });

    // Unregistered users' orders
    const unregisteredOrdersCount = await Order.countDocuments({
      userId: null,
    });

    res.status(200).json({
      total,
      paid,
      credentialed_submitted,
      cancelled,
      completed,
      totalRevenue,
      registeredOrdersCount,
      unregisteredOrdersCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to generate stats", error: err.message });
  }
};

//get order by id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      { path: "seller", select: "username email phone address" },
      { path: "buyer", select: "username email phone address" },
      { path: "asset", select: "-updatedAt" },
    ]);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Seller submits login credentials
exports.submitCredentials = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { username, password, notes } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      seller: req.user.userId,
    });
    if (!order)
      return res
        .status(404)
        .json({ message: "Order with provided ID does not exist!" });

    const encryptedData = {
      username: encrypt(username),
      password: encrypt(password),
      notes: encrypt(notes || ""),
      encrypted: true,
    };

    if (order.status === "credentials_submitted") {
      const updateExistingCredential = await Credential.findOneAndUpdate(
        { orderId },
        {
          credentials: { ...encryptedData },
        }
      );
      if (!updateExistingCredential)
        return res.status(404).json({
          message: "Unable to update your credentials. Please try again later",
        });
    } else {
      const credentials = new Credential({
        credentials: { ...encryptedData },
        orderId,
      });
      const savedCredentials = await credentials.save();
      if (!savedCredentials)
        return res.status(404).json({
          message: "Unable to save the credentials, Please try again",
        });
      order.status = "credentials_submitted";
      order.credentialsSubmittedAt = new Date();
      await order.save();
      const notification = await Notification.findOneAndUpdate(
        { orderId },
        { stauts: "new", to: order.buyer, event: "SUBMIT_CREDENTIALS" }
      );
      if (!notification)
        return res
          .status(404)
          .json({ message: "Unable to submit credentials" });
    }

    if (order?.nonRegUser) {
      //send email to the non registerd user with the credentials
    }
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res
      .status(200)
      .json({ message: "Credentials submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Buyer or admin fetches decrypted credentials
exports.getDecryptedCredentials = async (req, res) => {
  try {
    const { otp, orderId } = req.body;

    const verified = await User.findById(req.user.userId);
    if (verified.otp.otpCode !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP Code" });
    }

    let order;
    if (req.user.isAdmin) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({ _id: orderId, buyer: req.user.userId });
    }
    if (!order || order.status !== "credentials_submitted") {
      return res.status(404).json({
        message:
          "Order with provided id not found or credentials not found for this order",
      });
    }
    const loginData = await Credential.findOne({ orderId });
    if (!loginData)
      return res
        .status(404)
        .json({ message: "Credentials has not been submitted for this order" });

    const credentials = {
      username: decrypt(loginData.credentials.username),
      password: decrypt(loginData.credentials.password),
      notes: decrypt(loginData.credentials.notes),
    };
    verified.otp = { otpCode: null, otpExpires: null };
    await verified.save();
    const eventString = req.user.isAdmin ? "COMFIRM_SUBMISSION" : "VIEWED";
    const notification = await Notification.findOneAndUpdate(
      { orderId },
      { staus: "new", to: order.seller, event: eventString }
    );
    if (!notification)
      return res.status(404).json({ message: "Unable to submit credentials" });

    return res.status(200).json({ credentials });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching credentials" });
  }
};

// Orders in the last 30 days
exports.getRecentOrders = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).populate("assets.asset userId");

    res.status(200).json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get user sales
exports.getUserSales = async (req, res) => {
  try {
    const userId = req.user.isAdmin ? req.params.userId : req.user.userId;
    let { limit = 20, page = 1, ...query } = req.query || {};
    const options = {
      filter: { ...query, seller: userId },
      limit,
      page,
      populate: "seller asset buyer",
      populateSelect: "title price isSold category username email phone",
      select: "-credentials -credentialsSubmitedAt",
    };

    const orders = await paginate(Order, options);
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "No available order found" });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.isAdmin ? req.params.userId : req.user.userId;
    let { limit = 20, page = 1, ...query } = req.query || {};
    const options = {
      filter: { ...query, buyer: userId },
      limit,
      page,
      populate: "buyer asset seller",
      populateSelect: "title price isSold category username email phone",
      select: "-credentials -credentialsSubmitedAt",
    };
    const orders = await paginate(Order, options);
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "No available order found" });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get user sold asset's stats by userId from params
exports.getUserSalesStats = async (req, res) => {
  try {
    const userId = req.user.isAdmin ? req.params.userId : req.user.userId;
    // Aggregate orders by status and calculate total spent
    const sales = await Order.find({ seller: userId });

    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0);

    const statusBreakdown = sales.reduce((acc, sale) => {
      const status = sale.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalSales,
      totalAmount,
      statusBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get user orders stats by userId from params
exports.getUserOrderStats = async (req, res) => {
  try {
    const userId = req.user.isAdmin ? req.params.userId : req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // Aggregate orders by status and calculate total spent
    const orders = await Order.find({ buyer: userId });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);
    const statusBreakdown = orders.reduce((acc, order) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalOrders,
      totalSpent,
      statusBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
