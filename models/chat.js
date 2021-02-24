const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
  message: {
    type: String
  },
  sender: {
    type: Schema.Types.ObjectId,
  },
  receiver: {
    type: Schema.Types.ObjectId,
  },
  message_type: {
    type: String
  }
}, 
  {collection: 'chat', timestamps: true}
  ); 
  
  const chat = mongoose.model('chat', chatSchema);
  module.exports = chat