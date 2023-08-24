const express = require('express');
const { accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup, blockUser, unBlockUser, makeAdmin, removeAdmin, deleteChat, groupImage, groupCoverImage, favourite, unFavourite } = require('../controllers/chatController');
const { protect } = require('../middleware/authHandler');

const router = express.Router()

router.route("/").post(protect, accessChat)
router.route("/").get(protect, fetchChat)
router.route("/group").post(protect, createGroupChat)
router.route("/rename").put(protect, renameGroup)
router.route("/groupadd").put(protect, addToGroup)
router.route("/groupRemove").put(protect, removeFromGroup)
router.route("/block").put(protect, blockUser)
router.route("/unblock").put(protect, unBlockUser)
router.route("/makeamin").put(protect, makeAdmin)
router.route("/removeadmin").put(protect, removeAdmin)
router.route("/deletechat").put(protect, deleteChat)
router.route("/favourite").put(protect, favourite)
router.route("/unfavourite").put(protect, unFavourite)
router.route("/groupimage").put(protect, groupImage)
router.route("/groupcover").put(protect, groupCoverImage)

module.exports = router;