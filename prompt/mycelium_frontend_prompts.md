# Mycelium Dashboard - React Frontend Prompts

ใช้ Prompts เหล่านี้สำหรับการสร้าง React components และ UI

---

## 🎨 MAIN DASHBOARD LAYOUT

### 1️⃣ Dashboard Main Layout Component
```
Context: Building main admin dashboard for Mycelium forest fire detection system
Need a professional, real-time monitoring interface with multiple panels

Task: Create React component for main dashboard layout with:
1. Header: Logo, system status indicator (online/offline), user profile, settings
2. Left Sidebar Navigation: 
   - Overview
   - Alerts
   - Nodes & Status
   - Network Health
   - Analytics
   - Settings

3. Main Content Area: Dynamic content based on selected nav item
4. Real-time Status Bar: 
   - Active nodes count
   - Critical alerts count
   - Network uptime %
   - Average battery level

5. Quick Actions Bar: 
   - Acknowledge all alerts
   - Download report
   - System settings

Features needed:
- Responsive design (works on desktop, tablet, mobile)
- Collapsible sidebar
- Theme switcher (light/dark)
- Real-time WebSocket updates
- Loading states for data fetching

Use: React Router for navigation, Tailwind CSS or Material-UI for styling
Provide complete working component with Redux/Context for state management.
```

---

## 📊 CHARTS & VISUALIZATIONS

### 2️⃣ Real-Time Sensor Data Charts
```
Context: Dashboard needs to display live sensor readings
Sensors: Temperature, Humidity, Smoke density, PM2.5

Task: Create React chart component showing:
1. Multi-line chart: Temperature + Humidity over 24 hours
2. Area chart: Smoke detection over last 12 hours
3. Gauge charts: Current readings with threshold indicators
4. Alert zones: Red/orange/green backgrounds for normal/warning/critical ranges

Features:
- Auto-updates every 5 seconds from WebSocket
- Smooth animations when data updates
- Hover shows exact values
- Click to zoom into specific time range
- Toggle series on/off
- Export as PNG

Libraries: Chart.js, Recharts, or D3.js
Include: Responsive sizing, mobile-friendly, dark mode support

Provide complete component with data fetching from WebSocket.
```

### 3️⃣ Network Topology Graph Visualization
```
Context: Must visualize 100+ sensor nodes connected in mesh network
Show: Nodes, connections, signal strength, battery status

Task: Create interactive network graph:
1. Nodes represented as circles:
   - Green: Active, good battery
   - Yellow: Active, low battery
   - Red: Dead/offline
   - Size: Larger = higher battery %

2. Connections (edges) between nodes:
   - Solid line: Primary route
   - Dashed line: Backup route
   - Color: Green (strong signal) → Red (weak signal)
   - Thickness: Data flow volume

3. Interactive features:
   - Click node to see details panel
   - Drag to reposition nodes
   - Double-click to expand view
   - Highlight all paths for selected node
   - Show real-time data flow animation

4. Zoom and pan controls
5. Reset view button
6. Legend showing node states

Library: vis.js, cytoscape.js, or react-force-graph (better for large networks)
Include: Smooth animations, performance optimization for 100+ nodes
WebSocket updates: Node status changes animate in real-time

Provide complete interactive component with physics simulation for layout.
```

### 4️⃣ Battery Status Overview
```
Context: Track battery health of 100+ nodes
Critical for operational planning (when to change batteries)

Task: Create battery visualization:
1. Summary card showing:
   - Average battery level
   - Nodes with critical battery (< 20%)
   - Nodes with warning battery (20-50%)
   - Estimated days until next maintenance

2. Detailed list view:
   - Node ID | Current % | Depletion Rate | Days Remaining | Status
   - Sortable columns
   - Color-coded rows (green/yellow/red)
   - Filter: Show all / critical / warning

3. Chart: Battery depletion trend
   - Median battery level over 30 days
   - Projection: When will network die?
   - Highlight maintenance windows

4. Alerts:
   - Red badge when any node < 10%
   - Notification bell for low battery alerts

Use: Table component (react-table or ant-design table)
Include: Export as CSV, sorting, filtering, pagination

Provide complete component with real-time updates.
```

---

## 🚨 ALERT SYSTEM

