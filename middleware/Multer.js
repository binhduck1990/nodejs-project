var multer = require('multer')
var path = require('path')

// upload Image profile
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        console.log('4', req.file)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = file.originalname.split('.')[0]
        const fileExtension = path.extname(file.originalname)
        cb(null, fileName + '-' + uniqueSuffix + `.${fileExtension}`)
    }
  })
  
const uploadAvatar = (req, res, next) => {
    console.log('1', req.file)
    const upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            console.log('3', req.file)
            const ext = path.extname(file.originalname)
            if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return cb(new Error('Only images are allowed'))
            }
            cb(null, true)
        },
        limits:{
            fileSize: 1024 * 1024 * 2
        }
    }).single('avatar')
    console.log('upload', upload, req.body)
    upload(req, res, function (error) {
        if(error){
            return res.status(400).json({message: error.message})
        }
        console.log('2', req.file)
        next()
    })
}
module.exports = {
    uploadAvatar
}