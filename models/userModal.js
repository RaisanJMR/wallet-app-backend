const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      min: [6, 'password must contain at least 6 numbers'],
      max: 12,
    },
    id_type: {
      type: String,
      required: [true, 'Please add identification type'],
      enum: ['driver license', 'passport', 'national ID'],
    },
    id_number: {
      type: String,
      required: [true, 'Please add identification number'],
      min: [6, 'at least 6 numbers'],
      max: 12,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)


module.exports = mongoose.model('User', userSchema)
