const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

checkToken = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            return res.status(401).json({
                message: 'no token provide through header'
            })
        }
        const token = req.headers.authorization.trim().split(" ")[1]
        const decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        if (Date.now() >= decodeToken.exp * 1000) {
            return res.status(401).json({
                message: 'token expried'
            })
          }
        const user = await userModel.findById(decodeToken.id)
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }
        if(!user.active){
            return res.status(401).json({
                message: 'user not active'
            })
        }
        req.user = decodeToken
        next()
    } catch (error) {
        if(error.message === 'invalid token'){
            return res.status(401).json({
                message: error.message
            })
        }
        return res.status(404).json({
            message: error.message
        })
    }
}

module.exports = {
    checkToken
}