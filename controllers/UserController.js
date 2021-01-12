const userService = require('../services/UserService')

login = async (req, res) => {
    try {
        // update lại thời gian hoạt động của token, refresh_token khi người dùng đăng nhập
        const updatedUser = await userService.updateRefreshToken(req)
        res.status(200).json({
            message: 'login success',
            user: updatedUser,
            token: req.token,
            refreshToken: req.refreshToken
        })  
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

logout = async (req, res) => {
    // token hết hạn lưu ở redis
    try {
        res.status(200).json({
            message: 'deleted token success',
            token: req.token
        })
    } catch (error) {
        res.status(404).json({message: error.message});
    }  
}

refresh = async (req, res) => {
    // refresh_token 
    try {
        const updatedUser = await userService.updateRefreshToken(req)
        res.status(200).json({
            message: 'refresh token success',
            user: updatedUser,
            token: req.token,
            refreshToken: req.refreshToken
        })
    } catch (error) {
        res.status(404).json({message: error.message});
    }   
}

paginate = async (req, res) => {
    try {
        const paginate = await userService.paginate(req)
        res.status(200).json({message: 'success', users: paginate.users, total: paginate.total, page_size: paginate.pageSize, page: paginate.page})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

show = async (req, res) => {
    try {
        const user = await userService.findUserById(req)
        if(!user){
            return res.status(400).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', user: user})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

destroy = async (req, res) => {
    try {
        const removedUser = await userService.findUserByIdAndRemove(req.params.id)
        if(!removedUser){
            return res.status(400).json({message: 'user not found'})
        }
        res.status(200).json({message: 'success', user: removedUser})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

create = async (req, res) => {
    try {
        const createdUser = await userService.createdUser(req)
        res.status(200).json({message: 'success', user: createdUser})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

update = async (req, res) => {
    try{
        const updatedUser = await userService.updatedUser(req)
        res.status(200).json({message: 'success', user: updatedUser})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

sendMail = async (req, res) => {
    // gửi url vào mail cho người dùng nếu quên mật khẩu
    try {
        await userService.sendMail(req)
        res.status(200).json({message: 'Please check your email to reset password'})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

resetPassword = async (req, res) => {
    // cập nhật lại mật khẩu mới cho người dùng
    try {
        await userService.resetPassword(req)
        res.status(200).json({message: 'reset password success'})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    login,
    logout,
    refresh,
    paginate,
    show,
    destroy,
    create,
    update,
    sendMail,
    resetPassword,
    updateRefreshToken
}