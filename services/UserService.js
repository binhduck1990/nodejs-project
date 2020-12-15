const userModel = require('../models/user');
const businessModel = require('../models/business')
const bcrypt = require('bcrypt');

findUserById = async (req) => {
    const user = userModel.findById(req.params.id)
    const loadBusiness = req.query.load_business
    if(loadBusiness === 'true'){
        user.populate('business')
    }
    return user.exec()
}

findOneUser = async (req) => {
    return userModel.findOne({ email: req.body.email})
}

getRelation = async (users, idsUser) => {
    const business = await businessModel.find().where('user').in(idsUser).exec()
    return users.map(user => {
        const listBusiness = []
        for (let i = business.length - 1; i >= 0; i--) {
            if(user._id.equals(business[i].user)){
                listBusiness.push(business[i])
                business.splice(i, 1)
            }
        }
        user.business = listBusiness
    }); 
}

paginate = async (req) => {
    const paginate = {}

    const perPage = parseInt(req.query.per_page) || 20
    const page = parseInt(req.query.page) || 1
    const offset = perPage*page - perPage;

    const userQuery = userModel.find().skip(offset).limit(perPage)
    const totalUserQuery = userModel.countDocuments()

    const loadBusiness = req.query.load_business

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

    const usersProgess = userQuery.exec()
    const totalProgess = totalUserQuery.exec()

    const users = await usersProgess
    const total = await totalProgess

    const idsUser = []
    users.forEach(user => {
        idsUser.push(user._id)
    });

    if(loadBusiness === 'true' && idsUser.length){
        await getRelation(users, idsUser)  
    }

    paginate.users = users
    paginate.total = total
    
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