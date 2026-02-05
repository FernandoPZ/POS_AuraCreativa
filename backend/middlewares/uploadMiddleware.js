const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';
        if (file.fieldname === 'Logo') {
            uploadPath = path.join(__dirname, '../public/assets');
        } else {
            uploadPath = path.join(__dirname, '../public/uploads');
        }
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: Tipo de archivo no soportado. Solo se permiten imágenes (JPG, PNG, WEBP).'));
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;