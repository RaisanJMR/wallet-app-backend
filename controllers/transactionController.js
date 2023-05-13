const asyncHandler = require('express-async-handler')
const User = require('../models/userModal')
const Transaction = require('../models/transactionModal')

// @desc    Transfer money
// @route   POST /api/transfer
// @access  Private
const transferAmount = asyncHandler(async (req, res) => {
  const { amount, sender, receiver, type, reference, status } = req.body
  const receiverUser = await User.findById(receiver)

  if (req.user._id != sender || !receiverUser || req.user.isVerified != true) {
    res.status(400)
    throw new Error('sender not verified or loggedin or receiver not found')
  } else {
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
    await transfer.save()
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
      res.status(404)
      throw new Error('not created transfer')
    }
  }
})

// @desc    Transfer money(verify receiver)
// @route   POST /api/verify-receiver
// @access  Private

const verifyReceiver = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.receiver })
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404)
      throw new Error('receiver not found')
    }
  } catch (error) {
    res.status(404)
    throw new Error(error)
  }
})

// @desc    get all transactions from a user
// @route   GET /api/all_transaction
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { id } = req.body
  const transactions = await Transaction.find({
    $or: [{ sender: id }, { receiver: id }],
  })
    .sort({ createdAt: -1 })
    .populate('sender')
    .populate('receiver')
    .populate('sender', 'name')
    .populate('receiver', 'name')
  if (transactions) {
    res.status(200).send(transactions)
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
  getTransactions,
  verifyReceiver,
  deposit,
}
