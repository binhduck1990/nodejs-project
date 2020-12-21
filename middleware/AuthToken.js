const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const redis = require("redis");
const client = redis.createClient({ detect_buffers: true });

checkToken = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            return res.status(401).json({
                message: 'no token provide through header'
            })
        }
        const token = req.headers.authorization.trim().split(" ")[1]
        const decodeToken = await jwt.verify(token, process.env.SECRET_KEY)
        if(decodeToken.type !== 'token'){
            return res.status(401).json({
                message: 'invalid token'
            })
        }
        const user = await userModel.findById(decodeToken.id)
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }
        client.lrange("tokenDelete", 0, -1, function(get_token_err, value){
            try {
                if(get_token_err){
                    throw get_token_err
                }
                const listTokenDelete = value
                if(listTokenDelete.includes(token)){
                    return res.status(200).json({
                        message: 'token has been deleted'
                    })
                }
            } catch (get_token_err) {
                return res.status(401).json({
                    message: get_token_err.message
                })
            }
            next()
        })
    } catch (error) {
        if(error.message === 'invalid token'){
            return res.status(401).json({
                message: error.message
            })
        }

        if(error.message === 'invalid signature'){
            return res.status(401).json({
                message: 'invalid secret key'
            })
        }

        if(error.message === 'jwt expired'){
            try {
                const refreshToken = req.headers.authorization.trim().split(" ")[2]
                if(!refreshToken){
                    res.status(404).json({
                        message: 'jwt expired'
                    })
                }
                const decodeRefreshToken = await jwt.verify(refreshToken, process.env.SECRET_KEY)
                const user = await userModel.findOne({_id: decodeRefreshToken.id, refresh_token: refreshToken})
                if(!user){
                    return res.status(401).json({
                        message: 'refresh_token not found'
                    })
                }
                const tokenRun = new Promise((resolve, reject) => {
                    jwt.sign({ id: user._id, type: 'token' }, process.env.SECRET_KEY, {expiresIn: "2 days"}, function(err, token){
                        if(!err){
                            resolve(token)
                        }
                        reject(err)
                    })
                })
                const refreshTokenRun = new Promise((resolve, reject) => {
                    jwt.sign({ id: user._id, type: 'refreshToken' }, process.env.SECRET_KEY, {expiresIn: "30 days"}, function(err, token){
                        if(!err){
                            resolve(token)
                        }
                        reject(err)
                    })
                })
    
                const [newToken, newRefreshToken] = await Promise.all([tokenRun, refreshTokenRun])
                user.refresh_token = newRefreshToken
                await user.save()
                res.token = newToken
                res.refresh_token = newRefreshToken
                return next()
            } catch (refresh_token_error) {
                return res.status(404).json({
                    message: refresh_token_error.message
                })
            }
        }
            
        res.status(404).json({
                message: error.message
            })
    }
}

module.exports = {
    checkToken
}