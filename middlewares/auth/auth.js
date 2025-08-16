const jwt = require("jsonwebtoken");
require("dotenv/config");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Please sign-in" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Forbidden! Please sign out and sign in" });
    }
    req.user = decoded;
    next();
  });
}

//check Admin
function admin(req, res, next) {
 if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Unathorized Person!" });
 }
  next();
}

module.exports = {
 auth,
  admin,
}
