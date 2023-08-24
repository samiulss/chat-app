const express = require('express');
const { testTing } = require('../controllers/testController');
const { protect } = require('../middleware/authHandler');
const router = express.Router();

router.route('/').post(protect, testTing);

module.exports = router;