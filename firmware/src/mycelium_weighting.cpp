/**
 * Mycelium Weighting Algorithm - ESP32 Firmware
 * File: firmware/src/mycelium_weighting.cpp
 */

#include "mycelium_weighting.h"
#include <math.h>

/**
 * Computes Mycelium weight using the specified mathematical formula:
 * W_total = (alpha * E_residual) + (beta * RSSI_reliability) + (gamma * D_proximity)
 */
float computeNodeWeight(uint8_t battery, int8_t rssi, float distanceToGateway) {
    // 1. Residual Energy: [0.0, 1.0]
    float eResidual = (float)battery / 100.0f;
    if (eResidual < 0.0f) eResidual = 0.0f;
    if (eResidual > 1.0f) eResidual = 1.0f;

    // 2. RSSI Reliability: Maps -100dBm to -30dBm into [0.0, 1.0]
    float rssiReliability = ((float)rssi + 100.0f) / 70.0f;
    if (rssiReliability < 0.0f) rssiReliability = 0.0f;
    if (rssiReliability > 1.0f) rssiReliability = 1.0f;

    // 3. Proximity to gateway: Inverse distance scaling
    float dProximity = 1.0f / (1.0f + distanceToGateway);

    // Sum weights
    float weight = (ALPHA_ENERGY * eResidual) + 
                   (BETA_RSSI * rssiReliability) + 
                   (GAMMA_DISTANCE * dProximity);
                   
    return weight;
}

/**
 * Selects the optimal route from neighbors based on computed weights.
 * Loops through neighbor list, performs selection, and assigns backup path.
 */
RouteEntry selectOptimalRoute(Neighbor* neighbors, int neighborCount, float distanceToGateway) {
    RouteEntry route;
    route.destinationId = 1; // Gateway node
    route.nextHopId = 0;
    route.pathWeight = -1.0f;
    route.hopCount = 0;
    route.isBackup = false;

    int bestIndex = -1;
    int backupIndex = -1;
    float maxWeight = -1.0f;
    float secondMaxWeight = -1.0f;

    for (int i = 0; i < neighborCount; i++) {
        // Calculate weight for neighbor
        neighbors[i].weight = computeNodeWeight(neighbors[i].battery, neighbors[i].rssi, distanceToGateway);

        // Find primary neighbor (highest weight)
        if (neighbors[i].weight > maxWeight) {
            secondMaxWeight = maxWeight;
            backupIndex = bestIndex;

            maxWeight = neighbors[i].weight;
            bestIndex = i;
        } 
        // Find backup neighbor (second highest weight)
        else if (neighbors[i].weight > secondMaxWeight) {
            secondMaxWeight = neighbors[i].weight;
            backupIndex = i;
        }
    }

    if (bestIndex != -1) {
        route.nextHopId = neighbors[bestIndex].nodeId;
        route.pathWeight = maxWeight;
        route.hopCount = 1; // Direct peer distance
    }

    return route;
}
