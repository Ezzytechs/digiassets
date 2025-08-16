const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { auth, admin } = require('../middlewares/auth/auth');
const upload= require("../utils/multer");

//create category
router.post('/', auth, admin, upload.single("image"), categoryController.createCategory);

//get all categories
router.get('/', categoryController.getAllCategories);

//get category by id
router.get('/:id', categoryController.getCategoryById);

//update category
router.put('/:id', auth, admin, categoryController.updateCategory);

//delete category
router.delete('/:id',auth, admin, categoryController.deleteCategory);

module.exports = router;