### 5️⃣ Real-Time Alert Panel
```
Context: Fire detection alerts are critical - must be visible and actionable
Admin needs to see new alerts immediately

Task: Create alert notification system:
1. Alert Notification Toast:
   - Appears when new fire alert arrives
   - Color: Red (critical) / Orange (warning) / Blue (info)
   - Shows: Alert severity, location, sensor type, value
   - Audio alert for critical (configurable)
   - Auto-dismiss after 10s (or manual close)
   - Click to view full details

2. Alert List Panel:
   - Shows active alerts (sortable, filterable)
   - Columns: ID | Time | Severity | Location | Status | Action
   - Each row has "Acknowledge" button
   - Acknowledged alerts move to "Resolved"

3. Alert Details Modal:
   - Full alert info including:
     * Sensor readings at time of alert
     * Node that detected it
     * Coordinates (Lat/Lng)
     * Historical context (similar past alerts)
   - Buttons: Acknowledge | Escalate | Resolve | Close

4. Alert Timeline:
   - Show when alert started, acknowledged, resolved
   - Show ranger response timeline

Features:
- Real-time updates via WebSocket
- Sound notification for critical alerts
- Mobile push notification (if available)
- Auto-refresh every 5 seconds
- Batch acknowledge multiple alerts

Use: Toast library (react-toastify), Modal (react-modal)

Provide complete component with WebSocket event listeners.
```

### 6️⃣ Alert Filtering & Search
```
Context: With many alerts, admin needs to find specific ones quickly
Filter by: Severity, Date Range, Location, Node, Status

Task: Create alert search/filter component:
1. Quick filters (buttons):
   - Critical only
   - Unresolved only
   - Last 24h
   - This week

2. Advanced filters (form):
   - Date range picker
   - Severity level (critical/warning/info)
   - Location radius picker (on map)
   - Node ID search
   - Sensor type (temperature/smoke/pm25)

3. Search bar:
   - Search by alert ID
   - Search by location name
   - Search by node ID

4. Results:
   - Shows filtered alerts count
   - Sorts by date (newest first)
   - Shows/hides resolved alerts toggle

Features:
- Save custom filters as presets
- Export filtered results
- Share filter via URL (bookmarkable)
- Real-time result updates

Provide complete component with Redux state management.
```

---

## 📍 GEOSPATIAL FEATURES

### 7️⃣ Fire Incident Heat Map
```
Context: Show where fires have occurred historically
Identifies high-risk zones for preventive monitoring

Task: Create interactive heat map:
1. Base map (OpenStreetMap or Mapbox):
   - Show forest area
   - Node locations as blue dots

2. Heat layer:
   - Red zones: Frequent fires
   - Orange zones: Occasional fires
   - Cool zones: Rare fires
   - Intensity based on incident count

3. Incident markers:
   - Click incident to see details
   - Timeline slider to show incidents by date
   - Cluster markers when zoomed out

4. Analysis overlay:
   - Show fire hotspots (k-means clustering)
   - Risk zones highlighted
   - Suggest deployment of additional nodes

5. Controls:
   - Zoom in/out
   - Time range filter
   - Incident type filter
   - Heatmap intensity adjustment

Library: Leaflet or Mapbox GL JS with react-leaflet
Include: Performance optimization for 1000+ markers

Provide complete component with incident clustering algorithm.
```

### 8️⃣ Coverage Heatmap Visualization
```
Context: Show network signal coverage
Red zones = signal dead zones where nodes can't communicate

Task: Create signal strength heatmap:
1. Color-coded coverage map:
   - Green: Strong signal (RSSI > -50)
   - Yellow: Okay signal (RSSI -50 to -70)
   - Orange: Weak signal (RSSI -70 to -85)
   - Red: Dead zone (RSSI < -85)

2. Node overlay:
   - Blue dots: Sensor node locations
   - Circle around each: Signal coverage radius
   - Hover to see RSSI value

3. Dead zone identification:
   - Red polygon areas
   - Severity: High/Medium/Low
   - Recommended node placement suggestions

4. Signal quality matrix:
   - Table showing inter-node signal quality
   - Hover to highlight connection on map

5. Time-based changes:
   - Slider to show coverage at different times
   - Identify time-varying dead zones

Library: Leaflet heatmap or custom canvas rendering
Include: Real-time updates as RSSI data changes

Provide complete component.
```

---

## 📈 ANALYTICS

### 9️⃣ Historical Analytics Dashboard
```
Context: Admin wants to understand trends and patterns
Analyze: Temperature, smoke, humidity over weeks/months

Task: Create analytics page with:
1. Date range picker:
   - Preset buttons: Last 7 days, Last 30 days, Last year
   - Custom date range selector

2. Multi-metric charts:
   - Temperature trend (line chart)
   - Humidity trend
   - Smoke incidents (scatter plot showing fire events)
   - PM2.5 levels

3. Anomaly detection view:
   - Highlights unusual readings
   - Shows why it's anomalous
   - Links to incident if it caused an alert

4. Comparison view:
   - Compare same time periods from different months
   - Identify seasonal patterns

5. Export options:
   - Download as CSV
   - Generate PDF report
   - Share as link

6. Statistics summary:
   - Min/max/avg temperature
   - Fire frequency (incidents per week)
   - Most dangerous hours of day

Use: Chart.js or Recharts for charts, date-fns for date handling

Provide complete component with data aggregation logic.
```

