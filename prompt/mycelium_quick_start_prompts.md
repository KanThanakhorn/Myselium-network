# Mycelium Dashboard - Quick Start Prompts for Specific Tasks

ใช้ Prompts เหล่านี้เมื่อคุณต้องการสิ่งเฉพาะ ในแต่ละชั้นตอนการพัฒนา

---

## 🚀 BACKEND SETUP & CONFIGURATION

### 1️⃣ Initialize Express Server Structure
```
Context: I'm building a Node.js admin dashboard for Mycelium Sensors Network (IoT forest fire detection)

Task: Create the complete Express.js server initialization with:
- Proper folder structure (routes/, models/, controllers/, middleware/, config/)
- MongoDB connection with Mongoose
- JWT authentication middleware
- CORS and body-parser setup
- Environment variables setup (.env)
- Socket.io WebSocket server for real-time updates
- Error handling middleware
- Logging setup (morgan or winston)

Provide complete, production-ready code that I can run with "npm start" immediately.
Include package.json dependencies.
```

### 2️⃣ Database Schema Design
```
Context: Mycelium Sensors Network Dashboard - forest fire monitoring system
Need to store: Sensor nodes, alerts, routing events, system metrics

Task: Design MongoDB/Mongoose schemas for:
1. nodes - { nodeId, status, battery%, location(lat/lng), sensors(temp/humidity/smoke/pm25), lastUpdate, rssi, lqi }
2. alerts - { alertId, severity, sourceNodeId, location, sensorType, value, timestamp, status, acknowledgedBy }
3. routingEvents - { eventType(self-healing/failure), timestamp, affectedNodes, description, success }
4. systemMetrics - { timestamp, networkUptime%, packetLoss%, avgLatency, activeNodeCount }
5. users - { role(admin/ranger/analyst), email, password(hashed), permissions }

Include:
- Proper data validation
- Indexes for frequently queried fields
- Timestamps (createdAt, updatedAt)
- TTL indexes for historical data retention (30 days)
- Relationships between collections

Provide complete Mongoose model files ready to use.
```

---

## 📡 API ENDPOINTS

### 3️⃣ Alert System Endpoints
```
Context: Building alert endpoints for Mycelium forest fire detection dashboard
Alerts need real-time updates to admin dashboard and ranger teams

Task: Create Express routes for alert management:
1. GET /api/alerts/active - List all active fire alerts with severity
2. GET /api/alerts/history - Get historical alerts with filters (date, severity, location, node)
3. POST /api/alerts/:alertId/acknowledge - Mark alert as handled by ranger
4. POST /api/alerts/:alertId/resolve - Close/resolve an alert
5. GET /api/alerts/stats - Alert statistics (count by severity, success rate)

Each endpoint should:
- Validate user authentication & authorization
- Include pagination (limit, skip)
- Return proper HTTP status codes
- Include error handling
- Support filtering & sorting

Provide complete controller code with error handling. Make it production-ready.
```

### 4️⃣ Node Status Endpoints
```
Context: Mycelium IoT dashboard - need to track 100+ sensor nodes
Each node has: battery%, temp, humidity, smoke level, signal strength (RSSI), status

Task: Create REST endpoints:
1. GET /api/nodes - List all nodes with summary (status, battery, lastUpdate)
2. GET /api/nodes/:nodeId - Detailed node info including sensor history (last 24h)
3. GET /api/nodes/:nodeId/battery - Battery level + depletion rate trend
4. GET /api/nodes/:nodeId/sensors - Latest sensor readings with timestamps
5. POST /api/nodes/:nodeId/recalibrate - Trigger sensor calibration
6. PATCH /api/nodes/:nodeId/status - Enable/disable a node

Include:
- Real-time WebSocket updates when node status changes
- Historical data aggregation
- Battery life remaining estimation
- Anomaly detection in sensor values

Provide complete controller code.
```

