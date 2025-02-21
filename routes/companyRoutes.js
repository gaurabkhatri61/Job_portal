const express = require('express');
const router = express.Router();
const { isAuthenticated, isEmployer } = require('../middleware/auth');
const { CompanyProfile } = require('../models');
const path = require('path');
const fs = require('fs');
const companyController = require('../controllers/companyController');
const { upload, handleUploadError } = require('../middleware/upload');

// Ensure upload directory exists
const uploadDir = 'public/uploads/company-logos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// List all companies (public route)
router.get('/', companyController.listCompanies);

// Show company creation form (requires auth and employer role)
router.get('/create', isAuthenticated, isEmployer, companyController.renderCreateForm);

// Get company details by ID (public route)
router.get('/:id', companyController.getCompanyById);

// Create new company (requires auth and employer role)
router.post('/', 
    isAuthenticated, 
    isEmployer,
    upload.single('logo'), 
    handleUploadError,
    companyController.createCompany
);

module.exports = router;