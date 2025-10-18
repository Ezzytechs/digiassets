const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platform.controller');
const { auth, admin } = require('../middlewares/auth/auth');
const upload= require("../utils/multer");

//create platform
router.post('/', auth, admin, upload.single("image"), platformController.createPlatform);

//get all categories
router.get('/', platformController.getAllPlatforms);

//get platform by id
router.get('/:id', platformController.getplatformById);

//get platform image
router.get("image/view/:id", platformController.getPlatformImage)

//update platform
router.put('/:id', auth, admin, platformController.updateplatform);

//delete platform
router.delete('/:id',auth, admin, platformController.deleteplatform);

module.exports = router;
