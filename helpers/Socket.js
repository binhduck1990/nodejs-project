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