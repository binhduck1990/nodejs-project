canManageUser = (req, res, next) => {
    try {
        const user = req.user
        const id = req.params.id
        if(user.role === 'admin' || user._id.equals(id)){
            return next()
        }
        return res.status(401).json({
            message: 'permission denied'
        })     
    } catch (error) {
        return res.status(404).json({
            message: error.message
        })  
    }
}

module.exports = {
    canManageUser
}