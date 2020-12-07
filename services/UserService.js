const userModel = require("../models/user");

findUserById = (id) => {
    return userModel.findById(id)
}

findOneUser = (req) => {
    return userModel.findOne({ username: req.body.username, password: req.body.password })
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

createdUser = (req) => {
    return userModel.create({
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        address: req.body.address
    })
}

findUserByIdAndUpdate = (req) => {
    return userModel.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username
        }
    },{new: true})
}

module.exports = {
    paginate: paginate,
    findUserById: findUserById,
    findOneUser: findOneUser,
    findUserByIdAndRemove: findUserByIdAndRemove,
    createdUser: createdUser,
    findUserByIdAndUpdate: findUserByIdAndUpdate
}