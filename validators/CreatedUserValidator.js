const userModel = require('../models/user')

validate = async (req) => {
    const listError = {}
    const user = new userModel({
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email
    })

    const findUserByEmail = await userModel.findOne({email: req.body.email})
    if(findUserByEmail){
        return {
            message: 'user exist'
        }
    }

    const err = user.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });
    }
    return listError
}

module.exports = {
    validate: validate
}