### 🔟 System Health & Performance Metrics
```
Context: Operations team needs system status at a glance
Metrics: Uptime, packet loss, latency, node health, battery life

Task: Create system metrics dashboard:
1. KPI Cards (big numbers):
   - Network Uptime: 99.7%
   - Avg Latency: 245ms
   - Packet Loss: 0.3%
   - Active Nodes: 98/100
   - Avg Battery: 62%

2. Trend charts:
   - Uptime trend (last 30 days)
   - Latency trend
   - Packet loss trend
   - Active node count trend

3. Node distribution charts:
   - Pie chart: Nodes by status (active/inactive/dead)
   - Bar chart: Nodes by battery level (0-20%, 20-50%, 50-100%)

4. Health indicators:
   - Network lifetime: "8 days until maintenance needed"
   - Self-healing events: "5 events in last 24h"
   - Delivery success rate: "98.5%"

5. Alerts section:
   - Critical issues requiring attention
   - Warnings about degrading performance

Features:
- Auto-refresh every 30 seconds
- Configurable alert thresholds
- Historical comparison (vs last week/month)

Provide complete component with real-time data updates.
```

---

## ⚙️ SETTINGS & CONFIGURATION

### 1️⃣1️⃣ Configuration Management Interface
```
Context: Admins need to adjust system parameters without restarting
Thresholds: Temperature alert level, smoke threshold, PM2.5 limit

Task: Create settings page with:
1. Alert Threshold Configuration:
   - Temperature: Slider 20-50°C
   - Smoke concentration: Slider 0-500 ppm
   - PM2.5: Slider 0-300 µg/m³
   - Each with info box showing WHO recommendations
   - Save button with confirmation
   - Show notification when saved

2. Sensor Calibration:
   - Per-node offset adjustment
   - Temperature offset: -5 to +5°C
   - Smoke offset: -100 to +100
   - Test sensor before applying
   - Before/after comparison

3. User Management:
   - List of admin users with roles
   - Add new user form
   - Edit user permissions
   - Delete user with confirmation
   - Password reset functionality

4. API Keys:
   - List active API keys
   - Show key creation date, last used
   - Generate new key
   - Revoke key with confirmation
   - Copy to clipboard button

5. Data Management:
   - Export all data (CSV/JSON)
   - Download database backup
   - Delete old data (older than X days)
   - Data retention policy settings

6. System Settings:
   - Alert notification sound toggle
   - Dark mode toggle
   - Auto-refresh interval
   - Language selection
   - Timezone

Features:
- Confirmation dialogs for destructive actions
- Form validation
- Loading states
- Success/error notifications
- Audit log of configuration changes

Provide complete component with form handling.
```

---

## 🔐 AUTHENTICATION & USER MANAGEMENT

### 1️⃣2️⃣ Login & Authentication UI
```
Context: Secure access to sensitive forest fire monitoring data
Need: Login form, password reset, session management

Task: Create auth components:
1. Login Page:
   - Email/password form
   - Remember me checkbox
   - Forgot password link
   - Sign up link (if allowing new registrations)
   - Social login buttons (optional)
   - Branding/logo

2. Password Reset Flow:
   - Email input form
   - Verification code entry
   - New password form
   - Success confirmation

3. Session Management:
   - Show logged-in user info (email, role)
   - Logout button
   - Session timeout warning
   - Auto-logout after inactivity

4. User Profile:
   - View/edit profile info
   - Change password
   - Login history
   - Active sessions

Features:
- Form validation
- Loading states
- Error messages
- HTTPS enforcement
- Token refresh handling

Use: React Hook Form, axios for HTTP
Include: JWT token storage in secure httpOnly cookies

Provide complete auth flow components.
```

---

## 📱 RESPONSIVE & MOBILE

### 1️⃣3️⃣ Mobile-Responsive Design
```
Context: Admin might need to check dashboard on phone/tablet
Must work on: Desktop, Tablet, Mobile

Task: Ensure all components are responsive:
1. Desktop view (1920px+):
   - Sidebar + main content side-by-side
   - Full charts and detailed tables

2. Tablet view (768-1024px):
   - Collapsible sidebar
   - Stacked layout for some charts
   - Simplified tables

3. Mobile view (< 768px):
   - Full-screen sidebar (hamburger menu)
   - Single column layout
   - Touch-friendly buttons (48px minimum)
   - Simplified charts (mobile-optimized)
   - Bottom tab navigation

4. Touch optimizations:
   - Larger tap targets
   - Swipe gestures for navigation
   - Mobile keyboard considerations
   - Pinch-to-zoom for maps

Use: Tailwind CSS responsive classes or Material-UI breakpoints
Test: iPhone 12, iPad, Android phones

Provide audit of all components for mobile responsiveness.
```

