const userModel = require('../models/user');
const businessModel = require('../models/business')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')

findUserById = async (req) => {
    const user = await userModel.findById(req.params.id)
    if(!user){
        return null
    }
    const loadBusiness = req.query.load_business
    if(loadBusiness === 'true'){
        const business = await businessModel.find({user: user._id})
        user.business = business
    }
    return user
}

// lấy danh sách models quan hệ với model user
getRelations = async (users, relations) => {
    const idsUser = []
    users.forEach(user => {
        idsUser.push(user._id)
    });

    if(relations.includes('business')){
        var business = await businessModel.find().where('user').in(idsUser)
    }
    
    return users.map(user => {
        if(relations.includes('business')){
            const listBusiness = []
            for (let i = business.length - 1; i >= 0; i--) {
                if(user._id.equals(business[i].user)){
                    listBusiness.push(business[i])
                    business.splice(i, 1)
                }
            }
            user.business = listBusiness
        }
    }); 
}

paginate = async (req) => {
    const paginate = {}

    const perPage = parseInt(req.query.per_page) || 20
    const page = parseInt(req.query.page) || 1
    const offset = perPage*page - perPage;

    const sortField = req.query.sort_field || 'createdAt'
    const sortBy = req.query.sort_by && req.query.sort_by.toLowerCase() == 'asc' ? 'asc' : 'desc'

    const userQuery = userModel.find().sort({[sortField]: sortBy}).skip(offset).limit(perPage)
    const totalUserQuery = userModel.countDocuments()

    const loadBusiness = req.query.load_business

    if(req.query.username){
        userQuery.where('username', new RegExp(req.query.username, "i"))
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.email){
        userQuery.where('email', new RegExp(req.query.email, "i"))
        totalUserQuery.where('email', new RegExp(req.query.email, "i"))
    }
    if(req.query.age){
        userQuery.where('age', req.query.age)    
        totalUserQuery.where('username', new RegExp(req.query.username, "i"))
    }
    if(req.query.address){
        userQuery.where('address', new RegExp(req.query.address, "i"))
        totalUserQuery.where('username', new RegExp(req.query.address, "i"))
    }

    const usersProgess = userQuery.exec()
    const totalProgess = totalUserQuery.exec()

    const users = await usersProgess
    const total = await totalProgess

    if(users.length){
        const relations = []
        if(loadBusiness === 'true'){
            relations.push('business')
        }
        if(relations.length){
            await getRelations(users, relations)  
        } 
    }

    paginate.users = users
    paginate.total = total
    
    return paginate
}

findUserByIdAndRemove = async (id) => {
    return userModel.findByIdAndRemove(id)
}

createdUser = async (req) => {
    const password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT))
    const user = new userModel({
        username: req.body.username,
        password: password,
        age: req.body.age,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email
    })
    await user.save()
    return userModel.findById(user._id)
}

updatedUser = async (req) => {
    const user = req.updatedUser
    if('username' in req.body){
        user.username = req.body.username
    }
    if('password' in req.body){
        user.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT))
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
        user.age = req.body.age
    }
    if('active' in req.body){
        user.active = req.body.active
    }
    await user.save()
    return userModel.findById(user._id)
}

updateRefreshToken = async (req) => {
    const user = req.updatedUser
    await user.save()
    return userModel.findById(user._id)
}

// Gửi reset_token_password vào mail của user nào quên mật khẩu
sendMail = async (req) => {
    const user = req.user
    // lưu token reset password vào database
    const updatedUser = await user.save()
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'binhduck2000@gmail.com',
          pass: 'P@ssword1990'
        }
      });
      
      const mailOptions = {
        from: 'binhduck2000@gmail.com',
        to: updatedUser.email,
        subject: 'We heard that you lost your password. Sorry about that! But don’t worry! You can use the following link to reset your password:',
        text: `http://localhost:4000/api/user/reset-password/${updatedUser.reset_password_token}`
      };
      
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info){
            if(!error){
                resolve(info)
            }
            reject(error)
          });
      })
}

// Cập nhật lại mật khẩu sau khi reset
resetPassword = async (req) => {
    const user = req.user
    user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT))
    user.save()
}

module.exports = {
    paginate,
    findUserById,
    findUserByIdAndRemove,
    createdUser,
    updatedUser,
    updateRefreshToken,
    sendMail,
    resetPassword
}