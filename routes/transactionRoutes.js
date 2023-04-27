const express = require('express')

const {
  transferAmount,
  verifyAccount,
  getTransactions,
  deposit
} = require('../controllers/transactionController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/transfer').post(protect, transferAmount)
router.route('/deposit').post(protect, deposit)
router.route('/verify').post(protect, verifyAccount)
router.route('/get_transactions').post(protect, getTransactions)

module.exports = router