### 5️⃣ Routing Intelligence Endpoints
```
Context: Mycelium uses BIO-INSPIRED routing with SELF-HEALING capability
Need to expose routing metrics: self-healing events, path redundancy, delivery success rate

Task: Create API endpoints for routing diagnostics:
1. GET /api/routing/self-healing-events - Timeline of auto-recovery events
   Response: [{ timestamp, failedNode, reroute_via, success, recovery_time_ms }]

2. GET /api/routing/node/:nodeId/paths - Show primary + backup routes
   Response: { primary: [nodeA→nodeB→sinkC], backup1: [...], backup2: [...] }

3. GET /api/routing/delivery-success-rate - Per-node message delivery %
   Response: { nodeId: 92.5%, ... }

4. GET /api/routing/path-diversity - How many alternative routes exist
   Response: { nodeId: redundancy_count, ... }

5. GET /api/routing/weighting - Show Mycelium algorithm scores
   Response: { nodeId: { residualEnergy: 0.7, rssi: 0.8, dataProximity: 0.5, totalScore: 2.0 } }

Each metric should help admin understand network health and routing efficiency.

Provide complete implementation with database queries to calculate these metrics.
```

### 6️⃣ Analytics & Trends Endpoints
```
Context: Dashboard needs analytics: historical trends, anomaly detection, predictions
Data: Temperature, humidity, smoke, PM2.5 over 7/30 days

Task: Create analytics endpoints:
1. GET /api/analytics/trends?timeRange=7days&metric=temperature
   - Return time-series data for charting
   - Support multiple metrics

2. GET /api/analytics/anomalies
   - Detect unusual sensor readings
   - Return: [{ nodeId, timestamp, metric, normalRange, actualValue, confidence }]

3. GET /api/analytics/forecast?days=7
   - Predict next 7 days of sensor trends
   - Based on historical patterns

4. GET /api/analytics/heatmap-hourly
   - Fire risk by hour of day (pattern analysis)

Include:
- Data aggregation (hourly, daily, weekly)
- Outlier detection algorithm
- Exponential smoothing for trends

Provide complete controller with mathematical implementations.
```

---

## 🌐 REAL-TIME FEATURES

### 7️⃣ WebSocket Setup for Real-Time Updates
```
Context: Dashboard needs real-time updates: new alerts, battery changes, node status
Use Socket.io for bidirectional communication

Task: Create WebSocket/Socket.io implementation:
1. Setup Socket.io server with authentication
2. Namespace: /alerts - broadcast new fire alerts in real-time
3. Namespace: /nodes - emit node status changes (online/offline/battery%)
4. Namespace: /routing - emit self-healing events as they occur
5. Namespace: /sensors - stream sensor updates (temp, smoke, etc.)

Features needed:
- Room-based notifications (only send to connected admins)
- Fallback to HTTP polling if WebSocket unavailable
- Reconnection handling
- Message compression
- Error handling with client-side retry logic

Provide complete Socket.io server code with namespace setup.
Include frontend client example code.
```

---

## 🗺️ GEOGRAPHIC & MAPPING

### 8️⃣ Coverage Heatmap API
```
Context: Need to visualize network signal coverage on a map
Show RSSI (signal strength) and identify dead zones where signal is weak

Task: Create endpoint for signal heatmap:
GET /api/coverage/heatmap
Response: GeoJSON or grid format with:
- Latitude, Longitude
- RSSI value (-30 strong to -90 weak)
- LQI (Link Quality Indicator)
- Color code: green (strong) → yellow (ok) → red (dead zone)

Also create:
GET /api/coverage/dead-zones
Response: [{ lat, lng, radius_meters, severity }]
- Show locations with no signal
- Severity based on how many nodes depend on coverage

Provide backend logic to:
1. Aggregate RSSI readings from mesh network
2. Interpolate coverage between nodes (kriging algorithm)
3. Identify dead zones
4. Return as GeoJSON for map visualization

Include code for GeoJSON generation and mapping helper functions.
```

