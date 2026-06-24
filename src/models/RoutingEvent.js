const mongoose = require('mongoose');

const routingEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['self-healing', 'failure'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  affectedNodes: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: true,
  },
  recovery_time_ms: {
    type: Number,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('RoutingEvent', routingEventSchema);
