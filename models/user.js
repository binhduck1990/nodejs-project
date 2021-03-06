const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String
  },
  password: {
    type: String,
    select: false
  },
  email: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  age: {
    type: Number,
    default: null
  },
  phone: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: Boolean,
    default: false
  },
  refresh_token: {
    type: String,
    default: '',
    select: false
  },
  reset_password_token: {
    type: String,
    default: '',
    select: false
  },
  role: {
    type: String,
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    defallt: 'other'
  },
  birthday: {
    type: Date,
    defallt: ''
  },
  hobbies: {
    type: Array,
    defallt: []
  }
}, 
  {collection: 'user', timestamps: true}
  ); 
  
  const user = mongoose.model('user', userSchema);
  module.exports = user