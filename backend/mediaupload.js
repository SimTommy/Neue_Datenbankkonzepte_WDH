const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, './public/uploads');
        console.log('Upload directory:', uploadDir); // Debugging statement

        if (!fs.existsSync(uploadDir)) {
            console.log('Creating upload directory');
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        console.log('Generated filename:', uniqueName); // Debugging statement
        cb(null, uniqueName);
    }
});

const mediaFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isAllowed = allowedTypes.includes(file.mimetype);

    if (isAllowed) {
        cb(null, true);
    } else {
        console.log('File type not allowed:', file.mimetype); // Debugging statement
        cb(new Error('Nur Bilder, Videos und Dokumente sind erlaubt!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: mediaFilter,
    limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = upload;
