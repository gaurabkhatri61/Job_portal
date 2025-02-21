const express = require('express');
const router = express.Router();

// In your login route
router.post('/login', async (req, res) => {
  try {
    // ... authentication logic ...
    
    // Set user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
      // ... other user data you want to store in session
    };
    
    res.json({ success: true });
  } catch (error) {
    // ... error handling ...
  }
});

module.exports = router; 