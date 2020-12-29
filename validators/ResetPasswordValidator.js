const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const userService = require('../services/UserService')

validate = async (req, res, next) => {
    try {
        const token = req.params.token
        if(!token){
            return res.status(401).json({
                message: 'no token provided'
            })
        }

        try {
            var decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
            if(decodedToken.type !== 'resetPasswordToken'){
                return res.status(401).json({
                    message: 'invalid token'
                })
            }
        } catch (jwt_error) {
            return res.status(401).json({message: jwt_error.message});
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
                message: 'token expried'
            })
        }

        user.password = req.body.password
        const validatedErrors = user.validateSync()
        if(!!validatedErrors){
            const listError = {}
            Object.keys(validatedErrors.errors).forEach((key) => {
                listError[key] = validatedErrors.errors[key].message
            });
            return res.status(400).json({message: listError})
        }
        req.user = user
        next()
    } catch (error) {
        return res.status(404).json({message: error.message})
    }
}

module.exports = {
    validate
}