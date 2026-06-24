const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

// @desc    Health check and hello world endpoint
// @route   GET /api/health
// @access  Public
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Mycelium Sensors Network API is running',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// @desc    Test JWT middleware
// @route   GET /api/auth-test
// @access  Protected
router.get('/auth-test', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'You have accessed a protected route!',
    user: req.user,
  });
});

module.exports = router;
