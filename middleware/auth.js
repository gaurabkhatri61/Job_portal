const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Authentication middleware
const auth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please login first');
        return res.redirect('/auth/login');
    }
    next();
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            req.flash('error', 'You are not authorized to access this page');
            return res.redirect('/');
        }
        next();
    };
};

// Legacy middleware for backward compatibility
const isAuthenticated = auth;
const isEmployer = (req, res, next) => authorize('employer')(req, res, next);

module.exports = { auth, authorize, isAuthenticated, isEmployer };