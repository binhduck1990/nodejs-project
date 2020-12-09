const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
      type: String,
      required: true,
      minLength: 1,
      maxlength: 10
    },
    password: {
      type: String,
      required: true,
      minLength: 8
    },
    email: {
      type: String,
      required: true,
      maxlength: 50,
      validate: {
        validator: function(v) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email"
      }
    },
    address: {
      type: String,
      maxlength: 255
    },
    age: {
      type: Number,
      min: 1,
      max: 100
    },
    phone: {
      type: String,
      minLength: 10,
      maxlength: 50
    }
  }, {
    collection: 'user',
  }); 
  
  const user = mongoose.model('user', userSchema);
  module.exports = user