const express = require('express')
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')

const userRoute = require('./routes/userRoutes')

const app = express()
app.use(express.json())
app.use('/api/user', userRoute)
const PORT = process.env.PORT || 5000
connectDB()

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`)
})
