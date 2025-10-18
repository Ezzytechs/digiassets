const Cart = require("../models/cart.model.js");

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assetId } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ asset: assetId, quantity: 1 }],
      });
    } else {
      const itemExists = cart.items.some(
        (item) => item.asset.toString() === assetId
      );

      if (!itemExists) {
        cart.items.push({ asset: assetId, quantity: 1 });
        await cart.save();
      }
    }

    const populatedCart = await cart.populate("items.asset");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.asset",
      populate: {
        path: "category",
      },
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assetId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.asset.toString() !== assetId);

    await cart.save();
    const populatedCart = await cart.populate({
      path: "items.asset",
      populate: { path: "category" },
    });

    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get total items count
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId });

    const totalItems = cart ? cart.items.length : 0;
    res.status(200).json({ totalItems });
  } catch (err) {
    console.error("Get cart count error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
