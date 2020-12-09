const userModel = require("../models/user");
const bcrypt = require('bcrypt');

findUserById = (id) => {
    return userModel.findById(id)
}

findOneUser = (req) => {
    return userModel.findOne({ email: req.body.email})
}

paginate = async (req) => {
    const paginate = {}
    const perPage = req.query.per_page || 5
    const page = req.query.page || 1
    const offset = perPage*page - perPage;
    const userQuery = userModel.find().skip(offset).limit(perPage)
    if(req.query.username){
        userQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.age){
        userQuery.where('age', req.query.age)    
    }
    if(req.query.address){
        userQuery.where('address', new RegExp(req.query.address, "i"))
    }

    const [users, totalUsers] = await Promise.all([userQuery.exec(), userModel.countDocuments().exec()])

    paginate.users = users
    paginate.total = totalUsers
    
    return paginate
}

findUserByIdAndRemove = (id) => {
    return userModel.findByIdAndRemove(id)
}

createdUser = async (req) => {
    const bcriptPassword = await bcrypt.hash(req.body.password, 10)
    return userModel.create({
        username: req.body.username,
        password: bcriptPassword,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        active: req.body.active
    })
}

updatedUser = (user) => {
    return user.save()
}

module.exports = {
    paginate,
    findUserById,
    findOneUser,
    findUserByIdAndRemove,
    createdUser,
    updatedUser
}