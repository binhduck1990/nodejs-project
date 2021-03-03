const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const { check, validationResult } = require('express-validator');

resetPassword = async (req, res, next) => {
    try {
        const token = req.params.token

        if(!token){
            return res.status(401).json({
                message: 'url invalid'
            })
        }
        
        try {
            var decodedToken = await jwt.verify(token, process.env.SECRET_KEY)
            if(decodedToken.type !== 'resetPasswordToken'){
                return res.status(401).json({
                    message: 'url invalid'
                })
            }
        } catch (jwt_error) {
            return res.status(401).json({message: 'url invalid'});
        }

        const user = await userModel.findById(decodedToken.id).select('+password +reset_password_token')
        if(!user){
            return res.status(401).json({
                message: 'user not found'
            })
        }

        if(user.reset_password_token !== token){
            return res.status(401).json({
                message: 'url invalid'
            })
        }

        await check('password')
        .isLength({ min: 8 }).withMessage('password min 8 characters').bail()
        .isLength({ max: 50 }).withMessage('password max 50 characters').run(req)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        req.user = user
        return next()
    } catch (error) {
        return res.status(404).json({message: error.message})
    }
}

module.exports = {
    resetPassword
}