const asyncHandler = require('express-async-handler')
const User = require('../models/userModal')
const Transaction = require('../models/transactionModal')

// @desc    Transfer money
// @route   POST /api/transfer
// @access  Private
const transferAmount = asyncHandler(async (req, res) => {
  const { isVerified } = req.user
  if (isVerified) {
    const { amount, sender, receiver, type, reference, status } = req.body
    if (!amount || !sender || !receiver || !type || !reference || !status) {
      res.status(400)
      throw new Error('please include all fields')
    }
    const transfer = await Transaction.create({
      amount,
      sender,
      receiver,
      type,
      reference,
      status,
    })
    // decrease the sender's balance
    await User.findByIdAndUpdate(sender, {
      $inc: { balance: -amount },
    })

    // increase the receiver's balance
    await User.findByIdAndUpdate(receiver, {
      $inc: { balance: amount },
    })
    if (transfer) {
      res.status(201).send({
        _id: transfer._id,
        amount: transfer.amount,
        sender: transfer.sender,
        receiver: transfer.receiver,
        type: transfer.type,
        reference: transfer.reference,
        status: transfer.status,
      })
    } else {
      res.status(400)
      throw new Error('Invalid transaction data')
    }
  } else {
    res.status(400)
    throw new Error('sender not verified')
  }
})

// @desc    verify account
// @route   POST /api/verify
// @access  Private
const verifyAccount = asyncHandler(async (req, res) => {
  const { receiver } = req.body
  const user = await User.findOne({ _id: receiver })
  if (user) {
    res.status(200).send({
      success: true,
      msg: 'account verified',
    })
  } else {
    res.status(400)
    throw new Error('Account not verified')
  }
})
// @desc    get all transactions from a user
// @route   POST /api/all_transaction
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { id } = req.body
  const transactions = await Transaction.find({
    $or: [{ sender: id }, { receiver: id }],
  })
    .sort({ createdAt: -1 })
    .populate('sender')
    .populate('receiver')
  // .populate('sender', 'name')
  // .populate('receiver', 'name')
  if (transactions) {
    res.status(200).send({
      data: transactions,
      success: true,
    })
  } else {
    res.status(400)
    throw new Error('transaction not found')
  }
})

// @desc    deposit money
// @route   POST /api/deposit
// @access  Private
const deposit = asyncHandler(async (req, res) => {
  const { amount } = req.body
  const user = await User.findById(req.user._id)
  console.log(user._id)
  if (user) {
    const transaction = new Transaction({
      sender: user._id,
      receiver: user._id,
      amount: amount,
      type: 'deposit',
      reference: 'user deposit',
      status: 'success',
    })
    await transaction.save()
    await User.findByIdAndUpdate(user._id, { $inc: { balance: amount } })
    res.status(200).json(user)
  } else {
    res.status(400)
    throw new Error('user not found')
  }

  // res.status(200).json(req.user)
})

module.exports = {
  transferAmount,
  verifyAccount,
  getTransactions,
  deposit,
}
