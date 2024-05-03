const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Zum Überprüfen und Erstellen von Verzeichnissen

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');

        // Überprüfen, ob das Verzeichnis existiert, sonst erstellen
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Eindeutigen Namen für das Bild generieren
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const imageFilter = (req, file, cb) => {
    // Nur Bilder zulassen
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Nur Bilder sind erlaubt!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit für die Bildgröße auf 5MB setzen
});

module.exports = upload;
