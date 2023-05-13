const asyncHandler = require('express-async-handler')
const Request = require('../models/requestModal')
const Transaction = require('../models/transactionModal')
const User = require('../models/userModal')

// @desc    send request to another user
// @route   POST /api/request
// @access  Private
const requestAmount = asyncHandler(async (req, res) => {
  const { receiver, amount, description } = req.body
  if (req.user._id == receiver) {
    res.status(400)
    throw new Error('request not send, sender and receiver same')
  } else {
    try {
      if (!receiver || !amount || !description) {
        res.status(400)
        throw new Error('please include all fields')
      }
      const request = new Request({
        sender: req.user._id,
        receiver,
        amount,
        description,
      })
      await request.save()
      res.status(201).json(request)
    } catch (error) {
      throw new Error(error)
    }
  }
})

// @desc    get all request for a user
// @route   POST /api/get-request
// @access  Private
const getAllRequest = asyncHandler(async (req, res) => {
  // console.log(req.user)
  try {
    const requests = await Request.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender')
      .populate('receiver')
      .sort({ createdAt: -1 })
    if (requests) {
      return res.status(200).json(requests)
    }
  } catch (error) {
    res.status(404)
    throw new Error(error)
  }
})

// @desc    update request status
// @route   POST /api/update-request-status
// @access  Private
const updateRequestStats = asyncHandler(async (req, res) => {
  const { _id, sender, receiver, amount, description, status } = req.body

  console.table([_id, sender, receiver, amount, description, status])

  try {
    if (status === 'accepted') {
      const transaction = new Transaction({
        sender: receiver,
        receiver: sender,
        amount: amount,
        reference: description,
        status: 'success',
      })
      await transaction.save()
      // deduct the amount from the sender
      await User.findByIdAndUpdate(sender, {
        $inc: { balance: amount },
      })

      // add the amount to the receiver
      await User.findByIdAndUpdate(receiver, {
        $inc: { balance: -amount },
      })
      res.status(201).json(transaction)

      await Request.findByIdAndUpdate(_id, {
        status: status,
      })
    }
  } catch (error) {
    res.status(404)
    throw new Error(error)
  }
})

module.exports = {
  requestAmount,
  getAllRequest,
  updateRequestStats,
}