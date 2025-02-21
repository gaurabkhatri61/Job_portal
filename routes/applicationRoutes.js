const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

// Jobseeker routes

// View all my applications
router.get('/',
    auth,
    authorize('jobseeker'),
    applicationController.getMyApplications
);

// Show application form for a job
router.get('/jobs/:jobId/apply', 
    auth, 
    authorize('jobseeker'), 
    applicationController.showApplicationForm
);

// Submit application for a job
router.post('/jobs/:jobId/apply',
    auth,
    authorize('jobseeker'),
    applicationController.submitApplication
);

// Employer routes

// View applications for a specific job
router.get('/jobs/:jobId', 
    auth, 
    authorize('employer', 'admin'), 
    applicationController.getJobApplications
);

// Update application status
router.put('/status/:id', 
    auth, 
    authorize('employer', 'admin'), 
    applicationController.updateApplicationStatus
);

module.exports = router; 