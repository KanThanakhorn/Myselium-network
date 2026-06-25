/**
 * Mycelium Weighting Algorithm - ESP32 Firmware
 * File: firmware/src/mycelium_weighting.h
 */

#ifndef MYCELIUM_WEIGHTING_H
#define MYCELIUM_WEIGHTING_H

#include "../config.h"

// Computes the node reliability/routing weight based on its current metrics
float computeNodeWeight(uint8_t battery, int8_t rssi, float distanceToGateway);

// Selects the optimal route (Next Hop) from the neighbor table
RouteEntry selectOptimalRoute(Neighbor* neighbors, int neighborCount, float distanceToGateway);

#endif // MYCELIUM_WEIGHTING_H
