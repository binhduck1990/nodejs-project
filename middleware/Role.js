canManageUser = (req, res, next) => {
    const user = res.user
    const id = req.params.id
    if(user.role !== 'admin' || !user._id.equals(id)){
        return res.status(401).json({
            message: 'permission denied'
        })
    }
    next()
}

module.exports = {
    canManageUser
}