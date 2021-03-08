
updateDefaultAvatar = async (req, res) => {
    try {
        if(req.file){
            return res.status(200).json({message: 'uploaded default avatar successfully'})
        }
        res.status(400).json({message: 'avatar not found'})
    }catch (error) {
        res.status(404).json({message: error.message})
    }
}

module.exports = {
    updateDefaultAvatar
}