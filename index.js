require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./configs/db");
const PORT = process.env.PORT || 3000;

//routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const orderRoutes = require("./routes/order.routes");
const blogRoutes = require("./routes/blog.routes");
const categoryRoutes = require("./routes/category.routes");
const assetRoutes = require("./routes/assets.routes");
const walletRoutes = require("./routes/wallet.routes");
const paymentRoutes = require("./routes/payment.routes");
const transactionRoutes = require("./routes/transactions.routes");
const platformRoutes = require("./routes/platform.routes");
const notificationRoutes = require("./routes/notification.routes");
const cartRoutes=require("./routes/cart.routes")
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse x-www-form-urlencoded

//CORS
const cors = require("cors");
app.use(cors("*"));

// Routes
app.get("/", (req, res) => {
  res.send(`Hello from worker ${process.pid}`);
});

const apiVersion = "api/v1";
app.use(`/${apiVersion}/users`, userRoutes);
app.use(`/${apiVersion}/auth`, authRoutes);
app.use(`/${apiVersion}/orders`, orderRoutes);
app.use(`/${apiVersion}/blog`, blogRoutes);
app.use(`/${apiVersion}/categories`, categoryRoutes);
app.use(`/${apiVersion}/assets`, assetRoutes);
app.use(`/${apiVersion}/wallet`, walletRoutes);
app.use(`/${apiVersion}/payment`, paymentRoutes);
app.use(`/${apiVersion}/transactions`, transactionRoutes);
app.use(`/${apiVersion}/platforms`, platformRoutes);
app.use(`/${apiVersion}/notifications`, notificationRoutes);
app.use(`/${apiVersion}/cart`, cartRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Worker ${process.pid} running on PORT:${PORT}`);
});
// }
connectDB(); // Connect to MongoDB
