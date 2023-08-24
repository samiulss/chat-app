const express = require('express');
const { sendMessage, allMessages, seenMessage, deliveredMessage, deleteMessage, unseenMessage, forWardMessage, } = require('../controllers/messageController');
const { protect } = require('../middleware/authHandler');

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages)
router.route("/seen").put(protect, seenMessage);
router.route("/delivered").put(protect, deliveredMessage);
router.route("/delete").put(protect, deleteMessage);
router.route("/unseen").put(protect, unseenMessage);
router.route("/forward").post(protect, forWardMessage)

module.exports = router;