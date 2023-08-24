const express = require('express');
const { sendNotification, getNotification, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authHandler');
const router = express.Router();

router.route("/").post(protect, sendNotification);
router.route("/").get(protect, getNotification);
router.route("/:chatId").delete(protect, deleteNotification);

module.exports = router;