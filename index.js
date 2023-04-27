const dotenv = require('dotenv').config()
const path = require('path')
const express = require('express')
const colors = require('colors')
const cors = require('cors')
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorHandler')

connectDB()

const app = express()
// Enable CORS
app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 5000
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/', require('./routes/transactionRoutes'))
app.get('/', (req, res) => {
  res.send('api is running...')
})

app.use(errorHandler)

app.listen(PORT, () =>
  console.log(
    `Server Running on Port: http://localhost:${PORT} at ${new Date().toLocaleString(
      'en-US'
    )}`.bgCyan.bold.underline
  )
)
