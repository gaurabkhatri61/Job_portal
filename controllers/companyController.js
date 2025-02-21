const db = require('../models');
const { CompanyProfile, User, Job } = db;

const companyController = {
    // List all companies
    async listCompanies(req, res) {
        try {
            const companies = await CompanyProfile.findAll({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName']
                }]
            });

            res.render('company/list', {
                title: 'Companies',
                companies,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error listing companies:', error);
            req.flash('error', 'Error loading companies');
            res.redirect('/');
        }
    },

    // Get company by ID
    async getCompanyById(req, res) {
        try {
            const company = await CompanyProfile.findByPk(req.params.id, {
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'id']
                }, {
                    model: Job,
                    as: 'jobs'
                }]
            });

            if (!company) {
                req.flash('error', 'Company not found');
                return res.redirect('/companies');
            }

            // Check if the logged-in user is the owner of the company
            const isOwner = req.session.user && company.userId === req.session.user.id;

            // Make sure we pass the user object to locals
            res.locals.user = req.session.user;
            
            res.render('company/profile', {
                title: company.companyName,
                company,
                isOwner
            });
        } catch (error) {
            console.error('Error getting company:', error);
            // Make sure we pass the user object to locals
            res.locals.user = req.session.user;
            
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading company profile',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    // Render create company form
    async renderCreateForm(req, res) {
        try {
            // Check if user already has a company profile
            const existingProfile = await CompanyProfile.findOne({
                where: { userId: req.session.user.id }
            });

            if (existingProfile) {
                req.flash('error', 'You already have a company profile');
                return res.redirect('/companies');
            }

            res.render('company/create', {
                title: 'Register Company',
                user: req.session.user
            });
        } catch (error) {
            console.error('Error rendering create form:', error);
            req.flash('error', 'Error loading create company form');
            res.redirect('/companies');
        }
    },

    

    // Create new company
    async createCompany(req, res) {
        try {
            const { companyName, industry, location, website, description } = req.body;

            // Validate required fields
            if (!companyName || !industry || !location || !description) {
                req.flash('error', 'Please fill in all required fields');
                return res.redirect('/companies/create');
            }

            // Check if user already has a company profile
            const existingProfile = await CompanyProfile.findOne({
                where: { userId: req.session.user.id }
            });

            if (existingProfile) {
                req.flash('error', 'You already have a company profile');
                return res.redirect('/companies');
            }

            // Create company profile
            const company = await CompanyProfile.create({
                companyName,
                industry,
                location,
                website,
                description,
                logoUrl: req.file ? `/uploads/company-logos/${req.file.filename}` : null,
                userId: req.session.user.id
            });

            req.flash('success', 'Company profile created successfully');
            res.redirect(`/companies/${company.id}`);
        } catch (error) {
            console.error('Error creating company:', error);
            req.flash('error', 'Error creating company profile');
            res.redirect('/companies/create');
        }
    }
};

module.exports = companyController;