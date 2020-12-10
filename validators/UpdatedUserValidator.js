const userModel = require('../models/user')
const bcrypt = require('bcrypt')

validate = async(req) => {
    const listError = {}
    const checkEmailExist = await userModel.findOne({email: req.body.email, _id: {$ne: req.params.id}})
    if(checkEmailExist){
        return {
            email : 'email exist'
        }
    }
    const user = await userModel.findById(req.params.id)
    if(!user){
        return {
            user : 'user not found'
        }
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
    const err = user.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
        return listError
    }
    
    user.password = await bcrypt.hash(req.body.password, 10);
    return user
}

module.exports = {
    validate: validate
}