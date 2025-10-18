const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  getCartCount,
} = require("../controllers/cart.controller.js");
const { auth } = require("../middlewares/auth/auth");

const router = express.Router();

router.use(auth);
router.post("/add", addToCart);
router.get("/", getCart);
router.delete("/remove/:assetId", removeFromCart);
router.delete("/clear", clearCart);
router.get("/count", getCartCount);

module.exports = router;
