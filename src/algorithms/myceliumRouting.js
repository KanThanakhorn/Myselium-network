/**
 * Mycelium Routing Engine
 * Implements bio-inspired dynamic weighting and self-healing multi-hop routing.
 * 
 * Formula: W_total = (alpha * E_residual) + (beta * RSSI_reliability) + (gamma * D_proximity)
 */

const alpha = 0.5; // Residual Energy (priority)
const beta = 0.3;  // Signal reliability
const gamma = 0.2; // Data Proximity to gateway

// Predefined physical neighbor links (potential graph edges)
const ADJACENCY_LIST = {
  'node-01': ['node-02', 'node-03'],
  'node-02': ['node-01', 'node-05', 'node-07'],
  'node-03': ['node-01', 'node-05'],
  'node-04': ['node-06', 'node-08'],
  'node-05': ['node-02', 'node-03', 'node-07', 'node-08'],
  'node-06': ['node-04', 'node-08'],
  'node-07': ['node-02', 'node-05', 'node-08'],
  'node-08': ['node-04', 'node-05', 'node-06', 'node-07']
};

// Latitude/Longitude of Doi Suthep Gateway (node-01)
const GATEWAY_COORDS = { lat: 18.7902, lng: 98.9562 };

/**
 * Calculates Euclidean distance between two coordinate objects
 */
function getDistance(c1, c2) {
  if (!c1 || !c2) return 0.05;
  return Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
}

/**
 * Calculates Mycelium weight for a target node
 */
function calculateNodeWeight(node) {
  // If node is offline, weight is 0
  if (node.status === 'dead' || node.status === 'inactive') {
    return 0;
  }

  // 1. Residual Energy (0 to 1)
  const eResidual = Math.max(0, Math.min(100, node.battery)) / 100;

  // 2. RSSI Reliability (0 to 1)
  // Standard RSSI range in simulator: -100 to -30 dBm
  const rssiVal = node.sensors?.rssi || node.rssi || -75;
  const rssiReliability = Math.max(0, Math.min(1, (rssiVal + 100) / 70));

  // 3. Proximity to gateway (0 to 1)
  const dist = getDistance(node.location, GATEWAY_COORDS);
  const dProximity = 1 / (1 + dist * 10); // scale factor

  // Weighted sum
  const weight = (alpha * eResidual) + (beta * rssiReliability) + (gamma * dProximity);
  return Math.max(0.01, weight); // minimum baseline weight to prevent log(0)
}

/**
 * Dijkstra's algorithm to calculate optimal paths maximizing product of link weights
 * Equivalent to minimizing sum of cost = -log(weight)
 */
function calculateDynamicRoutes(nodes) {
  const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));
  
  // Calculate weights for all active nodes
  const weights = {};
  nodes.forEach(node => {
    weights[node.nodeId] = calculateNodeWeight(node);
  });

  const costs = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize
  nodes.forEach(node => {
    costs[node.nodeId] = Infinity;
    previous[node.nodeId] = null;
    unvisited.add(node.nodeId);
  });

  // Gateway node-01 has 0 cost to reach itself
  costs['node-01'] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with lowest cost
    let currentNodeId = null;
    let minCost = Infinity;

    for (const nodeId of unvisited) {
      if (costs[nodeId] < minCost) {
        minCost = costs[nodeId];
        currentNodeId = nodeId;
      }
    }

    if (currentNodeId === null) break; // Remaining nodes unreachable

    unvisited.delete(currentNodeId);

    // Get physical neighbors
    const neighbors = ADJACENCY_LIST[currentNodeId] || [];
    for (const neighborId of neighbors) {
      if (!unvisited.has(neighborId)) continue;

      const neighborNode = nodeMap.get(neighborId);
      if (!neighborNode || neighborNode.status === 'dead' || neighborNode.status === 'inactive') {
        continue; // Bypassing dead/inactive node (Self-Healing)
      }

      // Cost of link is -log(weight of target neighbor)
      const linkCost = -Math.log(weights[neighborId]);
      const alternatePathCost = costs[currentNodeId] + linkCost;

      if (alternatePathCost < costs[neighborId]) {
        costs[neighborId] = alternatePathCost;
        previous[neighborId] = currentNodeId;
      }
    }
  }

  // Construct final paths from previous pointers
  const routes = {};
  nodes.forEach(node => {
    if (node.nodeId === 'node-01') {
      routes[node.nodeId] = ['node-01'];
      return;
    }

    const path = [];
    let curr = node.nodeId;
    while (curr) {
      path.push(curr);
      curr = previous[curr];
    }
    // Check if path actually reaches the gateway node-01
    if (path[path.length - 1] === 'node-01') {
      routes[node.nodeId] = path;
    } else {
      routes[node.nodeId] = []; // Disconnected
    }
  });

  // Convert routes into link edges for SVG topology rendering
  const activeLinks = [];
  Object.keys(routes).forEach(nodeId => {
    const path = routes[nodeId];
    if (path.length > 1) {
      // Create link edges along the multi-hop path
      for (let i = 0; i < path.length - 1; i++) {
        const source = path[i];
        const target = path[i + 1];
        
        // Avoid duplicate links
        const exists = activeLinks.some(l => l.source === source && l.target === target);
        if (!exists) {
          activeLinks.push({
            source,
            target,
            type: 'primary'
          });
        }
      }
    }
  });

  // For any nodes that lost connection, check if a backup path can be formed
  // to satisfy visual backup paths
  nodes.forEach(node => {
    if (node.nodeId === 'node-01') return;
    const path = routes[node.nodeId];
    if (path && path.length === 0) {
      // Node is disconnected from primary route. Let's find neighbors
      const neighbors = ADJACENCY_LIST[node.nodeId] || [];
      neighbors.forEach(nId => {
        const neighborNode = nodeMap.get(nId);
        if (neighborNode && neighborNode.status !== 'dead' && neighborNode.status !== 'inactive') {
          activeLinks.push({
            source: node.nodeId,
            target: nId,
            type: 'backup'
          });
        }
      });
    }
  });

  return {
    routes,
    activeLinks,
    weights
  };
}

module.exports = {
  calculateNodeWeight,
  calculateDynamicRoutes
};
