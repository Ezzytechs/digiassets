const Order = require("../models/orders.model");
const { User } = require("../models/users.model");
const Credential = require("../models/credential.model");
const Notification = require("../models/notification.model");
const { encrypt, decrypt } = require("../utils/encryption");
const { paginate } = require("../utils/pagination");
const emailObserver = require("../utils/observers/email.observer");
const emailTemplate = require("../utils/mailer");
const credentials = require("../configs/credentials");

//cancel order by id
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    //get the order
    const order = await Order.findById(id).populate("asset buyer seller");
    if (!order)
      return res
        .status(400)
        .json({ message: "Order with this ID does not exit" });

    //check if the login details has been provided
    if (order.status === "credentials_submitted")
      return res.status(400).json({
        message: "Credentials has been submitted by the seller",
      });
    //check if buyer or seller cancelling the order
    if (
      order.seller?._id.toString() !== req.user.userId &&
      order.buyer._id.toString() !== req.user.userId
    )
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this order" });

    if (order.nonRegUser?.email) {
      //send mail to buyer or seller cancelled order, ordered by non reg user
      emailObserver.emit("SEND_MAIL", {
        to: order.nonRegUser?.email,
        subject: `Refund Notification`,
        templateFunc: emailTemplate.oderCancelledNonRegUserTemplate,
        templateData: {
          buyerName: order.nonRegUser?.email,
          amount: order.price,
          refundEmail: credentials.email,
        },
      });
    }

    order.status = "cancelled";
    await order.save();

    //email sender
    emailObserver.emit("SEND_MAIL", {
      to: order.seller?.email,
      subject: "Order Cancelled",
      templateFunc: emailTemplate.orderCancelledSellerTemplate,
      templateData: { sellerName: seller.username },
    });

    //send mail to buyer
    emailObserver.emit("SEND_MAIL", {
      to: order.buyer?.email,
      subject: "Refund Notification",
      templateFunc: emailTemplate.orderCancelledBuyerTemplate,
      templateData: { buyerName: buyer.username, amount: order.price },
    });

    emailObserver.emit("SEND_MAIL", {
      to: credentials.siteEmail,
      subject: "Order Cancelled",
      templateFunc: emailTemplate.orderCancelledAdminTemplate,
      templateData: {
        buyerName: order.buyer?.username,
        sellerName: seller.username,
        amount: order.price,
        reason: "Unknown",
        orderId: order._id,
      },
    });

    res.status(200).json({ order, message: "Refund successful" });
  } catch (err) {
    // console.log(err)
    res.status(500).json({ message: err.message });
  }
};

