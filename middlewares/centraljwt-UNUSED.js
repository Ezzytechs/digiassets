// const { expressjwt } = require("express-jwt");
// require("dotenv/config");
// const mySecret = process.env.TOKEN_SECRET;
// const authJwt = expressjwt({
//   secret: mySecret,
//   algorithms: ["HS256"],
//   isRevoked: async (req, payload) => {
//     console.log(req.url);
//     try {
//       if (payload.payload.isAdmin !== true) {
//         throw new Error("Token revoked!");
//       }
//       return false;
//     } catch (error) {
//       console.error("Revoked");
//       return true;
//     }
//   },
// }).unless({
//   //NON REGISTERED USERS
//   path: [
//     { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
//     { url: /\/api\/v1\/users(.*)/, methods: ["GET", "OPTIONS"] },
//     { url: /\/api\/v1\/category(.*)/, methods: ["GET", "OPTIONS"] },
//     "/api/v1/products",
//     "/api/v1/users/login",
//     "/api/v1/users/register",
//   ],
// });
// //LEARN TO ALLOW PATHS BASED ON SEVERAL ROLES
// //ALSO CHANGE THE PATH OF PROFILE
// module.exports = authJwt;
