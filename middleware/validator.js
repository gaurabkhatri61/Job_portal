const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidationRules = () => {
  return [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn(['jobseeker', 'employer'])
  ];
};

const jobValidationRules = () => {
  return [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Job title is required')
      .isLength({ max: 100 })
      .withMessage('Job title must be less than 100 characters'),
    
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Job description is required'),
    
    body('requirements')
      .trim()
      .notEmpty()
      .withMessage('Job requirements are required'),
    
    body('type')
      .trim()
      .notEmpty()
      .withMessage('Job type is required')
      .isIn(['full-time', 'part-time', 'contract', 'internship'])
      .withMessage('Invalid job type'),
    
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Job location is required'),
    
    body('salary')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
  ];
};

const applicationValidationRules = () => {
  return [
    body('coverLetter')
      .trim()
      .isLength({ min: 50, max: 5000 })
      .withMessage('Cover letter must be between 50 and 5000 characters'),
    body('resume').custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Resume file is required');
      }
      return true;
    })
  ];
};

module.exports = {
  validate,
  userValidationRules,
  jobValidationRules,
  applicationValidationRules
}; 