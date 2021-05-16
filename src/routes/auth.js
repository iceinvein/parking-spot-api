const express = require('express');
const {
  register,
  login,
  logout,
  getCurrentUser,
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/currentUser', protect, getCurrentUser);
router.get('/logout', protect, logout);

module.exports = router;
