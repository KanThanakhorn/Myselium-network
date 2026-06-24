const mongoose = require('mongoose');

const systemMetricsSchema = new mongoose.Schema({
  networkUptime: { type: Number, default: 100 },
  packetLossRate: { type: Number, default: 0 },
  avgLatencyMs: { type: Number, default: 200 },
  activeNodeCount: { type: Number, default: 0 },
  deadNodeCount: { type: Number, default: 0 },
  avgBatteryPercent: { type: Number, default: 100 },
  estimatedNetworkLifetimeDays: { type: Number, default: 30 },
  lastUpdate: { type: Date, default: Date.now },
  alerts: {
    critical: { type: Number, default: 0 },
    warning: { type: Number, default: 0 },
    info: { type: Number, default: 0 }
  },
  routing: {
    selfHealingEventsLast24h: { type: Number, default: 0 },
    deliverySuccessRate: { type: Number, default: 100 }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SystemMetrics', systemMetricsSchema);
