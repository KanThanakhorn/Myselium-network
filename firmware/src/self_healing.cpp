/**
 * Self-Healing Routing - ESP32 Firmware
 * File: firmware/src/self_healing.cpp
 */

#include "self_healing.h"
#include "mycelium_weighting.h"

/**
 * Event-driven self-healing detection.
 * If the current next-hop node fails to respond (stale/disconnected),
 * we dynamically trigger re-routing to select an alternative path.
 */
bool checkAndReroute(RouteEntry& currentRoute, Neighbor* neighbors, int neighborCount, float distanceToGateway) {
    bool rerouted = false;

    // Check if the current next hop is still active in neighbor table
    bool nextHopActive = false;
    int nextHopIndex = -1;
    
    for (int i = 0; i < neighborCount; i++) {
        if (neighbors[i].nodeId == currentRoute.nextHopId) {
            nextHopActive = true;
            nextHopIndex = i;
            break;
        }
    }

    // Trigger self-healing if next hop node is offline, battery depleted, or signal lost
    if (!nextHopActive || neighbors[nextHopIndex].battery <= CRITICAL_BATTERY_LIMIT || neighbors[nextHopIndex].rssi < -90) {
        // Dynamic re-routing: calculate new path from scratch from neighbors
        RouteEntry newRoute = selectOptimalRoute(neighbors, neighborCount, distanceToGateway);
        
        if (newRoute.nextHopId != currentRoute.nextHopId) {
            currentRoute = newRoute;
            currentRoute.isBackup = true; // Mark as backup reroute path
            rerouted = true;
        }
    }

    return rerouted;
}

/**
 * Duty cycling / battery aware triggers.
 * Determines if node should broadcast routing changes due to own local health drop.
 */
bool shouldTriggerSelfHealing(uint8_t battery, int8_t rssi) {
    if (battery < LOW_BATTERY_THRESHOLD) {
        return true;
    }
    if (rssi < -85) {
        return true;
    }
    return false;
}