//cancelled order for non reg user
exports.cancelOrderNonRegUser = async () => {
  try {
    const { email, id } = req.query;
    const order = await Order.findOne({
      "nonRegUser.email": email,
      _id: id,
    }).populate("seller");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "credentials_submitted")
      return res
        .status(403)
        .json({ message: "Credentials has been submitted for this order" });

    emailObserver.emit("SEND_MAIL", {
      to: order.seller?.email,
      subject: "Order Cancelled",
      templateFunc: emailTemplate.orderCancelledSellerTemplate,
      templateData: { sellerName: seller.username },
    });

    //send mail to buyer or seller cancelled order, ordered by non reg user
    emailObserver.emit("SEND_MAIL", {
      to: order.nonRegUser?.email,
      subject: `Refund Notification`,
      templateFunc: emailTemplate.oderCancelledNonRegUserTemplate,
      templateData: {
        buyerName: order.nonRegUser?.email,
        amount: order.price,
        refundEmail: credentials.email,
      },
    });

    //mail admin
    emailObserver.emit("SEND_MAIL", {
      to: credentials.siteEmail,
      subject: "Order Cancelled",
      templateFunc: emailTemplate.orderCancelledAdminTemplate,
      templateData: {
        sellerName: seller.username,
        orderId: order._id,
        amount: order.price,
        reason: "Unknown",
      },
    });

    order.status = "cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled succesfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Report order
exports.markFakeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the order with relations
    const order = await Order.findOne({
      _id: id,
      buyer: req.user.userId,
    }).populate("asset buyer seller");

    if (!order)
      return res
        .status(400)
        .json({
          message: "Order with the provided credentials does not exist",
        });

    // Check if credentials were submitted
    if (order.status !== "credentials_submitted") {
      return res.status(400).json({
        message: "Credentials have not been submitted by the seller",
      });
    }

    // Mark order as fake
    order.status = "fake";
    await order.save();

    const { asset, buyer, seller, _id, price } = order;

    // === Send Emails ===

    // 1️⃣ Send to Seller
    emailObserver.emit("SEND_MAIL", {
      to: order.seller?.email,
      subject: "Your Sale Has Been Reported as Fake",
      templateFunc: emailTemplate.orderReportedSellerTemplate,
      templateData: {
        sellerName: seller?.username || "Seller",
        orderId: _id,
        assetTitle: asset?.title || "Unknown Asset",
        amount: price,
        reportDate: new Date().toLocaleDateString(),
        submitCredentialsUrl: `${process.env.CLIENT_URL}/seller/orders/${_id}/submit-credentials`,
        supportUrl: `${process.env.CLIENT_URL}/support`,
      },
    });

    // 2️⃣ Send to Buyer
    emailObserver.emit("SEND_MAIL", {
      to: order.buyer?.email,
      subject: "Your Report Has Been Received",
      templateFunc: emailTemplate.orderReportedBuyerTemplate,
      templateData: {
        buyerName: buyer?.username || "Buyer",
        orderId: _id,
        assetTitle: asset?.title || "Unknown Asset",
        amount: price,
        reportDate: new Date().toLocaleDateString(),
        supportUrl: `${process.env.CLIENT_URL}/support`,
      },
    });

    // 3️⃣ Send to Admin
    emailObserver.emit("SEND_MAIL", {
      to: credentials.siteEmail,
      subject: "Order Reported as Fake",
      templateFunc: emailTemplate.orderReportedAdminTemplate,
      templateData: {
        adminName: "Admin",
        orderId: _id,
        buyerName: buyer?.username || "Buyer",
        sellerName: seller?.username || "Seller",
        assetTitle: asset?.title || "Unknown Asset",
        amount: price,
        reportReason: "Buyer reported this order as fake.",
        reportDate: new Date().toLocaleDateString(),
        adminDashboardUrl: `${process.env.CLIENT_URL}/admin/orders/${_id}`,
      },
    });

    // Success response
    res.status(200).json({
      order,
      message: "Order reported successfully and notifications sent.",
    });
  } catch (err) {
    console.error("Error reporting order:", err);
    res.status(500).json({ message: err.message });
  }
};

