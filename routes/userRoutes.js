const router = require('express').Router()
const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
// register user
router.post('/register', async (req, res) => {
  try {
    // check duplicate users
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.send({
        success: false,
        message: 'user already exist',
      })
    }
    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedPassword
    const newUser = await new User(req.body)
    await newUser.save()
    res.send({ message: 'user created', data: null, success: true })
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    })
  }
})
// login user
router.post('/login', async (req, res) => {
  try {
    // check duplicate users
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.send({
        success: false,
        message: 'user does not exist',
      })
    }
    //compare entered password with hash password

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.send({
        success: false,
        message: 'Invalid password',
      })
    }
    //generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })
    res.send({
      message: 'user logged in successfully',
      data: token,
      success: true,
    })
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    })
  }
})

module.exports = router
