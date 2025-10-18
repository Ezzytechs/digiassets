const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { auth, admin } = require("../middlewares/auth/auth")

//get all transactions -admin
router.get('/', auth, admin, transactionController.getAllTransactions);

//get all user transactions -users
router.get('/my-transactions-history', auth, transactionController.getAllUserTransactions);

//get total transaction amount [including debit and credit]
router.get('/total', auth, admin, transactionController.getTotalTransactionAmount);

router.get('/user/revenue', auth, transactionController.getUserRevenue);

router.get('/stats', auth, admin, transactionController.getTransactionsStats);

module.exports = router;



/*BELOW ROUTES BELONGS TO UNTESTED SERVICES COULD BE FEATURE IN FUTURE FEATURES IF NEED ARISE!!! */
// //get total revenue of credit transactions
// router.get('/credits', auth, transactionController.getCreditTransactions);

// //get total transa
// router.get('/totals/by-type/:userId', auth, transactionController.getTotalCreditAndDebit);

// router.get('/debits', auth, transactionController.getDebitTransactions);
// router.get('/count/credits', auth, transactionController.countCreditTransactions);
// router.get('/count/debits', auth, transactionController.countDebitTransactions);

