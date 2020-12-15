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
      },
      default: ''
    },
    address: {
      type: String,
      maxlength: 255,
      default: ''
    },
    age: {
      type: Number,
      min: 1,
      max: 100,
      default: null
    },
    phone: {
      type: String,
      maxlength: 50,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    },
    business: [{}]
  }, {
    collection: 'user',
  }); 
  
  const user = mongoose.model('user', userSchema);
  module.exports = user