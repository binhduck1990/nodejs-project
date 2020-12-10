const mongoose = require('mongoose')
const Schema = mongoose.Schema

const businessSchema = new Schema({
    name: {
      type: String,
      required: true,
      minLength: 1,
      maxlength: 10
    },
    active: {
      type: Boolean
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  }, {
    collection: 'business',
  }); 
  
  const business = mongoose.model('business', businessSchema);
  module.exports = business