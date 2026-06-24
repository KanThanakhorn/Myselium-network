const Alert = require('../models/Alert');
const SensorNode = require('../models/SensorNode');

// Seed active and resolved alerts
const seedAlerts = [
  {
    alertId: 'ALT-1024',
    severity: 'critical',
    sourceNodeId: 'node-05',
    location: { lat: 18.8023, lng: 98.9502 },
    sensorType: 'smoke',
    value: 480,
    threshold: 400,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'active',
  },
  {
    alertId: 'ALT-1025',
    severity: 'warning',
    sourceNodeId: 'node-08',
    location: { lat: 18.8055, lng: 98.9540 },
    sensorType: 'temperature',
    value: 38.5,
    threshold: 35.0,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'active',
  },
  {
    alertId: 'ALT-1022',
    severity: 'info',
    sourceNodeId: 'node-03',
    location: { lat: 18.7991, lng: 98.9488 },
    sensorType: 'pm25',
    value: 120,
    threshold: 100,
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'resolved',
    acknowledgedAt: new Date(Date.now() - 55 * 60 * 1000),
    acknowledgedBy: 'ranger_somchai',
    responseDetails: {
      rangerId: 'ranger_somchai',
      actionTaken: 'Inspected area. Found small agricultural burning, advised farmer to extinguish. Area cleared.',
      resolvedAt: new Date(Date.now() - 50 * 60 * 1000),
    }
  }
];

const isConnected = () => require('mongoose').connection.readyState === 1;

// @desc    Get all active alerts
// @route   GET /api/alerts/active
// @access  Public
exports.getActiveAlerts = async (req, res, next) => {
  try {
    if (!isConnected()) {
      return res.status(200).json(seedAlerts.filter(a => a.status === 'active'));
    }
    let alerts = await Alert.find({ status: 'active' }).sort({ timestamp: -1 });
    if (alerts.length === 0 && (await Alert.countDocuments({})) === 0) {
      await Alert.insertMany(seedAlerts);
      alerts = await Alert.find({ status: 'active' }).sort({ timestamp: -1 });
    }
    res.status(200).json(alerts);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all historical (resolved) alerts
// @route   GET /api/alerts/history
// @access  Public
exports.getHistoricalAlerts = async (req, res, next) => {
  try {
    if (!isConnected()) {
      return res.status(200).json(seedAlerts.filter(a => a.status === 'resolved'));
    }
    const alerts = await Alert.find({ status: 'resolved' }).sort({ timestamp: -1 });
    res.status(200).json(alerts);
  } catch (err) {
    next(err);
  }
};

// @desc    Acknowledge an alert
// @route   POST /api/alerts/:alertId/acknowledge
// @access  Private (Admin/Ranger)
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { rangerId } = req.body;
    const io = req.app.get('io');

    if (!rangerId) {
      return res.status(400).json({ success: false, message: 'Please provide rangerId' });
    }

    const ackTime = new Date();
    let updatedAlert;

    if (!isConnected()) {
      const alert = seedAlerts.find(a => a.alertId === alertId);
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
      alert.acknowledgedAt = ackTime;
      alert.acknowledgedBy = rangerId;
      updatedAlert = alert;
    } else {
      updatedAlert = await Alert.findOneAndUpdate(
        { $or: [{ alertId }, { _id: alertId }] },
        { acknowledgedAt: ackTime, acknowledgedBy: rangerId },
        { new: true }
      );
      if (!updatedAlert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
    }

    // Broadcast update via socket to keep dashboards in sync
    if (io) {
      io.to('dashboard').emit('alert_updated', updatedAlert);
    }

    res.status(200).json({
      success: true,
      alert: updatedAlert,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve/Close an alert
// @route   POST /api/alerts/:alertId/resolve
// @access  Private (Admin/Ranger)
exports.resolveAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { rangerId, actionTaken } = req.body;
    const io = req.app.get('io');

    if (!rangerId || !actionTaken) {
      return res.status(400).json({ success: false, message: 'Please provide rangerId and actionTaken details' });
    }

    const resolvedTime = new Date();
    let updatedAlert;

    if (!isConnected()) {
      const alert = seedAlerts.find(a => a.alertId === alertId);
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
      
      alert.status = 'resolved';
      alert.acknowledgedAt = alert.acknowledgedAt || resolvedTime;
      alert.acknowledgedBy = alert.acknowledgedBy || rangerId;
      alert.responseDetails = {
        rangerId,
        actionTaken,
        resolvedAt: resolvedTime,
      };
      updatedAlert = alert;
    } else {
      updatedAlert = await Alert.findOne({ $or: [{ alertId }, { _id: alertId }] });
      if (!updatedAlert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }

      updatedAlert.status = 'resolved';
      updatedAlert.acknowledgedAt = updatedAlert.acknowledgedAt || resolvedTime;
      updatedAlert.acknowledgedBy = updatedAlert.acknowledgedBy || rangerId;
      updatedAlert.responseDetails = {
        rangerId,
        actionTaken,
        resolvedAt: resolvedTime,
      };

      await updatedAlert.save();
    }

    // Broadcast resolve event to client dashboards
    if (io) {
      io.to('dashboard').emit('alert_resolved', updatedAlert);
    }

    res.status(200).json({
      success: true,
      alert: updatedAlert,
    });
  } catch (err) {
    next(err);
  }
};

// Expose seedAlerts array for the simulator
exports.seedAlerts = seedAlerts;
