const express = require('express')

const {
  transferAmount,
  getTransactions,
  deposit,
  verifyReceiver,
} = require('../controllers/transactionController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/transfer').post(protect, transferAmount)
router.route('/deposit').post(protect, deposit)
router.route('/verify-receiver').post(protect, verifyReceiver)
router.route('/get_transactions').get(protect, getTransactions)

module.exports = router
