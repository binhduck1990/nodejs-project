const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
      type: String
    },
    password: {
      type: String
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
    refresh_token: {
      type: String,
      default: ''
    },
    reset_password_token: {
      type: String,
      default: ''
    },
    business: [{
      type: Schema.Types.ObjectId,
      ref: 'business'
    }],
    role: {
      type: String,
      default: 'user'
    }
  }, 
  {collection: 'user', timestamps: true}
  ); 
  
  const user = mongoose.model('user', userSchema);
  module.exports = user