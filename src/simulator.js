/**
 * Mycelium Sensors Network - IoT Telemetry Simulator
 * Standalone zero-dependency Node.js script.
 * Periodically sends simulated sensor telemetry payload to the API server.
 */

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '5000', 10);

// Base state for Doi Suthep forest nodes
const nodes = [
  {
    nodeId: 'node-01',
    battery: 89,
    rssi: -45,
    lqi: 240,
    sensors: { temp: 28.4, humidity: 62.1, smoke: 85, pm25: 18 },
    location_name: 'Doi Suthep Peak Station'
  },
  {
    nodeId: 'node-02',
    battery: 74,
    rssi: -58,
    lqi: 210,
    sensors: { temp: 29.1, humidity: 59.8, smoke: 110, pm25: 22 },
    location_name: 'Bhubing Palace West Ridge'
  },
  {
    nodeId: 'node-03',
    battery: 15,
    rssi: -72,
    lqi: 175,
    sensors: { temp: 31.5, humidity: 55.4, smoke: 120, pm25: 25 },
    location_name: 'Huay Kaew Waterfall Overlook'
  },
  {
    nodeId: 'node-04',
    battery: 92,
    rssi: -38,
    lqi: 250,
    sensors: { temp: 27.2, humidity: 68.0, smoke: 70, pm25: 12 },
    location_name: 'North Forest Fire Watchtower'
  },
  {
    nodeId: 'node-05',
    battery: 62,
    rssi: -82,
    lqi: 140,
    sensors: { temp: 29.5, humidity: 58.1, smoke: 90, pm25: 15 },
    location_name: 'Doi Pui Campsite East'
  },
  {
    nodeId: 'node-06',
    battery: 0,
    rssi: -100,
    lqi: 0,
    sensors: { temp: 0, humidity: 0, smoke: 0, pm25: 0 },
    location_name: 'Siri Bhum Waterfall Trail'
  },
  {
    nodeId: 'node-07',
    battery: 51,
    rssi: -66,
    lqi: 190,
    sensors: { temp: 30.2, humidity: 57.5, smoke: 98, pm25: 20 },
    location_name: 'Chang Khian Hmong Village'
  },
  {
    nodeId: 'node-08',
    battery: 68,
    rssi: -78,
    lqi: 155,
    sensors: { temp: 32.5, humidity: 48.2, smoke: 110, pm25: 24 },
    location_name: 'Pha Lat Temple Trail'
  }
];

// Helper to generate a small random offset
const randomRange = (min, max) => Math.random() * (max - min) + min;

const simulateTelemetryStep = async () => {
  console.log(`\n=== Starting Telemetry Update Loop: ${new Date().toLocaleTimeString()} ===`);
  
  for (const node of nodes) {
    // If battery is 0, skip simulation (dead node)
    if (node.battery <= 0) {
      continue;
    }

    // 1. Drain battery slightly
    node.battery = Math.max(0, node.battery - randomRange(0.01, 0.08));
    
    // 2. Fluctuate metrics slightly
    node.rssi = Math.max(-100, Math.min(-30, Math.round(node.rssi + randomRange(-2, 2))));
    node.lqi = Math.max(0, Math.min(255, Math.round(node.lqi + randomRange(-5, 5))));

    // 3. Fluctuate environment readings
    node.sensors.temp = parseFloat((node.sensors.temp + randomRange(-0.4, 0.4)).toFixed(2));
    node.sensors.humidity = Math.max(10, Math.min(100, parseFloat((node.sensors.humidity + randomRange(-1.5, 1.5)).toFixed(2))));
    node.sensors.pm25 = Math.max(1, Math.round(node.sensors.pm25 + randomRange(-2, 2)));
    node.sensors.smoke = Math.max(0, Math.round(node.sensors.smoke + randomRange(-10, 10)));

    // 4. Random fire event injection: 1% chance for any node to spike
    if (Math.random() < 0.01) {
      console.log(`🔥 [ALERT INJECTION] Spiking temp/smoke for ${node.nodeId} (${node.location_name})!`);
      node.sensors.temp = parseFloat((42.5 + randomRange(0, 5)).toFixed(2));
      node.sensors.smoke = Math.round(480 + randomRange(0, 100));
      node.sensors.pm25 = Math.round(150 + randomRange(0, 50));
    }

    // 5. Send POST to server
    const endpoint = `${SERVER_URL}/api/nodes/${node.nodeId}/telemetry`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battery: Math.round(node.battery),
          rssi: node.rssi,
          lqi: node.lqi,
          sensors: node.sensors
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      console.log(`📡 [${node.nodeId}] Telemetry sent: Temp=${node.sensors.temp}°C, Humidity=${node.sensors.humidity}%, Smoke=${node.sensors.smoke} ppm, Battery=${Math.round(node.battery)}%`);
    } catch (error) {
      console.error(`❌ [${node.nodeId}] Connection failed to ${SERVER_URL}: ${error.message}`);
    }
  }
};

// Bootstrap loop
console.log('----------------------------------------------------');
console.log('  Mycelium Forest Guard IoT Telemetry Simulator     ');
console.log(`  Sending telemetry data to: ${SERVER_URL} every ${INTERVAL_MS/1000}s`);
console.log('  Press Ctrl+C to terminate                          ');
console.log('----------------------------------------------------');

// Start interval
simulateTelemetryStep();
setInterval(simulateTelemetryStep, INTERVAL_MS);
