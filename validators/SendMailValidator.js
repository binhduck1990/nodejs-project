const userService = require('../services/UserService')

validate = async (req, res, next) => {
    try {
        const user = await userService.findUserByEmail(req)
        if(!user){
            return res.status(400).json({message: "email not found"})
        }
        try {
            var generatedResetPasswordToken = await userService.generateResetPasswordToken(user)
        } catch (jwt_error) {
            res.status(401).json({message: error.message});
        }
        user.reset_password_token = generatedResetPasswordToken.resetPasswordToken
        req.user = user
        next()
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    validate
}