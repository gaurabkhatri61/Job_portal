const express = require('express');
const router = express.Router();
const { isAuthenticated, isEmployer } = require('../middleware/auth');
const models = require('../models');
const Job = models.Job;
const CompanyProfile = models.CompanyProfile;
const Application = models.Application;

// List all jobs
router.get('/', async (req, res) => {
    console.log('GET /jobs - List all jobs');
    console.log('User:', req.session.user);
    
    try {
        const jobs = await Job.findAll({
            include: [{
                model: CompanyProfile,
                as: 'company',
                attributes: ['companyName', 'location']
            }],
            where: { status: 'open' },
            order: [['createdAt', 'DESC']]
        });

        console.log('Found jobs:', jobs.length);
        
        res.render('jobs/list', {
            title: 'Available Jobs',
            user: req.session.user,
            jobs
        });
    } catch (error) {
        console.error('Error listing jobs:', error);
        req.flash('error', 'Error loading jobs');
        res.redirect('/');
    }
});

// Show job creation form
router.get('/create', isAuthenticated, isEmployer, async (req, res) => {
    console.log('GET /jobs/create - Show create form');
    console.log('User:', req.session.user);
    
    try {
        // Check if user has a company profile
        const company = await CompanyProfile.findOne({
            where: { userId: req.session.user.id }
        });

        console.log('Company found:', company ? 'Yes' : 'No');

        if (!company) {
            console.log('No company profile found, redirecting to create company');
            req.flash('error', 'Please create a company profile first');
            return res.redirect('/companies/create');
        }

        res.render('jobs/create', {
            title: 'Post a New Job',
            user: req.session.user,
            company
        });
    } catch (error) {
        console.error('Error rendering create form:', error);
        req.flash('error', 'Error loading create job form');
        res.redirect('/jobs');
    }
});

// Create new job
router.post('/', isAuthenticated, isEmployer, async (req, res) => {
    console.log('POST /jobs - Create new job');
    console.log('User:', req.session.user);
    console.log('Request body:', req.body);
    
    try {
        const { title, description, requirements, type, location, salary } = req.body;

        // Validate required fields
        if (!title || !description || !requirements || !type || !location) {
            console.log('Missing required fields');
            req.flash('error', 'Please fill in all required fields');
            return res.redirect('/jobs/create');
        }

        // Get user's company profile
        const company = await CompanyProfile.findOne({
            where: { userId: req.session.user.id }
        });

        console.log('Company found:', company ? 'Yes' : 'No');

        if (!company) {
            console.log('No company profile found, redirecting to create company');
            req.flash('error', 'Please create a company profile first');
            return res.redirect('/companies/create');
        }

        // Create job
        const job = await Job.create({
            title,
            description,
            requirements,
            type,
            location,
            salary: salary || null,
            status: 'open',
            companyProfileId: company.id
        });

        console.log('Job created:', job.id);

        req.flash('success', 'Job posted successfully');
        res.redirect(`/jobs/${job.id}`);
    } catch (error) {
        console.error('Error creating job:', error);
        req.flash('error', 'Error creating job');
        res.redirect('/jobs/create');
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    console.log('GET /jobs/:id - Get job details');
    console.log('Job ID:', req.params.id);
    
    try {
        const job = await Job.findByPk(req.params.id, {
            include: [{
                model: CompanyProfile,
                as: 'company',
                attributes: ['companyName', 'description', 'location', 'website', 'logoUrl']
            }]
        });

        console.log('Job found:', job ? 'Yes' : 'No');

        if (!job) {
            console.log('Job not found');
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }

        res.render('jobs/show', {
            title: job.title,
            user: req.session.user,
            job
        });
    } catch (error) {
        console.error('Error getting job:', error);
        req.flash('error', 'Error loading job details');
        res.redirect('/jobs');
    }
});

// Delete job
router.delete('/:id', isAuthenticated, isEmployer, async (req, res) => {
    console.log('DELETE /jobs/:id - Delete job');
    console.log('Job ID:', req.params.id);
    
    try {
        const job = await Job.findByPk(req.params.id);
        
        if (!job) {
            console.log('Job not found');
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }

        // Check if the user owns this job
        const company = await CompanyProfile.findOne({
            where: { userId: req.session.user.id }
        });

        console.log('Company found:', company ? 'Yes' : 'No');
        console.log('Job companyProfileId:', job.companyProfileId);
        console.log('User company id:', company ? company.id : 'N/A');

        if (!company || job.companyProfileId !== company.id) {
            console.log('User not authorized to delete job');
            req.flash('error', 'You are not authorized to delete this job');
            return res.redirect('/jobs');
        }

        await job.destroy();
        console.log('Job deleted successfully');
        
        req.flash('success', 'Job deleted successfully');
        res.redirect('/jobs');
    } catch (error) {
        console.error('Error deleting job:', error);
        req.flash('error', 'Error deleting job');
        res.redirect('/jobs');
    }
});

// Show job application form
router.get('/:id/apply', isAuthenticated, async (req, res) => {
    try {
        const jobId = req.params.id;

        // Find the job with company details
        const job = await Job.findOne({
            where: { id: jobId },
            include: [{
                model: CompanyProfile,
                as: 'company',
                attributes: ['companyName', 'logoUrl']
            }]
        });

        if (!job) {
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }

        res.render('applications/apply', {
            title: 'Apply for Job',
            job: job
        });
    } catch (error) {
        console.error('Error showing application form:', error);
        req.flash('error', 'Error loading application form');
        res.redirect('/jobs');
    }
});

// Submit job application
router.post('/:id/apply', isAuthenticated, async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.session.user.id;
        const { coverLetter, resumeUrl } = req.body;

        // Validate required fields
        if (!coverLetter || !resumeUrl) {
            req.flash('error', 'Cover letter and resume URL are required');
            return res.redirect('/jobs/' + jobId + '/apply');
        }

        // Check if job exists and is open
        const job = await Job.findOne({
            where: { 
                id: jobId,
                status: 'open'
            }
        });

        if (!job) {
            req.flash('error', 'Job not found or no longer accepting applications');
            return res.redirect('/jobs/' + jobId);
        }

        // Check if user has already applied
        const existingApplication = await Application.findOne({
            where: {
                jobId: jobId,
                userId: userId
            }
        });

        if (existingApplication) {
            req.flash('error', 'You have already applied for this job');
            return res.redirect('/jobs/' + jobId);
        }

        // Create application
        await Application.create({
            jobId: jobId,
            userId: userId,
            status: 'pending',
            coverLetter: coverLetter,
            resumeUrl: resumeUrl
        });

        req.flash('success', 'Application submitted successfully!');
        res.redirect('/jobs/' + jobId);
    } catch (error) {
        console.error('Error applying for job:', error);
        req.flash('error', 'Error submitting application');
        res.redirect('/jobs/' + req.params.id + '/apply');
    }
});

module.exports = router;