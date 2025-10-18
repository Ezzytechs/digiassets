const Notification = require("../models/notification.model");
const { paginate } = require("../utils/pagination");

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...query } = req.query;

    const searchQuery = req.user.isAdmin
      ? { event: { $in: ["VIEWED", "SUBMIT_CREDENTIALS"] } }
      : { to: req.user.userId };

    const options = {
      filter: { ...query, ...searchQuery },
      populate: null,
      page,
      limit,
      select: "-description",
    };

    const notifications = await paginate(Notification, options);
    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

//Notifications counter
exports.userNotificationsCounter = async (req, res) => {
  try {
    const query = { to: req.user.userId, status: "new" };
    const notifications = await Notification.countDocuments({ ...query });
    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

//Admin Notifications counter
exports.adminNotificationsCounter = async (req, res) => {
  try {
    const query = { event: { $in: ["VIEWED", "SUBMIT_CREDENTIALS"] } };

    const notificationsCount = await Notification.countDocuments(query);

    res.status(200).json({ count: notificationsCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single category by ID
exports.getNotificationById = async (req, res) => {
  try {
    let notification = null;
    if (req.user.isAdmin) {
      notification = await Notification.findById(req.params.id);
      if (notification.event === "VIEWED") {
        notification.event = "COMFIRM_SUBMISSION";
        await notification.save();
      }
    } else {
      notification = await Notification.findOne({
        _id: req.params.id,
        to: req.user.userId,
      });
      notification.status = "seen";
      await notification.save();
    }
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
