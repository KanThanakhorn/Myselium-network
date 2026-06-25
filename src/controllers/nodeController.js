const SensorNode = require('../models/SensorNode');
const { calculateDynamicRoutes } = require('../algorithms/myceliumRouting');

// Seed nodes for database/fallback
const seedNodes = [
  {
    nodeId: 'node-01',
    location: { lat: 18.8021, lng: 98.9215 },
    status: 'active',
    battery: 89,
    rssi: -45,
    lqi: 240,
    sensors: { temp: 28.4, humidity: 62.1, smoke: 85, pm25: 18 },
    metadata: { deployedDate: '2026-01-10', location_name: 'Doi Suthep Peak Station' }
  },
  {
    nodeId: 'node-02',
    location: { lat: 18.8054, lng: 98.9262 },
    status: 'active',
    battery: 74,
    rssi: -58,
    lqi: 210,
    sensors: { temp: 29.1, humidity: 59.8, smoke: 110, pm25: 22 },
    metadata: { deployedDate: '2026-01-12', location_name: 'Bhubing Palace West Ridge' }
  },
  {
    nodeId: 'node-03',
    location: { lat: 18.7991, lng: 98.9318 },
    status: 'active',
    battery: 15,
    rssi: -72,
    lqi: 175,
    sensors: { temp: 31.5, humidity: 55.4, smoke: 120, pm25: 25 },
    metadata: { deployedDate: '2026-01-12', location_name: 'Huay Kaew Waterfall Overlook' }
  },
  {
    nodeId: 'node-04',
    location: { lat: 18.8112, lng: 98.9205 },
    status: 'active',
    battery: 92,
    rssi: -38,
    lqi: 250,
    sensors: { temp: 27.2, humidity: 68.0, smoke: 70, pm25: 12 },
    metadata: { deployedDate: '2026-02-05', location_name: 'North Forest Fire Watchtower' }
  },
  {
    nodeId: 'node-05',
    location: { lat: 18.8023, lng: 98.9502 },
    status: 'active',
    battery: 62,
    rssi: -82,
    lqi: 140,
    sensors: { temp: 42.5, humidity: 32.1, smoke: 480, pm25: 150 },
    metadata: { deployedDate: '2026-02-10', location_name: 'Doi Pui Campsite East' }
  },
  {
    nodeId: 'node-06',
    location: { lat: 18.7942, lng: 98.9150 },
    status: 'inactive',
    battery: 0,
    rssi: -100,
    lqi: 0,
    sensors: { temp: 0, humidity: 0, smoke: 0, pm25: 0 },
    metadata: { deployedDate: '2026-01-10', location_name: 'Siri Bhum Waterfall Trail' }
  },
  {
    nodeId: 'node-07',
    location: { lat: 18.8077, lng: 98.9102 },
    status: 'active',
    battery: 51,
    rssi: -66,
    lqi: 190,
    sensors: { temp: 30.2, humidity: 57.5, smoke: 98, pm25: 20 },
    metadata: { deployedDate: '2026-02-15', location_name: 'Chang Khian Hmong Village' }
  },
  {
    nodeId: 'node-08',
    location: { lat: 18.8055, lng: 98.9540 },
    status: 'active',
    battery: 68,
    rssi: -78,
    lqi: 155,
    sensors: { temp: 38.5, humidity: 41.2, smoke: 220, pm25: 75 },
    metadata: { deployedDate: '2026-02-15', location_name: 'Pha Lat Temple Trail' }
  }
];

// Helper to check if DB is connected
const isConnected = () => require('mongoose').connection.readyState === 1;

// Helper to recalculate and broadcast dynamic routes
const recalculateAndBroadcastRoutes = async (req) => {
  const io = req.app.get('io');
  let nodes;
  if (!isConnected()) {
    nodes = seedNodes;
  } else {
    nodes = await SensorNode.find({});
  }
  
  const routingData = calculateDynamicRoutes(nodes);
  
  if (io) {
    io.to('dashboard').emit('routes_update', routingData);
  }

  if (isConnected()) {
    try {
      const RoutingEvent = require('../models/RoutingEvent');
      const inactiveNodes = nodes.filter(n => n.status !== 'active').map(n => n.nodeId);
      if (inactiveNodes.length > 0) {
        await RoutingEvent.create({
          eventId: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
          eventType: 'self-healing',
          description: `Self-healing routing paths computed. Bypassed offline nodes: ${inactiveNodes.join(', ')}`,
          affectedNodes: inactiveNodes,
          timestamp: new Date()
        });
      }
    } catch (e) {
      console.error('Failed to log routing event:', e);
    }
  }
};

// @desc    Get all nodes
// @route   GET /api/nodes
// @access  Public
exports.getNodes = async (req, res, next) => {
  try {
    if (!isConnected()) {
      return res.status(200).json(seedNodes);
    }
    let nodes = await SensorNode.find({});
    // Auto seed if empty
    if (nodes.length === 0) {
      await SensorNode.insertMany(seedNodes);
      nodes = await SensorNode.find({});
    }
    res.status(200).json(nodes);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single node
// @route   GET /api/nodes/:nodeId
// @access  Public
exports.getNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!isConnected()) {
      const node = seedNodes.find(n => n.nodeId === nodeId);
      if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
      return res.status(200).json(node);
    }
    const node = await SensorNode.findOne({ nodeId });
    if (!node) {
      return res.status(404).json({ success: false, message: 'Node not found' });
    }
    res.status(200).json(node);
  } catch (err) {
    next(err);
  }
};

