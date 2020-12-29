const userModel = require('../models/user')
const bcrypt = require('bcrypt')

validate = async (req) => {
    const validator = {isError : true}
    const listError = {}
    const validatedUser = new userModel({
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        active: req.body.active,
        business: req.body.business,
        role: req.body.role
    })

    const err = validatedUser.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
        validator.listError = listError
        return validator
    }

    const user = await userModel.findOne({email: req.body.email})
    if(user){
        validator.listError = {user: 'user exist'}
        return validator
    }

    validator.isError = false
    validatedUser.password = await bcrypt.hash(validatedUser.password, parseInt(process.env.BCRYPT))
    validator.user = validatedUser
    return validator
}

module.exports = {
    validate: validate
}