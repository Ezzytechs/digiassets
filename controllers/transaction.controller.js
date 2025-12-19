const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");
const { paginate } = require("../utils/pagination");

// Get all transactions -admin -all{limit, page} q-debit/credit{limit, page, type=debit/credit}
exports.getAllTransactions = async (req, res) => {
  try {
    const { limit, page, ...query } = req.query;
    const options = {
      filter: { ...query },
      limit,
      page,
      populate: "to from",
      select: "-tnxDescription",
    };
    const transactions = await paginate(Transaction, options);
    if (!transactions || transactions.length === 0)
      return res.status(404).json({ message: "No transaction found" });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUserTransactions = async (req, res) => {
  try {
    let { limit = 10, page = 1, ...query } = req.query;
    const userId = req.user.userId;

    let filter = {};

    // If query is empty → fetch all user transactions (from OR to)
    if (Object.keys(query).length === 0) {
      filter = {
        $or: [{ from: userId }, { to: userId }],
      };
    } else {
      // If query has filters → still restrict to user
      query.to ? (query.to = userId) : query;
      query.from ? (query.from = userId) : query;
      filter = {
        ...query,
      };
    }
    const options = {
      filter,
      limit: Number(limit),
      page: Number(page),
      populate: [
        { path: "from", select: "username email phone" },
        { path: "to", select: "username email phone" },
      ],
      select: "-tnxDescription",
    };

    const transactions = await paginate(Transaction, options);

    if (!transactions || transactions.docs.length === 0) {
      return res.status(404).json({ message: "No transaction found" });
    }

    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get total amount of all transactions
exports.getTotalTransactionAmount = async (req, res) => {
  try {
    const match = !req.user.isAdmin
      ? { to: new mongoose.Types.ObjectId(req.user.userId) }
      : {};
    const totalTransactions = await Transaction.countDocuments();
    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res
      .status(200)
      .json({ totalAmount: result[0]?.total || 0, totalTransactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total amount of credit and debit revenue for a user
exports.getUserRevenue = async (req, res) => {
  try {
    const query = req.user.isAdmin ? req.params.id : req.user.userId;
    const [creditRevenue, debitRevenue] = await Promise.all([
      await Transaction.aggregate([
        { $match: { to: new mongoose.Types.ObjectId(query) } },
        {
          $group: {
            _id: "$to",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { from: new mongoose.Types.ObjectId(query) } },
        {
          $group: {
            _id: "$from",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);
    if (!creditRevenue || !debitRevenue)
      return res
        .status(400)
        .json({ message: "Unble to get the total credit for this user." });
    res.status(200).json({
      creditRevenue: creditRevenue[0]?.total || 0,
      debitRevenue: debitRevenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getTransactionsStats = async (req, res) => {
  try {
    const [all, credit, debit] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ type: "credit" }),
      Transaction.countDocuments({ type: "debit" }),
    ]);
    if (
      typeof all !== "number" ||
      typeof credit !== "number" ||
      typeof debit !== "number"
    )
      return res
        .status(400)
        .json({ message: "Unable to get transaction statistics!" });
    res.status(200).json({ all, credit, debit });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.countUserTransactions = async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    const loggedInUserId = req.user.userId;

    let filter = {};

    // ✅ Admin logic
    if (req.user.isAdmin) {
      if (userIdParam && userIdParam !== "all-users") {
        // Count transactions for a specific user
        filter = {
          $or: [{ from: userIdParam }, { to: userIdParam }],
        };
      }
      // else: admin + all-users → no filter (count everything)
    } 
    // ✅ Normal user logic
    else {
      filter = {
        $or: [{ from: loggedInUserId }, { to: loggedInUserId }],
      };
    }

    const count = await Transaction.countDocuments(filter);

    res.status(200).json({ transactionCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*TO BE FEATURED IN FUTURE DOCUMENTATION IF NEED ARISE AND ALL CODES WELL CHECKED AND TESTED!!! */
// // Get all credit transactions
// exports.getCreditTransactions = async (req, res) => {
//   try {
//     const query =req.query
//     // If userId is "alluser" all users else filter by userId
//     const user =
//       req.params.userId === "all-users" ? {} : { user: req.params.userId };

//     const match = req.user.isAdmin ? { user } : { user: req.user.userId };

//     const credits = await Transaction.find(query).sort({ createdAt: -1 });
//     res.status(200).json(credits);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get total amount of debit for a user
// exports.getTotalDebitUser = async (req, res) => {
//   try {
//     // If admin use params else use req userId
//     const debit = req.user.isAdmin
//       ? { from: req.params.userId }
//       : { from: req.user.userId };
//     const result = await Transaction.aggregate([
//       { $match: debit },
//       {
//         $group: {
//           _id: "$type",
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);
//     if (!result)
//       return res
//         .status(400)
//         .json({ message: "Unble to get the total debit for this user." });
//     res.status(200).json({ totaldebit: result[0] });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get total amount of credit and debit for a user and website
// exports.getTotalCreditAndDebit = async (req, res) => {
//   try {
//     const match = {};
//     const result = await Transaction.aggregate([
//       { $match: match },
//       {
//         $group: {
//           _id: "$type",
//           total: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const summary = { credit: 0, debit: 0 };
//     result.forEach((r) => {
//       summary[r._id] = r.total;
//     });

//     res.status(200).json(summary);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get all debit transactions
// exports.getDebitTransactions = async (req, res) => {
//   try {
//     const query = { type: "debit" };
//     // If userId is "user" all users else filter by userId
//     const user =
//       req.params.userId === "all-users" ? {} : { user: req.params.userId };
//     const match = req.user.isAdmin ? { user } : { user: req.user.userId };

//     const debits = await Transaction.find({ ...query, ...match }).sort({
//       createdAt: -1,
//     });
//     res.status(200).json(debits);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Count credit transactions
// exports.countCreditTransactions = async (req, res) => {
//   try {
//     const query = { type: "credit" };
//     // If userId is "user" all users else filter by userId
//     const user =
//       req.params.userId === "all-users" ? {} : { user: req.params.userId };
//     const match = req.user.isAdmin ? { user } : { user: req.user.userId };

//     const count = await Transaction.countDocuments({ ...query, ...match });
//     res.status(200).json({ creditCount: count });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Count debit transactions
// exports.countDebitTransactions = async (req, res) => {
//   try {
//     const query = { type: "debit" };
//     // If userId is "user" all users else filter by userId
//     const user =
//       req.params.userId === "all-users" ? {} : { user: req.params.userId };
//     const match = req.user.isAdmin ? { user } : { user: req.user.userId };

//     const count = await Transaction.countDocuments({ ...query, ...match });
//     res.status(200).json({ debitCount: count });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

//Get user revenue refactored
// // If admin use params else use req userId
// const credit = req.user.isAdmin
//   ? { to: req.params.userId }
//   :req.query.to? { to: req.user.userId }:{ from: req.user.userId };
// const result = await Transaction.aggregate([
//   { $match: credit },
//   {
//     $group: {
//       _id: "$type",
//       total: { $sum: "$amount" },
//     },
//   },
// ]);
