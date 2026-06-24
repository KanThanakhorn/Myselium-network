const mongoose = require('mongoose');

const sensorNodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: [true, 'Please provide a nodeId'],
    unique: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  battery: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxBattery: {
    type: Number,
    default: 100,
  },
  rssi: {
    type: Number,
    default: -50,
  },
  lqi: {
    type: Number,
    default: 200,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  sensors: {
    temp: { type: Number, default: 0 },
    humidity: { type: Number, default: 0 },
    smoke: { type: Number, default: 0 },
    pm25: { type: Number, default: 0 },
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    deployedDate: { type: String },
    location_name: { type: String },
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SensorNode', sensorNodeSchema);
