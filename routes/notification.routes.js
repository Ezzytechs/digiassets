const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth, admin} = require('../middlewares/auth/auth');

//get all categories
router.get('/', auth, notificationController.getAllNotifications);

//get new notifications count
router.get('/user/new', auth, notificationController.userNotificationsCounter);

//get new notifications count
router.get('/admin/new', auth, admin, notificationController.adminNotificationsCounter);

//get notification by id
router.get('/:id', auth, notificationController.getNotificationById);

module.exports = router;
