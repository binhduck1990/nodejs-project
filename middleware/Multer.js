var multer = require('multer')
var path = require('path')

// upload Image profile
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = file.originalname.split('.')[0]
        const fileExtension = path.extname(file.originalname)
        cb(null, fileName + '-' + uniqueSuffix + `.${fileExtension}`)
    }
  })

// upload default avatar
const storageDefaultAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, 'default_avatar.jpeg')
    }
  })
  
const uploadAvatar = (req, res, next) => {
    const upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
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
    upload(req, res, function (error) {
        if(error){
            return res.status(400).json({message: error.message})
        }
        next()
    })
}

const uploadDefaultAvatar = (req, res, next) => {
    const upload = multer({
        storage: storageDefaultAvatar,
        fileFilter: function (req, file, cb) {
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
    upload(req, res, function (error) {
        if(error){
            return res.status(400).json({message: error.message})
        }
        next()
    })
}

module.exports = {
    uploadAvatar,
    uploadDefaultAvatar
}