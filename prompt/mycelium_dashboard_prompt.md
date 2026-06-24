# Mycelium Sensors Network - Admin Dashboard Development Prompt

## Project Overview
You are developing the **server-side admin dashboard** for the **Mycelium Sensors Network** project - an IoT forest fire detection and monitoring system that uses bio-inspired (mycelium-inspired) routing protocol for wireless sensor networks.

## System Architecture Context

### What is Mycelium?
- **Routing Protocol**: Bio-inspired, energy-aware multi-hop wireless mesh network
- **Core Feature**: Self-healing network that automatically reroutes when nodes fail
- **Energy Management**: Routes data through nodes with highest residual battery
- **Decision Factors**: 
  1. Residual Energy (battery remaining)
  2. RSSI/LQI (signal strength/quality)
  3. Data Proximity & Urgency (prioritize fire detection)

### Hardware
- **Sensor Nodes**: ESP32-based, DHT22 (temperature/humidity), MQ-2 (smoke detection)
- **Sensors Monitored**: Temperature, Humidity, Smoke density, PM2.5 concentration
- **Network Type**: Low-power wireless mesh (ESP-NOW protocol)
- **Deployment**: 10-15 physical nodes (lab-scale), up to 100+ in simulation

---

## Dashboard Requirements

### EXISTING FEATURES (Confirmed)
1. **Network Topology Graph**
   - Real-time visualization of all nodes
   - Display multi-hop connections
   - Highlight primary vs backup routes
   - Show node status (active/inactive/dead)

2. **Battery Status Panel**
   - Per-node battery percentage
   - Low battery alerts
   - Battery depletion rate trends

3. **Sensor Data Charts**
   - Temperature graph (live updates)
   - Smoke/gas concentration levels
   - PM2.5 air quality index
   - Humidity readings

### NEW FEATURES TO ADD (Priority Order)

#### 🔴 **1. Alert System (CRITICAL)**
- Real-time fire/smoke alerts with severity levels (Critical/Warning/Info)
- Geographic coordinates (Latitude, Longitude) of detected fire
- Alert timestamp and source node ID
- Historical alert log with filters (date range, severity, location)
- Acknowledgment/resolution status tracking
- Integration hook for forest ranger notification

#### 🌐 **2. Routing Intelligence Monitor**
- Self-healing event log: "Node 5 failed → rerouted via Nodes 3,8 → Success"
- Path redundancy status per node
- Message delivery success rate (%)
- Average hops count for messages
- Weighted scoring visualization (show α*Energy + β*RSSI + γ*DataProximity values)
- Link failure detection and recovery timeline

#### 📍 **3. Coverage & Signal Heatmap**
- RSSI/LQI distribution map (color gradient: green=strong to red=weak)
- Dead zones highlighting
- Inter-node signal quality matrix
- Signal quality trends over time

#### 📊 **4. Analytics & Trends Dashboard**
- Historical sensor data (7-day, 30-day, custom range)
- Anomaly detection (unusual readings flagged)
- Predictive alerts ("This area shows rising trend, fire risk increasing")
- Peak activity hours analysis
- Node behavior patterns (normal vs abnormal)

#### 📈 **5. System Health Metrics**
- Network uptime percentage
- Total packet loss rate
- Average end-to-end latency (hop-to-sink)
- Active nodes count vs. deployed total
- Battery depletion rate (median node lifetime remaining)
- Data throughput (packets/sec)

#### 🗺️ **6. Incident Management**
- Complete incident history with geospatial data
- Response timeline (detected → alert sent → ranger dispatched → resolved)
- Incident clustering by location (hotspot analysis)
- Export incident data (CSV/JSON) for reporting
- Integration placeholders for ranger team coordination

#### ⚙️ **7. Configuration & Settings**
- Adjustable alert thresholds (temperature, smoke, PM2.5)
- Sensor calibration offset settings
- User roles & access control (admin/ranger/analyst)
- API key management
- Data export functionality
- System performance tuning parameters

---

## Technical Specifications

### Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React.js with Charts.js / D3.js for visualization
- **Database**: MongoDB or PostgreSQL
- **Real-time Communication**: WebSocket (Socket.io) for live updates
- **API**: RESTful API with real-time WebSocket support
- **Deployment**: Docker containers

### Backend API Endpoints (Required)

#### Dashboard Overview
```
GET  /api/dashboard/overview
     Response: { activeNodes, activeAlerts, avgBattery, networkHealth, coverage }
```

#### Alert Management
```
GET  /api/alerts/active
     Response: [{ id, severity, location, timestamp, sourceNodeId, status }]

GET  /api/alerts/history?limit=50&severity=critical
     Response: Historical alert list with filters

POST /api/alerts/:alertId/acknowledge
     Acknowledge an alert as handled by ranger
```

#### Node Status & Health
```
GET  /api/nodes
     Response: List of all nodes with status, battery, signal strength

GET  /api/nodes/:nodeId/health
     Response: Detailed health metrics for single node

GET  /api/nodes/:nodeId/battery-trend
     Response: Historical battery levels over time
```

#### Routing Intelligence
```
GET  /api/routing/self-healing-events
     Response: Timeline of self-healing occurrences

GET  /api/routing/node/:nodeId/paths
     Response: Primary and backup routes for node

GET  /api/routing/delivery-success-rate
     Response: Delivery success percentage per node
```

#### Coverage & Signal
```
GET  /api/coverage/heatmap
     Response: RSSI/LQI data as grid or GeoJSON for map visualization

GET  /api/coverage/dead-zones
     Response: Coordinates and severity of signal dead zones

GET  /api/coverage/signal-matrix
     Response: N×N matrix of inter-node signal quality
```

#### Analytics
```
GET  /api/analytics/trends?timeRange=7days
     Response: Historical sensor data for graphing

GET  /api/analytics/anomalies
     Response: Detected anomalies with confidence scores

GET  /api/analytics/forecast
     Response: Predicted values based on patterns
```

#### System Metrics
```
GET  /api/system/health
     Response: { uptime%, packetLossRate, avgLatency, activeNodeCount }

GET  /api/system/performance
     Response: CPU, memory, message throughput metrics
```

#### Configuration
```
GET  /api/config/thresholds
     Response: Current alert threshold settings

POST /api/config/thresholds
     Update: { tempThreshold, smokeThreshold, pm25Threshold }

POST /api/config/sensor-calibration
     Update calibration offsets for specific nodes
```

---

## Frontend Components Needed

### Core Dashboard Layout
1. **Header Navigation** - Overview, Alerts, Nodes, Analytics, Settings
2. **Real-time Status Panel** - KPIs (Active Nodes, Fire Alerts, Network Health)
3. **Network Topology Visualization** - Interactive graph with D3.js
4. **Alert List Panel** - Live alerts with severity colors
5. **Node Details Sidebar** - Click node to see details

### Detailed View Pages

#### Alerts Page
- List of active + resolved alerts
- Map showing alert locations
- Filtering by date, severity, location
- Alert detail modal with response options

#### Network Health Page
- Topology graph with status indicators
- Self-healing event timeline
- Signal strength heatmap
- Node battery distribution chart

#### Analytics Page
- Multi-metric time-series charts
- Anomaly highlighting
- Trend analysis
- Export data button

#### Settings Page
- Threshold configuration form
- User management
- API key generation
- Data export options

---

## Database Schema (MongoDB Example)

### Collections

#### nodes
```
{
  _id, nodeId, location: {lat, lng}, 
  status: 'active'|'inactive'|'dead',
  battery: 85, maxBattery: 100,
  rssi: -45, lqi: 200,
  sensors: {temp: 28.5, humidity: 65, smoke: 120, pm25: 15},
  lastUpdate: timestamp,
  metadata: {deployedDate, location_name}
}
```

#### alerts
```
{
  _id, alertId, severity: 'critical'|'warning'|'info',
  sourceNodeId, location: {lat, lng},
  sensorType: 'smoke'|'temperature'|'pm25',
  value: 450, threshold: 400,
  timestamp, acknowledgedAt, acknowledgedBy,
  status: 'active'|'resolved',
  responseDetails: {rangerId, actionTaken, resolvedAt}
}
```