### 9️⃣ Incident Management & Geospatial
```
Context: Dashboard tracks fire incidents with location, response timeline, resolution
Need to build incident history and clustering for hotspot analysis

Task: Create incident management system:
1. GET /api/incidents - List all incidents with location clustering
2. POST /api/incidents - Create new incident from alert
3. GET /api/incidents/hotspots - Identify fire-prone zones
   - Use spatial clustering (kmeans or dbscan)
   - Return: [{lat, lng, frequency, lastOccurrence, riskLevel}]

Features:
- Geospatial indexing (MongoDB 2dsphere)
- Incident timeline visualization data
- Response metrics (detection_to_alert, alert_to_ranger, ranger_to_resolution)
- Export incidents as CSV/JSON for reporting

Provide complete implementation with geospatial queries and clustering algorithm.
```

---

## 🔧 CONFIGURATION & ADMINISTRATION

### 🔟 Configuration Management Endpoints
```
Context: Admins need to adjust alert thresholds, calibrate sensors, manage users
Need flexible configuration system

Task: Create config management API:
1. GET /api/config/thresholds - Current alert thresholds
2. POST /api/config/thresholds - Update thresholds
   { temperature: 35, smoke: 400, pm25: 150 }

3. GET /api/config/sensor-calibration - Per-node calibration offsets
4. POST /api/config/sensor-calibration - Set calibration for node
   { nodeId: "node_5", tempOffset: +2.5, smokeOffset: -30 }

5. GET /api/config/users - List admin users
6. POST /api/config/users - Create new user with role
7. POST /api/config/api-keys - Generate API key for ranger app

Each config change should:
- Be logged for audit trail
- Take effect immediately
- Not require server restart
- Have version history

Provide complete implementation with validation and audit logging.
```

---

## 📊 DASHBOARD METRICS

### 1️⃣1️⃣ System Health Dashboard
```
Context: Admin needs one-glance view of entire system health
Key metrics: uptime, packet loss, latency, node count, battery health

Task: Create comprehensive health endpoint:
GET /api/system/health
Response:
{
  networkUptime: 99.7,
  packetLossRate: 0.3,
  avgLatencyMs: 245,
  activeNodeCount: 14,
  deadNodeCount: 1,
  avgBatteryPercent: 62,
  estimatedNetworkLifetimeDays: 8,
  lastUpdate: timestamp,
  alerts: {
    critical: 1,
    warning: 3,
    info: 7
  },
  routing: {
    selfHealingEventsLast24h: 5,
    deliverySuccessRate: 98.5
  }
}

This endpoint should aggregate data from multiple sources efficiently.
Include caching strategy to avoid slow queries.

Provide complete implementation with Redis caching.
```

---

## 🧪 TESTING & SIMULATION

### 1️⃣2️⃣ Node Simulator for Testing
```
Context: Need to test dashboard with 100+ fake nodes sending realistic data
Can't deploy actual 100 nodes yet

Task: Create data simulator that:
1. Generates 100 virtual nodes with realistic sensor data
2. Simulates battery depletion over time
3. Occasionally triggers "node failures" that trigger self-healing
4. Generates random fire alerts at configurable frequency
5. Sends data via HTTP/WebSocket like real nodes would

The simulator should:
- Use realistic sensor value ranges
- Include temporal patterns (temp changes hourly, smoke spikes)
- Simulate network delays
- Be configurable via env variables

Provide complete Node.js simulator code.
Can be run: node simulator.js --nodeCount=100 --fireFrequency=0.1
```

---

## 🔐 SECURITY & AUTHENTICATION

