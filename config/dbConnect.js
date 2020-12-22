const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
.then(() => {
    // mongoose.set('debug', true)
    console.log('success')
}).catch(() => {
    console.log('error')
})
