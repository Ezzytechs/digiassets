const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const {auth, admin} = require("../middlewares/auth/auth");

// cancel order user
router.get("/cancel/:id", auth, orderController.cancelOrder);

// cancel order -nonRegUser
router.get("/cancel/non-user/mail", orderController.cancelOrderNonRegUser);

// report order user
router.get("/cancel/:id", auth, orderController.markFakeOrder);

// report order -nonRegUser
router.get("/cancel/:id/:email", auth, orderController.nonRegUsermarkFakeOrder);

// Get all orders (admin only)
router.get("/", auth, admin, orderController.getAllOrders);

// Get orders stats (admin only)
router.get("/order-stats", auth, admin, orderController.getOrderStats);

// Get order by ID 
router.get("/:id", auth, orderController.getOrderById);

// Seller submits login credentials
router.put('/:orderId/submit-credentials', auth, orderController.submitCredentials);

// Buyer or admin fetches decrypted login credentials
router.post('/reveal/credentials', auth, orderController.getDecryptedCredentials);

// Get recent orders (last 30 days)
router.get("/recent", auth, admin, orderController.getRecentOrders);

// Get user sales 
router.get("/user/sales/:userId", auth, orderController.getUserSales);

// Get user orders 
router.get("/user/orders/:userId", auth, orderController.getUserOrders);

// Get user sales stats
router.get("/user/sales-stats/:userId", auth, orderController.getUserSalesStats);

// Get user orders (authenticated user)
router.get("/user/orders-stats/:userId", auth, orderController.getUserOrderStats);

router.get("/user/stats/:userId", orderController.getUserOrderStats);

module.exports = router;