### 1️⃣3️⃣ JWT Authentication System
```
Context: Dashboard needs secure API access with role-based permissions
Admin, Ranger, Analyst roles with different access levels

Task: Implement JWT authentication:
1. POST /api/auth/login - Username/password → JWT token
2. POST /api/auth/logout - Invalidate token
3. Middleware: Verify JWT on all protected routes
4. Authorization: Check user role against required permissions

Features:
- JWT tokens with 24h expiration
- Refresh token mechanism
- Password hashing (bcrypt)
- Rate limiting on login attempts
- Audit log of all authentication events

Roles:
- admin: Full access, can configure thresholds, manage users
- ranger: Can view alerts and acknowledge them
- analyst: Read-only access to analytics

Provide complete authentication system including controller, middleware, and user schema.
```

---

## 📦 DEPLOYMENT

### 1️⃣4️⃣ Docker & Environment Setup
```
Context: Need to deploy Mycelium dashboard to production
Use Docker for consistency

Task: Create:
1. Dockerfile for Node.js backend
2. docker-compose.yml with MongoDB service
3. .env.example file with all required variables
4. Scripts for database setup & migration

Include:
- Multi-stage Docker build (optimize image size)
- Health check endpoint
- Proper signal handling for graceful shutdown
- Volume mounting for data persistence

Provide complete Docker setup ready to deploy.
```

---

## 💡 HOW TO USE THESE PROMPTS

### In VS Code with OpenCode (Llama 3.3 70B):

**Step 1**: Copy the entire "Main Prompt" (mycelium_dashboard_prompt.md)
- Use for initial project setup and understanding

**Step 2**: For specific features, copy individual Quick-Start Prompt
- Example: Need to build Alert endpoints? Copy Prompt #3

**Step 3**: Paste in OpenCode / OpenRouter and specify:
```
Context from: Mycelium Sensors Network forest fire detection dashboard
[Paste specific quick-start prompt here]

Additional requirements:
- Must include error handling
- Must be production-ready code
- Must have inline comments explaining logic
- Must follow Express.js best practices
```

**Step 4**: After getting code response:
- Ask follow-up: "Now add unit tests for this using Jest"
- Ask: "Optimize this for handling 100+ concurrent connections"
- Ask: "Show me how to integrate this with Socket.io for real-time updates"

---

## 🎯 RECOMMENDED EXECUTION ORDER

**Week 1**: Prompts 1, 2, 7 (Backend setup, Database, WebSocket)
**Week 2**: Prompts 3, 4, 5 (Alerts, Nodes, Routing endpoints)
**Week 3**: Prompts 6, 8, 9 (Analytics, Heatmap, Incidents)
**Week 4**: Prompts 10, 11, 12 (Config, Health, Simulator)
**Week 5**: Prompts 13, 14 (Auth, Docker)

---

## 📝 TIPS FOR BEST RESULTS

1. **Be Specific**: Don't just say "make an alert system"
   - Say: "Create POST /api/alerts/:alertId/acknowledge endpoint that..."

2. **Include Context**: Always mention you're building Mycelium
   - Helps Llama 3.3 understand the bio-inspired nature

3. **Request Format**: Ask for "production-ready code with error handling"
   - Gets better results than generic requests

4. **Follow-up Questions**: Ask the model:
   - "How would you optimize this for 1000 messages/second?"
   - "What security vulnerabilities should I watch for?"
   - "How would this scale to 500 nodes?"

5. **Version Control**: Save each response separately
   - Easy to roll back if needed

---

## 🚨 COMMON ISSUES & FIXES

### Issue: MongoDB connection timeout
```
Add to .env:
MONGODB_URI=mongodb://localhost:27017/mycelium
MONGODB_TIMEOUT=5000
```

### Issue: WebSocket connection drops
```
Ask Llama 3.3:
"My Socket.io clients keep disconnecting after 5 minutes. 
What's causing this and how to fix with reconnection strategy?"
```

### Issue: Real-time updates lag
```
Ask: "How to optimize Socket.io to handle 100+ nodes 
sending updates every 5 seconds? Should I use Redis pub/sub?"
```

---

Selamat mengembangkan! 🎉 Good luck with Mycelium Dashboard!
