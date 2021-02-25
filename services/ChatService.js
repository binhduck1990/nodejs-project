const chatModel = require('../models/chat')

createdChat = async (req) => {
    const chat = new chatModel({
        message: req.file ? req.file.filename : req.body.message,
        receiver: req.body.receiver ? req.body.receiver : req.receiver,
        sender: req.body.sender ? req.body.sender : req.sender,
        message_type: req.body.type ? req.body.type : req.type
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