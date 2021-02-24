const chatService = require('../services/chatService')

const users = {}
const connect = (io) => {
    io.on('connection', (socket) => {
        socket.on('login', async (userId) => {
            if(userId){
                if(!users[userId]){
                    users[userId] = []
                }
                if(!users[userId].includes(socket.id)){
                    users[userId].push(socket.id)
                }
                io.emit('online', Object.keys(users))
            }
        })
        socket.on('logout', async (userId, fn) => {
            if(userId && users[userId]){
                let socketInArray = users[userId].indexOf(socket.id)
                if(socketInArray > -1){
                    users[userId].splice(socketInArray, 1)
                    if(!users[userId].length){
                        delete users[userId]
                        io.emit('offline', Object.keys(users))
                    }
                    fn(true)
                }
            }
        })
        socket.on('chat', async (object) => {
            const sender = users[object.sender]
            const receiver = users[object.receiver]
            const message = object.message
            const type = object.type
            if(receiver && sender && message){
                for(let i = 0; i < receiver.length; i++){
                    socket.broadcast.to(receiver[i]).emit('chat', {sender: object.sender, receiver: object.receiver, message: message, message_type: type})
                }
            }
            chatService.createdChat({sender: object.sender, receiver: object.receiver, message: message, type: type})
        })
        socket.on('disconnect', async () => {
            for (const id in users) {
                let socketInArray = users[id].indexOf(socket.id)
                if(socketInArray > -1){
                    users[id].splice(socketInArray, 1)
                    if(!users[id].length){
                        delete users[id]
                        io.emit('offline', Object.keys(users))
                    }
                }
            }
        })
      
    })
}

module.exports = {
    connect
}