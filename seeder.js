const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const fs  = require('fs')
const path = require('path')
const colors = require('colors')
const User = require('./models/userModal')
const connectDB = require('./config/db')

connectDB()
// READ JSON FILES

const users = JSON.parse(
  fs.readFileSync(`${path.resolve()}/data/users.json`, 'utf-8')
)
console.log(path.resolve())
const importData = async () => {
  try {
    await User.deleteMany()
    await User.insertMany(users)

    console.log('Data Imported!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await User.deleteMany()
    console.log('Data Destroyed!'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}
if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
