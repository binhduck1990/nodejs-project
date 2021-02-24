const chatModel = require('../models/chat')

createdChat = async (req) => {
    const chat = new chatModel({
        message: req.message,
        receiver: req.receiver,
        sender: req.sender
    })
    return chat.save()
}

index = async (req) => {
    const chats = await chatModel.find({ $or: [ { sender: req.query.sender, receiver: req.query.receiver }, { sender: req.query.receiver, receiver: req.query.sender } ] } )
    return chats
}

module.exports = {
    createdChat,
    index
}