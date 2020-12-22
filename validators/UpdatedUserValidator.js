const userModel = require('../models/user')

validate = async(req) => {
    const validator = { isError : true }
    const listError = {}
    let user = await userModel.findOne({email: req.body.email, _id: {$ne: req.params.id}})
    if(user){
        validator.listError = {email : 'email exist'}
        return validator
    }
    user = await userModel.findById(req.params.id)
    if(!user){
        validator.listError = {user : 'user not found'}
        return validator
    }
    if('username' in req.body){
        user.username = req.body.username
    }
    if('password' in req.body){
        user.password = req.body.password
    }
    if('email' in req.body){
        user.email = req.body.email
    }
    if('address' in req.body){
        user.address = req.body.address
    }
    if('phone' in req.body){
        user.phone = req.body.phone
    }
    if('age' in req.body){
        user.age = req.body.age ? parseInt(req.body.age) : req.body.age
    }
    if('active' in req.body){
        user.active = Boolean(req.body.active)
    }
    const validatedUser = user.validateSync()
    if(!!validatedUser){
        Object.keys(validatedUser.errors).forEach((key) => {
            listError[key] = validatedUser.errors[key].message
        });
        validator.listError = listError
        return validator
    }
    validator.isError = false
    validator.user = user
    return validator
}

module.exports = {
    validate: validate
}