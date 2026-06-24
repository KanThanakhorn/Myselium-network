# 🍄 Mycelium Forest Guard — IoT Sensors Network Dashboard

Mycelium Forest Guard is a premium, real-time IoT wireless mesh network topology visualizer and telemetry monitoring dashboard designed for forest fire prevention and detection in Doi Suthep - Pui National Park, Chiang Mai, Thailand. 

The system leverages a bio-inspired self-healing routing protocol mock simulator combined with a glassmorphic dashboard to monitor temperature, humidity, smoke, and air quality index (PM2.5) across geographically distributed node points.

---

## ✨ Features

*   **📈 Real-time Telemetry & Websockets:** Continuous live updates of temperature, humidity, and smoke metrics streamed from active nodes via Socket.io.
*   **🕸️ Network Topology Map:** Custom high-fidelity SVG mesh network visualization mapping actual latitude/longitude locations on Doi Suthep with animated packet flows and node status color-codes.
*   **📊 Trend Analytics Charts:** Interactive 7-day and 30-day SVG line/area charts displaying historical environmental trends with tooltip cursor tracking.
*   **🗺️ RF Signal Coverage Map:** Geospatial projection display indicating signal radius ranges, warning of RF dead zones, and recommending optimal new node deployment locations.
*   **🚨 Multi-Level Emergency Alerts:**
    *   Flashing screen-wide alarm banners for critical events.
    *   Toast notifications with Web Audio API synthesizer siren sound alerts.
    *   Detailed Alert logs allowing Rangers to acknowledge incidents and submit resolution reports.
*   **🔑 Role-Based Access Control (RBAC):** Admin and Ranger roles secured via JSON Web Tokens (JWT) to calibrate sensors or change active node states.

---

## 🛠️ Tech Stack

### Backend
*   **Runtime:** Node.js (Express framework)
*   **Database:** MongoDB & Mongoose ORM
*   **Real-time:** Socket.io (WebSockets)
*   **Security:** JSON Web Tokens (JWT) & Bcrypt password hashing

### Frontend
*   **Framework:** React 18, TypeScript, Vite
*   **State Management:** Redux Toolkit
*   **Styling:** Tailwind CSS v4 & custom Glassmorphism UI
*   **Icons:** Lucide React

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
Ensure you have the following installed locally:
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB](https://www.mongodb.com/) (running instance)

### 2. Clone and Setup Environment
In the root directory of the project, create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mycelium
JWT_SECRET=super_secret_key_for_forest_guard
NODE_ENV=development
```

### 3. Install Dependencies
Install packages for both backend and frontend:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Run the Application

Start the backend server (automatically seeds the database with default users and Doi Suthep nodes if empty):
```bash
# Run from the root directory
npm run dev
```

Start the frontend development server:
```bash
# Run from the frontend directory
cd frontend
npm run dev
```

Run the IoT Telemetry Simulator (streams simulated environmental spikes, battery drains, and fire alerts to the server):
```bash
# Run from the root directory
npm run simulator
```

---

## 👥 Default Accounts (Seeded)

| Role | Username / Email | Password |
|---|---|---|
| **Administrator** | `admin@mycelium.org` | `admin123` |
| **Forest Ranger** | `ranger@mycelium.org` | `ranger123` |

---

## 📂 File Structure

```
/
├── src/
│   ├── config/          # DB connection & MongoDB seeder script
│   ├── controllers/     # Node status, Alert resolution, Auth, and Health controllers
│   ├── middleware/      # JWT auth guard
│   ├── models/          # Mongoose Schemas (User, SensorNode, Alert, RoutingEvent, Metrics)
│   ├── routes/          # API Endpoint routing definition
│   ├── index.js         # Main server entrypoint (Express + WebSockets)
│   └── simulator.js     # Standalone IoT telemetry sensor simulator script
├── frontend/
│   ├── src/
│   │   ├── components/  # Layouts, Alerts manager, Topology Graph, & Analytics charts
│   │   ├── store/       # Redux Toolkit store (user, nodes, alerts slices)
│   │   ├── hooks/       # useSocket custom hook
│   │   ├── App.tsx      # Main application page router
│   │   └── index.css    # Tailwind styles & global font sizes
│   └── vite.config.ts
├── ai-context.md        # AI workspace context tracker
└── README.md
```

---

## 🛡️ Core API Endpoints

### Authentication
*   `POST /api/auth/login` — Returns user profile details and JWT access token.

### Sensor Nodes
*   `GET /api/nodes` — Returns list of all sensor nodes.
*   `POST /api/nodes/:nodeId/telemetry` — Receives simulated sensor telemetry inputs.
*   `POST /api/nodes/:nodeId/recalibrate` — Recalibrates sensor sensors (requires login).
*   `PATCH /api/nodes/:nodeId/status` — Changes status (Active/Inactive/Dead) (requires login).

### Alert Log Manager
*   `GET /api/alerts/active` — Returns list of unresolved critical/warning events.
*   `GET /api/alerts/history` — Returns list of resolved alerts.
*   `POST /api/alerts/:alertId/acknowledge` — Acknowledges active alert.
*   `POST /api/alerts/:alertId/resolve` — Submits resolution report.