---

## 🔄 STATE MANAGEMENT

### 1️⃣4️⃣ Redux Store Setup
```
Context: Multiple components need shared data
Data: Alerts, nodes, user session, real-time updates

Task: Create Redux store structure:
1. Slices:
   - alerts: { active, history, filters, loading }
   - nodes: { list, selectedNode, details, loading }
   - routing: { selfHealingEvents, paths, metrics }
   - user: { currentUser, role, authenticated, token }
   - ui: { sidebarOpen, darkMode, theme, notifications }

2. Async thunks:
   - fetchAlerts()
   - fetchNodes()
   - updateAlertStatus()
   - fetchSystemHealth()

3. Selectors:
   - selectActiveAlerts
   - selectCriticalAlerts
   - selectNodeById
   - selectUserRole

Features:
- Redux DevTools integration
- Error handling
- Loading states
- Normalized state structure

Use: Redux Toolkit (createSlice, createAsyncThunk)

Provide complete Redux setup with all slices.
```

---

## 🧪 TESTING

### 1️⃣5️⃣ Component Testing Setup
```
Context: Need to test React components for bugs
Testing: Alert notifications, data updates, user interactions

Task: Set up testing infrastructure:
1. Testing library: React Testing Library
2. Test framework: Jest
3. Mocking: Mock WebSocket, API calls

Create tests for:
1. Alert notification component:
   - Shows when new alert arrives
   - Correct colors for severity levels
   - Click behavior
   - Auto-dismiss after 10s

2. Network graph component:
   - Renders nodes correctly
   - Responds to node click
   - Updates when WebSocket data arrives
   - Handles empty data state

3. Chart component:
   - Renders with data
   - Updates on data change
   - Respects date range filter

Include:
- Setup files for test configuration
- Mock data factories
- Common test utilities
- CI/CD integration hints

Provide complete testing setup with example tests.
```

---

## 📦 BUILD & DEPLOYMENT

### 1️⃣6️⃣ Vite/React Build Configuration
```
Context: Need fast, optimized production build
Current: React with Tailwind CSS, Redux, Chart libraries

Task: Set up Vite build system:
1. Create vite.config.js:
   - React plugin
   - Environment variables
   - API proxy configuration
   - Build optimizations

2. Create .env files:
   - .env.development (local dev)
   - .env.production (production URLs)
   - .env.staging (staging URLs)

3. Add npm scripts:
   - npm run dev (dev server)
   - npm run build (production build)
   - npm run preview (preview build)
   - npm run lint (eslint)

4. Optimizations:
   - Code splitting
   - Image optimization
   - CSS minification
   - Bundle analysis

5. Environment setup:
   - API endpoint configuration
   - Feature flags
   - Analytics tracking ID

Include: Docker build instructions

Provide complete Vite configuration ready to use.
```

---

## 💡 USAGE GUIDE

### Quick Copy-Paste for VS Code

**Step 1**: Copy main prompt from "Main Dashboard Layout"
```
I'm building a React admin dashboard for Mycelium forest fire detection system.
[Paste prompt here]
```

**Step 2**: For specific features, copy individual prompts
```
For the Mycelium dashboard, I need:
[Paste specific component prompt]

Additional requirements:
- Use Tailwind CSS for styling
- Include TypeScript types
- Add real-time WebSocket support
- Include error boundaries
```

**Step 3**: Refine with follow-ups
```
The chart component works great! Now:
1. Add a time range picker above it
2. Make it work on mobile (responsive)
3. Add export as PNG functionality
```

---

## 🎯 COMPONENT PRIORITY ORDER

**Phase 1** (Week 1):
- Prompt 1: Main layout
- Prompt 5: Alert panel
- Prompt 14: Redux setup

**Phase 2** (Week 2):
- Prompt 2: Sensor charts
- Prompt 3: Network graph
- Prompt 4: Battery status

**Phase 3** (Week 3):
- Prompt 6: Alert filtering
- Prompt 9: Analytics
- Prompt 10: System metrics

**Phase 4** (Week 4):
- Prompt 7: Heat map
- Prompt 8: Coverage map
- Prompt 11: Configuration

**Phase 5** (Week 5):
- Prompt 12: Authentication
- Prompt 13: Mobile responsive
- Prompt 15: Testing

**Phase 6** (Week 6):
- Prompt 16: Build setup
- Final polish and deployment

---

## 🚀 RECOMMENDED APPROACH

1. **Start Simple**: Use Prompt 1 to get basic layout
2. **Add Real-time**: Integrate WebSocket in Prompt 5
3. **Build Interactive**: Implement Prompts 3 (graph) and 7 (map)
4. **Polish**: Add Prompt 13 (mobile) and Prompt 15 (tests)
5. **Deploy**: Use Prompt 16 for production build

Good luck! 🎉
