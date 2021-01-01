const generatedTokenHelper = require('../helpers/GenrateToken')
const userModel = require('../models/user')

sendMail = async (req, res, next) => {
    try {
        const user = await userModel.findOne({email: req.body.email})
        if(!user){
            return res.status(400).json({message: "email not found"})
        }
        try {
            var resetPasswordToken = await generatedTokenHelper.generateResetPasswordToken(user)
        } catch (jwt_error) {
            res.status(401).json({message: error.message});
        }
        user.reset_password_token = resetPasswordToken
        req.user = user
        next()
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    sendMail
}