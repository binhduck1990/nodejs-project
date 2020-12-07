const userModel = require('../models/user')

validate = (req) => {
    const listError = {}
    const user = new userModel({
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        address: req.body.address
    })

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