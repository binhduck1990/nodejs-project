const redis = require("redis");
const client = redis.createClient({ detect_buffers: true });

// lấy danh sách tất cả token bị xóa từ redis
getTokenFromRedis = async () => {
    return new Promise((resolve, reject) => {
        client.lrange("tokenDelete", 0, -1, function(error, value){
            if(!error){
                resolve(value)
            }
            reject(error)
        })
    })
}

// cập nhật token hết hạn vào 1 mảng trong redis nếu người dùng đăng xuất
setTokenToRedis = async (token) => {
    return new Promise((resolve, reject) => {
        client.lpush("tokenDelete", token , function(error, value){
            if(!error){
                resolve(value)
            }
            reject(error)
        })
    })
}

module.exports = {
    getTokenFromRedis, setTokenToRedis
}