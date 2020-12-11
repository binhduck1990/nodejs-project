const userModel = require("../models/user");
const bcrypt = require('bcrypt');

findUserById = async (id) => {
    return userModel.findById(id).populate('business')
}

findOneUser = async (req) => {
    return userModel.findOne({ email: req.body.email})
}

paginate = async (req) => {
    const paginate = {}
    const perPage = parseInt(req.query.per_page) || 20
    const page = parseInt(req.query.page) || 1
    const offset = perPage*page - perPage;
    const userQuery = userModel.find().skip(offset).limit(perPage)
    const totalUserQuery = userModel.countDocuments()
    if(req.query.username){
        userQuery.where('username', new RegExp(req.query.username, "i"))
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.age){
        userQuery.where('age', req.query.age)    
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.address){
        userQuery.where('address', new RegExp(req.query.address, "i"))
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }

    userQuery.populate({
        path: 'business'
    })

    const users = userQuery.exec()
    const totalUsers = totalUserQuery.exec()

    paginate.users = await users
    paginate.total = await totalUsers
    
    return paginate
}

findUserByIdAndRemove = async (id) => {
    return userModel.findByIdAndRemove(id)
}

createdUser = async (req) => {
    const bcriptPassword = await bcrypt.hash(req.body.password, 10)
    const createdUser = await userModel.create({
        username: req.body.username,
        password: bcriptPassword,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        active: req.body.active,
        business: req.body.business_id
    })
    return createdUser.populate('business').execPopulate()
}

updatedUser = async (user) => {
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