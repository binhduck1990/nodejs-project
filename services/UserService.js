const userModel = require('../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const moment = require('moment');

findUserById = async (req) => {
    const user = await userModel.findById(req.params.id)
    if(!user){
        return null
    }
    return user
}

paginate = async (req) => {
    const paginate = {}

    const pageSize = parseInt(req.query.page_size) || 10
    const page = parseInt(req.query.page) || 1
    const offset = pageSize*page - pageSize;

    const sortField = req.query.sort_field || 'createdAt'
    const sortBy = req.query.sort_by && req.query.sort_by.toLowerCase() == 'asc' ? 'asc' : 'desc'

    const query = {}

    if(req.query.username){
        query.username = new RegExp(req.query.username, "i")
    }
    if(req.query.email){
        query.email = new RegExp(req.query.email, "i")
    }
    if(req.query.age){
        query.age = parseInt(req.query.age)
    }
    if(req.query.address){
        query.address = new RegExp(req.query.address, "i")
    }
    if(req.query.phone){
        query.phone = req.query.phone
    }
    if(req.query.created_at){
        const startDay = new moment(req.query.created_at, 'DD-MM-YYYY').startOf('day').format()
        const endDay = new moment(req.query.created_at, 'DD-MM-YYYY').endOf('day').format()
        query.createdAt = {$gte: new Date(startDay), $lte: new Date(endDay)}
    }
 
    const totalProgess = userModel.aggregate().match(query).count('total')
    const usersProgess = userModel.aggregate()
    .lookup({from: 'chat', localField: '_id', foreignField: 'sender', as: 'messages' })
    .match(query)
    .sort({[sortField]: sortBy})
    .skip(offset)
    .limit(pageSize)
    .exec()

    const users = await usersProgess
    const [total] = await totalProgess

    paginate.users = users
    paginate.total = total.total
    paginate.page = page
    paginate.pageSize = pageSize
    
    return paginate
}

index = async (req) => {
    const users = await userModel.find().exec()
    return users
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
        email: req.body.email,
        gender: req.body.gender,
        birthday: req.body.birthday,
        hobbies: req.body.hobbies,
        avatar: req.file ? req.file.filename : 'default_avatar.jpeg'
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
    if('gender' in req.body){
        if(req.body.gender === 'male'){
            user.gender = req.body.gender
        }else if(req.body.gender === 'female'){
            user.gender = req.body.gender
        }else{
            user.gender = 'other'
        }  
    }
    if('birthday' in req.body){
        user.birthday = req.body.birthday
    }
    if('hobbies' in req.body){
        user.hobbies = req.body.hobbies
    }
    if(req.file){
        user.avatar = req.file.filename
    }else{
        if(req.body.default_avatar){
            user.avatar = 'default_avatar.jpeg'
        }
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
            type: 'OAuth2',
            user: 'binhduck1990@gmail.com',
            clientId: '882411294326-b01338tsk2p4i3hijnch1ih5p6hd6jq8.apps.googleusercontent.com',
            clientSecret: 'w0kqux61NhYVMHZnEDp7pmTY',
            refreshToken: '1//04NzAg_In9BUlCgYIARAAGAQSNwF-L9IrUBsYc9bAd61Yak9My0ANm8zwFpv6MGv0A8elhs6KMErJmy5KaHpmra2LAU4ge7yF5GE',
            accessToken: 'ya29.a0AfH6SMA_w3nrEGl8bnhcedGnyglKxy7od15vtjEk7MCgCOSvGMM8ePDV-PS0w8DMfsbL9KazljLugvk-FGDfApXtsiCqSeGHMmg6V72HmSH5x3jCNv0wwNgNlopV00zUIf3U-6nzTR8VZpcppVnFtx_uJpEG'
        }
      });   
      
      const mailOptions = {
        from: 'binhduck1990@gmail.com',
        to: updatedUser.email,
        subject: 'We heard that you lost your password. Sorry about that! But don’t worry! You can use the following link to reset your password:',
        text: `${process.env.REACT_DOMAIN}/reset-password/${updatedUser.reset_password_token}`
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
    user.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT))
    user.save()
}

module.exports = {
    index,
    paginate,
    findUserById,
    findUserByIdAndRemove,
    createdUser,
    updatedUser,
    updateRefreshToken,
    sendMail,
    resetPassword,
}