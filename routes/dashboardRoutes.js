const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { Job, Application, User, CompanyProfile } = require('../models');

// Employer dashboard route
router.get('/employer', auth, authorize('employer'), async (req, res) => {
    try {
        const companyProfile = await CompanyProfile.findOne({
            where: { userId: req.user.id }
        });

        // If no company profile exists, store the intended URL and redirect to company creation
        if (!companyProfile) {
            req.session.returnTo = '/dashboard/employer';
            req.flash('info', 'Please create your company profile first');
            return res.redirect('/companies/create');
        }

        // Fetch jobs and applications for the employer's company
        const jobs = await Job.findAll({
            where: { companyProfileId: companyProfile.id },
            include: [{
                model: Application,
                include: [{
                    model: User,
                    attributes: ['firstName', 'lastName', 'email']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        const recentApplications = await Application.findAll({
            include: [
                {
                    model: User,
                    attributes: ['firstName', 'lastName', 'email']
                },
                {
                    model: Job,
                    where: { companyProfileId: companyProfile.id },
                    include: [{
                        model: CompanyProfile,
                        attributes: ['companyName']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.render('dashboard/employer', {
            title: 'Employer Dashboard',
            user: req.user,
            company: companyProfile,
            jobs: jobs,
            recentApplications: recentApplications
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', {
            message: 'Error loading dashboard',
            user: req.user
        });
    }
});

// Job seeker dashboard route
router.get('/jobseeker', auth, authorize('jobseeker'), async (req, res) => {
    try {
        const applications = await Application.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Job,
                include: [{
                    model: CompanyProfile,
                    attributes: ['companyName']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render('dashboard/jobseeker', {
            title: 'Job Seeker Dashboard',
            user: req.user,
            applications: applications
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', {
            message: 'Error loading dashboard',
            user: req.user
        });
    }
});

// Generic dashboard route that redirects based on user role
router.get('/', auth, (req, res) => {
    if (req.user.role === 'employer') {
        res.redirect('/dashboard/employer');
    } else if (req.user.role === 'jobseeker') {
        res.redirect('/dashboard/jobseeker');
    } else {
        res.status(403).render('error', {
            message: 'Invalid user role',
            user: req.user
        });
    }
});

module.exports = router; 