// @desc    Recalibrate node sensors
// @route   POST /api/nodes/:nodeId/recalibrate
// @access  Private (Admin only)
exports.recalibrateNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const io = req.app.get('io');

    let updatedNode;
    if (!isConnected()) {
      const node = seedNodes.find(n => n.nodeId === nodeId);
      if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
      // Reset sensors to base values for mockup
      node.sensors = { temp: 25.0, humidity: 65.0, smoke: 50, pm25: 10 };
      node.lastUpdate = new Date();
      updatedNode = node;
    } else {
      updatedNode = await SensorNode.findOneAndUpdate(
        { nodeId },
        { 
          sensors: { temp: 25.0, humidity: 65.0, smoke: 50, pm25: 10 },
          lastUpdate: new Date()
        },
        { new: true }
      );
      if (!updatedNode) {
        return res.status(404).json({ success: false, message: 'Node not found' });
      }
    }

    // Broadcast node update via socket
    if (io) {
      io.to('dashboard').emit('node_update', updatedNode);
    }

    // Recalculate routes dynamically
    await recalculateAndBroadcastRoutes(req);

    res.status(200).json({
      success: true,
      message: `Node ${nodeId} recalibration sequence completed successfully.`,
      node: updatedNode,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle/Patch node status
// @route   PATCH /api/nodes/:nodeId/status
// @access  Private (Admin/Ranger)
exports.updateNodeStatus = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { status } = req.body;
    const io = req.app.get('io');

    if (!status || !['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    let updatedNode;
    if (!isConnected()) {
      const node = seedNodes.find(n => n.nodeId === nodeId);
      if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
      node.status = status;
      node.lastUpdate = new Date();
      updatedNode = node;
    } else {
      updatedNode = await SensorNode.findOneAndUpdate(
        { nodeId },
        { status, lastUpdate: new Date() },
        { new: true }
      );
      if (!updatedNode) {
        return res.status(404).json({ success: false, message: 'Node not found' });
      }
    }

    // Broadcast update
    if (io) {
      io.to('dashboard').emit('node_update', updatedNode);
    }

    // Recalculate routes dynamically
    await recalculateAndBroadcastRoutes(req);

    res.status(200).json({
      success: true,
      node: updatedNode,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Receive telemetry from sensor node
// @route   POST /api/nodes/:nodeId/telemetry
// @access  Public (Simulated IoT Node)
exports.receiveTelemetry = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { battery, rssi, lqi, sensors } = req.body;
    const io = req.app.get('io');

    let updatedNode;
    if (!isConnected()) {
      const node = seedNodes.find(n => n.nodeId === nodeId);
      if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
      if (battery !== undefined) node.battery = battery;
      if (rssi !== undefined) node.rssi = rssi;
      if (lqi !== undefined) node.lqi = lqi;
      if (sensors) node.sensors = { ...node.sensors, ...sensors };
      node.lastUpdate = new Date();
      updatedNode = node;
    } else {
      updatedNode = await SensorNode.findOneAndUpdate(
        { nodeId },
        { 
          battery, 
          rssi, 
          lqi, 
          sensors,
          lastUpdate: new Date() 
        },
        { new: true }
      );
      if (!updatedNode) {
        return res.status(404).json({ success: false, message: 'Node not found' });
      }
    }

    // Broadcast node update
    if (io) {
      io.to('dashboard').emit('node_update', updatedNode);
    }

    // Check if sensor thresholds are breached to create an alert automatically!
    if (sensors && (sensors.smoke > 400 || sensors.temp > 40)) {
      const alertSeverity = sensors.smoke > 500 || sensors.temp > 45 ? 'critical' : 'warning';
      const alertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      let newAlert = {
        alertId,
        severity: alertSeverity,
        sourceNodeId: nodeId,
        location: updatedNode.location,
        sensorType: sensors.smoke > 400 ? 'smoke' : 'temperature',
        value: sensors.smoke > 400 ? sensors.smoke : sensors.temp,
        threshold: sensors.smoke > 400 ? 400 : 40,
        timestamp: new Date(),
        status: 'active'
      };

      if (isConnected()) {
        const Alert = require('../models/Alert');
        // Check if there is already an active alert for this node to avoid duplicate spamming
        const activeAlert = await Alert.findOne({ sourceNodeId: nodeId, status: 'active' });
        if (!activeAlert) {
          const alertDoc = await Alert.create(newAlert);
          newAlert = alertDoc;
          if (io) {
            io.to('dashboard').emit('new_alert', newAlert);
          }
        }
      } else {
        const activeAlert = require('./alertController').seedAlerts.find(a => a.sourceNodeId === nodeId && a.status === 'active');
        if (!activeAlert) {
          require('./alertController').seedAlerts.unshift(newAlert);
          if (io) {
            io.to('dashboard').emit('new_alert', newAlert);
          }
        }
      }
    }

    // Recalculate routes dynamically
    await recalculateAndBroadcastRoutes(req);

    res.status(200).json({ success: true, node: updatedNode });
  } catch (err) {
    next(err);
  }
};

// Expose seed nodes array for other controllers/simulators if needed
exports.seedNodes = seedNodes;
