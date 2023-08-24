const express = require('express');
const { registerUser, authUser, getUsers, changeAvater, changeCover, } = require('../controllers/userControllers');
const { protect } = require('../middleware/authHandler');

const router = express.Router();

router.route("/").post(registerUser).get(protect, getUsers);
router.post("/login", authUser);
router.route("/avater").put(protect, changeAvater)
router.route("/cover").put(protect, changeCover)
module.exports = router;