//Report order -nonRegUser
exports.nonRegUsermarkFakeOrder = async (req, res) => {
  try {
    const { id, email } = req.params;
    //get the order
    const order = await Order.findOne({
      _id: id,
      "nonRegUser.email": email,
    }).populate("asset seller");
    if (!order)
      return res
        .status(400)
        .json({ message: "Order with this ID does not exit" });

    //check if the login details has been provided
    if (!order.status === "credentials_submitted")
      return res.status(400).json({
        message: "Credentials has not been submitted by the seller",
      });

    order.status = "fake";
    await order.save();

    // === Send Emails ===

    // 1️⃣ Send to Seller
    emailObserver.emit("SEND_MAIL", {
      to: order.seller?.email,
      subject: "Your Sale Has Been Reported as Fake",
      templateFunc: emailTemplate.orderReportedSellerTemplate,
      templateData: {
        sellerName: seller?.username || "Seller",
        orderId: _id,
        assetTitle: asset?.title || "Unknown Asset",
        amount: price,
        reportDate: new Date().toLocaleDateString(),
        submitCredentialsUrl: `${process.env.CLIENT_URL}/seller/orders/${_id}/submit-credentials`,
        supportUrl: `${process.env.CLIENT_URL}/support`,
      },
    });

    // 2️⃣ Send to Buyer
    emailObserver.emit("SEND_MAIL", {
      to: order.nonRegUser?.email,
      subject: "Your Report Has Been Received",
      templateFunc: emailTemplate.orderReportedBuyerTemplate,
      templateData: {
        buyerName: buyer?.username || "Buyer",
        orderId: _id,
        assetTitle: asset?.title || "Unknown Asset",
        amount: price,
        reportDate: new Date().toLocaleDateString(),
        supportUrl: `${process.env.CLIENT_URL}/support`,
      },
    });

    // 3️⃣ Send to Admin
    emailObserver.emit("SEND_MAIL", {
      to: credentials.siteEmail,
      subject: "Order Reported as Fake",
      templateFunc: emailTemplate.orderReportedAdminTemplate,
      templateData: {
        adminName: "Admin",
        orderId: _id,
        buyerName: buyer?.username || "Buyer",
        sellerName: seller?.username || "Seller",
        assetTitle: asset?.title || "Unknown Asset",
        amount: price,
        reportReason: "Buyer reported this order as fake.",
        reportDate: new Date().toLocaleDateString(),
        adminDashboardUrl: `${process.env.CLIENT_URL}/admin/orders/${_id}`,
      },
    });
    res.status(200).json({ order, message: "Order reported successfully" });
  } catch (err) {
    // console.log(err)
    res.status(500).json({ message: err.message });
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
    const [total, paid, credentials_submitted, completed, cancelled] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: "paid" }),
        Order.countDocuments({ status: "credentials_submitted" }),
        Order.countDocuments({ status: "completed" }),
        Order.countDocuments({ status: "cancelled" }),
      ]);

    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Registered users' orders
    const registeredOrdersCount = await Order.countDocuments({
      buyer: { $ne: null },
    });

    // Unregistered users' orders
    const unregisteredOrdersCount = await Order.countDocuments({
      buyer: null,
    });

    res.status(200).json({
      total,
      paid,
      credentials_submitted,
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
      {
        path: "asset",
        select: "-updatedAt -status",
        populate: [
          { path: "category", select: "name" },
          { path: "platform", select: "name" },
        ],
      },
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
    }).populate("asset seller buyer");

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

    if (order.status === "credentials_submitted" || order.status === "fake") {
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

      //mail buyer
      //mail admin
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
      //update order status
      order.status = "credentials_submitted";
      order.credentialsSubmittedAt = new Date();
      await order.save();

      const buyer = order.nonRegUser?.email ? {} : { to: order.buyer._id };
      //update notification
      const updateNotification = await Notification.findOneAndUpdate(
        { orderId },
        { status: "new", ...buyer, event: "SUBMIT_CREDENTIALS" }
      );
      if (!updateNotification)
        return res
          .status(404)
          .json({ message: "Unable to submit credentials" });
    }

    if (order?.nonRegUser) {
      //send email to the non registerd user with the credentials
      emailObserver.emit("SEND_MAIL", {
        to: order.nonRegUser?.email,
        subject: "Your Ordered Asset Credentials",
        templateFunc: emailTemplate.credentialsSubmittedNonRegUserTemplate,
        templateData: {
          sellerName: order.seller.username,
          assetTitle: order.asset?.title,
          loginName: req.body?.username,
          password: req.body?.password,
          note: req.body?.note || "NA",
        },
      });
    } else {
      emailObserver.emit("SEND_MAIL", {
        to: order.buyer?.email,
        subject: "Your Ordered Asset Credentials",
        templateFunc: emailTemplate.credentialsSubmittedTemplate,
        templateData: {
          userName: order.user?.username,
          assetTitle: order.asset?.title,
          orderViewUrl: `${credentials.orderViewPage}/${order._id}/view`,
        },
      });
    }
    emailObserver.emit("SEND_MAIL", {
      to: credentials.siteEmail,
      subject: "Order Credentials Submiited ",
      templateFunc: emailTemplate.credentialsSubmittedAdminTemplate,
      templateData: {
        adminName: credentials.adminName,
        buyerName: order.buyer?.username || "Not User",
        buyerEmail: order.buyer?.username || order.nonRegUser.email,
        assetTitle: order.asset?.title,
        sellerName: order.seller.username,
        viewUrl: `${credentials.orderViewPageAdmin}/${order._id}/view`,
      },
    });
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
    // order.status="credentials_viewed";
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

// GET order stats for details
exports.getUserOrderStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Run all counts in parallel
    const [totalOrders, completedOrders, fakeOrders] = await Promise.all([
      Order.countDocuments({ seller: userId }),
      Order.countDocuments({ seller: userId, status: "completed" }),
      Order.countDocuments({ seller: userId, status: "fake" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        fakeOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
