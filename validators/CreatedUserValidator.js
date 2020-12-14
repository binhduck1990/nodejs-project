const business = require('../models/business')
const userModel = require('../models/user')

validate = async (req) => {
    const listError = {}
    const userValidate = new userModel({
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        active: req.body.active,
        business: req.body.business
    })

    const err = userValidate.validateSync()
    if(!!err){
        Object.keys(err.errors).forEach((key) => {
            listError[key] = err.errors[key].message
        });

        return listError
    }

    const user = await userModel.findOne({email: req.body.email})
    if(user){
        return { user: 'user exist' }
    }
}

module.exports = {
    validate: validate
}