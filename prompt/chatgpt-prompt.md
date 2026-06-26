# Align the Dashboard with the Mycelium Forest Network Proposal

The current dashboard has evolved into a polished monitoring platform, but it should more clearly demonstrate the core objectives of the Mycelium Forest Network project.

The goal of this refactor is **not to redesign the application**, but to make the implemented system better reflect the proposal and the core Mycelium routing concepts while preserving all existing functionality.

---

# Primary Objective

Transform the dashboard from a generic monitoring dashboard into a **Mycelium Routing Demonstration Platform**.

The dashboard should clearly communicate:

* How the routing algorithm works
* Why a routing path is selected
* How the network heals itself
* How battery-aware routing improves network lifetime
* How packets travel through the mesh network

These concepts should be immediately understandable to judges and users.

---

# 1. Mycelium Routing Visualization

The dashboard should expose the routing algorithm instead of hiding it.

For every routing decision, visualize:

* Current Primary Path
* Backup Path
* Next Hop
* Selected Node
* Candidate Nodes
* Weight Score
* Battery Contribution
* RSSI Contribution
* Distance Contribution

Users should understand why one node is selected over another.

Do not simply display the final path.

Display the decision-making process.

---

# 2. Weight Calculation Panel

Introduce a dedicated routing information panel showing:

* Node ID
* Battery %
* RSSI/LQI
* Distance
* Total Weight
* Selection Status

Highlight the currently selected next-hop.

If possible, visualize the weighting formula step-by-step.

The dashboard should emphasize that routing is Energy-Aware.

---

# 3. Self-Healing Demonstration

The proposal emphasizes self-healing routing.

Improve the simulator so users can clearly observe:

1. Node Failure
2. Broken Route
3. Route Recalculation
4. Backup Route Selection
5. Traffic Recovery

Provide smooth visual transitions or animations to demonstrate the rerouting process.

The self-healing process should be one of the most visible features of the application.

---

# 4. Network Flow Animation

Visualize packet movement through the network.

Packets should appear to travel from node to node using the currently selected route.

When rerouting occurs, packet animations should automatically follow the newly selected path.

Avoid static topology graphs whenever possible.

---

# 5. Neighbor Discovery Visualization

Expose the Neighbor Discovery process.

Display information such as:

* Neighbor Count
* RSSI Values
* LQI Values
* Last Discovery Time
* Neighbor Table

Users should understand how each node discovers nearby nodes.

---

# 6. Routing Table View

Add a routing information panel displaying:

* Destination Node
* Primary Path
* Backup Path
* Current Next Hop
* Weight Score
* Route Status

Update this table in real time as the simulator changes.

---

# 7. Explain Routing Decisions

Whenever a path changes, provide a concise explanation.

Examples:

* Node 7 selected because it has the highest weight score.
* Node 5 avoided due to low battery.
* Node 3 removed after connection timeout.
* Backup path promoted after primary route failure.

The system should explain its behavior instead of only showing visual changes.

---

# 8. Improve Dashboard Hierarchy

The most important information should be:

1. Critical Alerts
2. Fire Detection Events
3. Network Health
4. Current Routing Status
5. Active Packet Flow
6. Sensor Status
7. Analytics

Reduce emphasis on decorative UI elements.

Prioritize operational awareness.

---

# 9. KPI Improvements

Only display KPI cards that are backed by existing application data.

Possible examples:

* Active Alerts
* Online Nodes
* Offline Nodes
* Average Battery
* Current Active Routes
* Packet Delivery Success
* Network Health

Do not fabricate metrics or display placeholder values.

---

# 10. Topology Improvements

Improve the topology graph by clearly distinguishing:

* Active Nodes
* Offline Nodes
* Gateway
* Primary Route
* Backup Route
* Packet Direction
* Active Data Flow

The topology should communicate routing behavior rather than acting as a static network diagram.

---

# 11. Theme Consistency

Maintain all previous UX/UI improvements.

Ensure that:

* Light Mode
* Dark Mode
* Charts
* Topology
* Routing Visualization
* Tables
* Tooltips
* Modals

remain fully theme-aware and readable.

---

# 12. Constraints

Do NOT change:

* Business logic
* Redux store structure
* Existing simulator architecture
* Existing routing algorithm behavior

Only improve:

* Visualization
* UX
* UI
* Information hierarchy
* Theme consistency
* Routing explainability

---

# Expected Outcome

After this refactor, the dashboard should clearly demonstrate:

* Mycelium-inspired routing
* Energy-aware routing decisions
* Neighbor discovery
* Dynamic route selection
* Self-healing behavior
* Packet forwarding
* Forest fire monitoring

The application should feel like a professional research prototype and effectively communicate the innovation of the Mycelium Forest Network project during demonstrations and presentations.
