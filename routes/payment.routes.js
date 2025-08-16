const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const {auth, admin} = require("../middlewares/auth/auth");

router.post('/initialize', paymentController.initPayment);
router.post('/verify', paymentController.verifyPament);
router.post('/make-transfer', auth, admin, paymentController.MakeTransafer);

module.exports = router;
