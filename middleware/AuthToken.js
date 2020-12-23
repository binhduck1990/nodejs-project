const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const userService = require('../services/UserService')

checkToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.trim().split(" ")[1] || req.body.token || req.query.token
        const refreshToken = req.headers.authorization.trim().split(" ")[2] || req.body.refresh_token || req.query.refresh_token
        if(!token){
            return res.status(401).json({
                message: 'no token provided'
            })
        }

        try {
            var decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
        } catch (decode_token_error) {
            // Xử lý lỗi khi giải mã token
            if(decode_token_error.message === 'jwt expired'){
                try {
                    if(!refreshToken){
                        return res.status(401).json({
                            message: 'token expired'
                        })
                    }
                    
                    try {
                        var decodedRefreshToken = await jwt.verify(refreshToken, process.env.SECRET_KEY)
                    } catch (decode_refresh_token_error) {
                        // Xử lý lỗi khi giải mã refresh_token
                        return res.status(401).json({
                            message: decode_refresh_token_error.message
                        })
                    }
                    
                    // Tìm user hợp lệ theo id và refresh_token
                    const user = await userModel.findOne({_id: decodedRefreshToken.id, refresh_token: refreshToken})
                    if(!user){
                        return res.status(401).json({
                            message: 'refresh_token not found'
                        })
                    }
                    
                    try {
                        var generatedToken = await userService.generateToken(user)
                    } catch (generate_token_error) {
                        // Xử lý lỗi khi tạo mới token, refresh_token
                        return res.status(401).json({
                            message: generate_token_error.message
                        })
                    }
                    
                    res.token = generatedToken.token
                    res.refresh_token = generatedToken.refreshToken
                    res.user = user
                    return next()
                } catch (error) {
                    // Xử lý lỗi server
                    return res.status(404).json({
                        message: error.message
                    })
                }
            }
            // Nếu giải mã token lỗi các TH khác thì cảnh báo
            return res.status(401).json({
                message: decode_token_error.message
            })
        }

        // Nếu token hợp lệ thì kiểm tra tiếp các thông tin khác trong token
        if(decodedToken && decodedToken.type !== 'token'){
            return res.status(401).json({
                message: 'invalid token'
            })
        }

        const user = await userModel.findById(decodedToken.id)
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }

        const tokens = await userService.getTokenFromRedis()
        if(tokens.includes(token)){
            return res.status(401).json({
                message: 'token expired'
            })
        }
        // token hợp lệ
        res.user = user
        next() 
    } catch (error) {
        // Xử lý lỗi server
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
    checkToken
}