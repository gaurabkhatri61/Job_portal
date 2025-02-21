const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, CompanyProfile } = require('../models');

const authController = {
    // Render login form
    renderLogin: (req, res) => {
        res.render('auth/login', {
            title: 'Login',
            user: null
        });
    },

    // Render registration form
    renderRegister: (req, res) => {
        res.render('auth/register', {
            title: 'Register',
            user: null
        });
    },

    // Register new user
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password, role } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !email || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/auth/register');
            }

            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                req.flash('error', 'Email already registered');
                return res.redirect('/auth/register');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role || 'jobseeker'
            });

            // Set user session
            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };

            req.flash('success', 'Registration successful! Welcome to Job Portal.');
            res.redirect('/');
        } catch (error) {
            console.error('Registration error:', error);
            req.flash('error', 'Error registering user');
            res.redirect('/auth/register');
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                req.flash('error', 'Email and password are required');
                return res.redirect('/auth/login');
            }

            // Find user with company profile
            const user = await User.findOne({ 
                where: { email },
                include: [{
                    model: CompanyProfile,
                    as: 'companyProfile',
                    attributes: ['id']
                }]
            });

            if (!user) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            // Set user session
            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                companyId: user.companyProfile ? user.companyProfile.id : null
            };

            req.flash('success', 'Login successful! Welcome back.');
            res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error', 'Error during login');
            res.redirect('/auth/login');
        }
    },

    // Logout user
    logout: (req, res) => {
        // Clear the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                req.flash('error', 'Error during logout');
                return res.redirect('/');
            }
            // Clear the session cookie
            res.clearCookie('connect.sid');
            res.redirect('/auth/login');
        });
    }
};

module.exports = authController;