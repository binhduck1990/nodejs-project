const chatModel = require('../models/chat')

createdChat = async (req) => {
    const chat = new chatModel({
        message : req.body.message,
        receiver: req.body.receiver,
        sender: req.body.sender
    })
    await chat.save()
}

module.exports = {
    createdChat
}