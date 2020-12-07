const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: String,
    password: String,
    address: String
  }, {
    collection: 'user',
  });
  
  const user = mongoose.model('user', userSchema);
  module.exports = user