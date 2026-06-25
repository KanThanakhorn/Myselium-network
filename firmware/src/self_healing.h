/**
 * Self-Healing Routing - ESP32 Firmware
 * File: firmware/src/self_healing.h
 */

#ifndef SELF_HEALING_H
#define SELF_HEALING_H

#include "../config.h"
#include "neighbor_discovery.h"

// Check routing state and triggers dynamic rerouting if peer failure is detected
bool checkAndReroute(RouteEntry& currentRoute, Neighbor* neighbors, int neighborCount, float distanceToGateway);

// Checks if battery or signal levels require routing table update
bool shouldTriggerSelfHealing(uint8_t battery, int8_t rssi);

#endif // SELF_HEALING_H
