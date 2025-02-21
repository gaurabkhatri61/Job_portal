const { Job, CompanyProfile, User } = require('../models');

const jobController = {
    // List all jobs
    async listJobs(req, res) {
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
    },

    // Get job by ID
    async getJobById(req, res) {
        try {
            const job = await Job.findByPk(req.params.id, {
                include: [{
                    model: CompanyProfile,
                    as: 'company',
                    attributes: ['companyName', 'description', 'location', 'website', 'logoUrl', 'userId', 'id']
                }]
            });

            if (!job) {
                req.flash('error', 'Job not found');
                return res.redirect('/jobs');
            }

            console.log('Current user:', req.session.user);
            console.log('Job data:', {
                id: job.id,
                companyProfileId: job.companyProfileId,
                company: {
                    id: job.company.id,
                    userId: job.company.userId
                }
            });
            
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
    },

    // Render create job form
    async renderCreateForm(req, res) {
        try {
            // Check if user has a company profile
            const company = await CompanyProfile.findOne({
                where: { userId: req.session.user.id }
            });

            if (!company) {
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
    },

    // Create new job
    async createJob(req, res) {
        try {
            const { title, description, requirements, type, location, salary } = req.body;

            // Validate required fields
            if (!title || !description || !requirements || !type || !location) {
                req.flash('error', 'Please fill in all required fields');
                return res.redirect('/jobs/create');
            }

            // Get user's company profile
            const company = await CompanyProfile.findOne({
                where: { userId: req.session.user.id }
            });

            if (!company) {
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

            req.flash('success', 'Job posted successfully');
            res.redirect(`/jobs/${job.id}`);
        } catch (error) {
            console.error('Error creating job:', error);
            req.flash('error', 'Error creating job');
            res.redirect('/jobs/create');
        }
    }
};

module.exports = jobController;