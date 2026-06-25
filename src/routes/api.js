const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const nodeController = require('../controllers/nodeController');
const alertController = require('../controllers/alertController');
const systemController = require('../controllers/systemController');

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

// --- Authentication Routes ---
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// --- Sensor Node Routes ---
router.get('/nodes', nodeController.getNodes);
router.get('/nodes/:nodeId', nodeController.getNode);
router.post('/nodes/:nodeId/recalibrate', protect, nodeController.recalibrateNode);
router.patch('/nodes/:nodeId/status', protect, nodeController.updateNodeStatus);
router.post('/nodes/:nodeId/telemetry', nodeController.receiveTelemetry);

// --- Alert System Routes ---
router.get('/alerts/active', alertController.getActiveAlerts);
router.get('/alerts/history', alertController.getHistoricalAlerts);
router.post('/alerts/:alertId/acknowledge', protect, alertController.acknowledgeAlert);
router.post('/alerts/:alertId/resolve', protect, alertController.resolveAlert);

// --- System Metrics / Health Routes ---
router.get('/system/health', systemController.getSystemHealth);
router.get('/system/routes', systemController.getSystemRoutes);

module.exports = router;
