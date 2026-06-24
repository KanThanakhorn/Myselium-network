const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true,
  },
  sourceNodeId: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  sensorType: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
  acknowledgedAt: {
    type: Date,
  },
  acknowledgedBy: {
    type: String,
  },
  responseDetails: {
    rangerId: { type: String },
    actionTaken: { type: String },
    resolvedAt: { type: Date },
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', alertSchema);
