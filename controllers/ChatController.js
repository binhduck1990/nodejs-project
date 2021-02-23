const chatService = require('../services/ChatService')

create = async (req, res) => {
    try {
        const createdChat = await chatService.createdChat(req)
        res.status(200).json({message: 'created chat success', chat: createdChat})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    create
}