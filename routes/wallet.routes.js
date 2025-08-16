const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

// Get wallet balance and transactions
router.get('/:userId', walletController.getWallet);
router.get('/update-wallet', walletController.updateWallet);

module.exports = router;
