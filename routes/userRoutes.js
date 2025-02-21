const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Protected routes
router.get('/profile', 
  auth, 
  userController.getProfile
);

router.put('/profile', 
  auth, 
  userController.updateProfile
);

// Admin only routes
router.get('/', 
  auth, 
  authorize('admin'), 
  userController.getAllUsers
);

router.delete('/:id', 
  auth, 
  authorize('admin'), 
  userController.deleteUser
);

module.exports = router; 