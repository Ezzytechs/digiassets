const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assets.controller");
const { auth, admin } = require("../middlewares/auth/auth");
const upload= require("../utils/multer");

//list asset
router.post("/", auth, upload.single("image"), assetController.listAsset);

//get all asset [accets query params for filters]
router.get("/", assetController.getAllAssets);

//get assets by category name
router.get("/categories/:platform/:category", assetController.getAssetsByCategoryName);

//get assets by username
router.get("/my-assets/:username", assetController.getUserAssets);

//get assets stats [accept query params]
router.get("/stats", auth, assetController.getAssetsStats);

//get assets stats 
router.get("/get/stats", auth, admin, assetController.assetsStats);


//get asset by id
router.get("/:id", assetController.getAssetById);

//stream asset image by image nodeId
router.get("/image/view/:id", assetController.getAssetImage);

//update asset
router.put("/:id", auth, upload.single("image"), assetController.updateAsset);

//delete asset by id
router.delete("/:id", auth, assetController.deleteAsset);

//search filter
router.get("/search", assetController.filterAssets);



module.exports = router;