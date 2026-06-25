const SensorNode = require('../models/SensorNode');
const Alert = require('../models/Alert');
const { seedNodes } = require('./nodeController');
const { seedAlerts } = require('./alertController');

const isConnected = () => require('mongoose').connection.readyState === 1;

// @desc    Get system health and KPI metrics
// @route   GET /api/system/health
// @access  Public
exports.getSystemHealth = async (req, res, next) => {
  try {
    let activeNodeCount = 0;
    let deadNodeCount = 0;
    let avgBatteryPercent = 0;
    let criticalAlerts = 0;
    let warningAlerts = 0;
    let infoAlerts = 0;

    if (!isConnected()) {
      // Aggregate from seed data
      activeNodeCount = seedNodes.filter(n => n.status === 'active').length;
      deadNodeCount = seedNodes.filter(n => n.status === 'inactive').length;
      
      const activeNodes = seedNodes.filter(n => n.status === 'active');
      const batterySum = activeNodes.reduce((acc, node) => acc + node.battery, 0);
      avgBatteryPercent = activeNodes.length > 0 ? Math.round(batterySum / activeNodes.length) : 0;

      const activeAlerts = seedAlerts.filter(a => a.status === 'active');
      criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
      warningAlerts = activeAlerts.filter(a => a.severity === 'warning').length;
      infoAlerts = activeAlerts.filter(a => a.severity === 'info').length;
    } else {
      // Query MongoDB
      const nodes = await SensorNode.find({});
      activeNodeCount = nodes.filter(n => n.status === 'active').length;
      deadNodeCount = nodes.filter(n => n.status === 'inactive').length;

      const activeNodes = nodes.filter(n => n.status === 'active');
      const batterySum = activeNodes.reduce((acc, node) => acc + node.battery, 0);
      avgBatteryPercent = activeNodes.length > 0 ? Math.round(batterySum / activeNodes.length) : 0;

      const activeAlerts = await Alert.find({ status: 'active' });
      criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
      warningAlerts = activeAlerts.filter(a => a.severity === 'warning').length;
      infoAlerts = activeAlerts.filter(a => a.severity === 'info').length;
    }

    res.status(200).json({
      networkUptime: 99.7,
      packetLossRate: 0.3,
      avgLatencyMs: 245,
      activeNodeCount,
      deadNodeCount,
      avgBatteryPercent,
      estimatedNetworkLifetimeDays: avgBatteryPercent > 10 ? Math.ceil(avgBatteryPercent / 8) : 1,
      lastUpdate: new Date().toISOString(),
      alerts: {
        critical: criticalAlerts,
        warning: warningAlerts,
        info: infoAlerts
      },
      routing: {
        selfHealingEventsLast24h: 3,
        deliverySuccessRate: 98.5
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dynamic mycelium routing tables and active links
// @route   GET /api/system/routes
// @access  Public
exports.getSystemRoutes = async (req, res, next) => {
  try {
    const { calculateDynamicRoutes } = require('../algorithms/myceliumRouting');
    let nodes;
    if (!isConnected()) {
      nodes = seedNodes;
    } else {
      nodes = await SensorNode.find({});
    }

    const routingData = calculateDynamicRoutes(nodes);
    res.status(200).json(routingData);
  } catch (err) {
    next(err);
  }
};
