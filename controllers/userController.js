const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const User = require('../models/userModal')

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    address,
    id_type,
    id_number,
    isAdmin,
    isVerified,
    balance,
  } = req.body
  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !id_type ||
    !id_number ||
    !balance
  ) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  // Check if user exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const user = await User.create({
    name,
    email,
    balance,
    password: hashedPassword,
    phone,
    address,
    id_type,
    id_number,
    isAdmin,
    isVerified,
  })

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      balance: user.balance,
      email: user.email,
      phone: user.phone,
      address: user.address,
      id_type: user.id_type,
      id_number: user.id_number,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    })
  } else {
    // 400 Bad Request

    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Register new user
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    // 401 Unauthorized
    res.status(401)
    throw new Error('Invalid credentials')
  }
})

// @desc    get current user
// @route   GET /api/users/curent_user
// @access  Protect
const currentUser = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    email: req.user.email,
    name: req.user.name,
  }
  res.status(200).json(user)
})

// @desc    get all users
// @route   GET /api/users/get_users
// @access  Protect
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
  if (users) {
    res.status(200).json(users)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    verify user
// @route   GET /api/users/verify_user/:id
// @access  Protect
const verify = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    user.isVerified = req.body.isVerified || user.isVerified
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      isVerified: updatedUser.isVerified,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

module.exports = {
  register,
  login,
  currentUser,
  getUsers,
  verify,
}
