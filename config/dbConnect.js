const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
.then(() => {
    console.log('success')
}).catch(() => {
    console.log('error')
})
