const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
    resumes: 'public/uploads/resumes',
    logos: 'public/uploads/company-logos'
};

Object.values(uploadDirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Choose directory based on file type
        const dir = file.fieldname === 'resume' ? uploadDirs.resumes : uploadDirs.logos;
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            // For resumes, only allow PDFs
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only PDF files are allowed for resumes!'), false);
            }
        } else if (file.fieldname === 'logo') {
            // For logos, allow common image formats
            const allowedTypes = /jpeg|jpg|png/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            
            if (mimetype && extname) {
                cb(null, true);
            } else {
                cb(new Error('Only images (jpeg, jpg, png) are allowed for logos!'), false);
            }
        } else {
            cb(new Error('Invalid field name'), false);
        }
    }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).render('companies/create', {
            title: 'Create Company Profile',
            user: req.session.user,
            messages: [{ type: 'danger', text: 'File upload error: ' + err.message }]
        });
    }
    next(err);
};

// Helper function to delete file
const deleteFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

module.exports = {
    upload,
    handleUploadError,
    deleteFile
};