#### routingEvents
```
{
  _id, eventType: 'self-healing'|'path-failure'|'link-recovery',
  timestamp, affectedNodes: [nodeA, nodeB],
  description: "Node 5 lost → rerouted via 3,8",
  recoveryTime_ms: 245,
  success: true|false
}
```

#### systemMetrics
```
{
  _id, timestamp,
  networkUptime%, packetLoss%, avgLatency_ms,
  activeNodeCount, messagesThroughput,
  avgBatteryLevel, estimatedNetworkLifetime_days
}
```

---

## Development Steps (Recommended Order)

### Phase 1: Foundation (Week 1)
1. Set up Node.js + Express server with basic routes
2. Design MongoDB collections
3. Create WebSocket server for real-time updates
4. Implement authentication & API keys

### Phase 2: Core Features (Week 2-3)
1. Alert System - full CRUD endpoints + real-time push
2. Node Status endpoints with battery/sensor data
3. Routing Intelligence endpoints (self-healing log)
4. Basic React dashboard layout

### Phase 3: Advanced Features (Week 4)
1. Coverage heatmap generation
2. Analytics & trend calculation
3. Configuration management endpoints
4. Incident management + geospatial features

### Phase 4: Frontend Completion (Week 5)
1. All chart components (Charts.js, D3.js)
2. Interactive visualizations
3. Real-time updates via WebSocket
4. Responsive mobile layout

### Phase 5: Testing & Deployment (Week 6)
1. Unit tests for critical endpoints
2. Integration tests with simulator
3. Docker containerization
4. Load testing with 100+ nodes simulation

---

## Key Performance Requirements

- **Real-time Updates**: Alert delivery < 2 seconds
- **Dashboard Load Time**: < 3 seconds
- **API Response Time**: < 500ms for most endpoints
- **WebSocket Latency**: < 100ms for sensor updates
- **Network Support**: 100+ nodes without degradation
- **Data Retention**: 30 days of historical data minimum
- **Uptime**: 99%+ availability

---

## Important Considerations

### Security
- Validate all node data before storing
- Implement rate limiting on APIs
- Encrypt sensor location data
- Role-based access control (RBAC)
- API authentication via JWT tokens

### Scalability
- Use connection pooling for database
- Implement caching (Redis) for frequently accessed data
- Pagination for large datasets (alerts, events)
- Consider time-series database (InfluxDB) for sensor data

### Data Quality
- Validate sensor readings against realistic ranges
- Flag outliers for manual review
- Implement data smoothing for noisy sensors
- Store raw + processed data separately

### Integration
- Prepare REST API for external ranger app
- WebSocket support for multi-device real-time sync
- Data export for analysis tools (Python, R)
- GIS integration (if available)

---

## Questions to Clarify

Before starting, confirm:
1. What's the expected number of concurrent admin users?
2. Do you need mobile app support or web-only?
3. What's the preferred hosting platform (AWS, GCP, self-hosted)?
4. Do you have an existing database or starting fresh?
5. Should the system integrate with existing ranger communication tools?
6. What's the budget for 3rd-party services (maps, geocoding)?

---

## Start With

```
Task: Create the basic Node.js/Express server structure with the following:
1. Express app initialization with CORS, body-parser
2. MongoDB connection setup
3. JWT authentication middleware
4. Basic folder structure (routes/, models/, controllers/, middleware/)
5. WebSocket server setup with Socket.io
6. Environment configuration (.env file)
7. Hello world endpoint to verify setup

Provide complete working code ready to run with "npm start"
```

---

## Notes for AI Model

- This is a **real-world IoT project** based on a research paper (Mycelium Sensors Network)
- Focus on **scalability** and **real-time performance**
- Prioritize **alert accuracy** (false positives = ranger fatigue)
- Remember: **This system could prevent forest fires** - take quality seriously
- Ask clarifying questions if requirements are ambiguous
- Suggest optimizations for both frontend UX and backend efficiency
- Include error handling and logging in all code
- Provide unit test examples for critical functions
