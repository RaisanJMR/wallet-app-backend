const express = require('express')

const {
  requestAmount,
  getAllRequest,
  updateRequestStats,
} = require('../controllers/requestController')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()

router.route('/request').post(protect, requestAmount)
router.route('/get-request').post(protect, getAllRequest)
router.route('/update-request-status').post(protect, updateRequestStats)

module.exports = router
