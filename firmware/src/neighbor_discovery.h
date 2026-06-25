/**
 * Neighbor Discovery Module - ESP32 Firmware
 * File: firmware/src/neighbor_discovery.h
 */

#ifndef NEIGHBOR_DISCOVERY_H
#define NEIGHBOR_DISCOVERY_H

#include "../config.h"

#define MAX_NEIGHBORS 16

// Global neighbor table
extern Neighbor neighborTable[MAX_NEIGHBORS];
extern int neighborCount;

// Initializes ESP-NOW and neighbor tables
void initNeighborDiscovery();

// Broadcasts Hello spore packet to announce presence to neighbors
void broadcastHelloSpore(uint16_t nodeId, uint8_t battery);

// Processes incoming packets to update or add neighbors dynamically
void handleIncomingSpore(const uint8_t* macAddr, uint16_t nodeId, int8_t rssi, uint8_t battery);

// Cleans up stale neighbors (devices that have timed out / gone offline)
void purgeStaleNeighbors(uint32_t timeoutMs);

#endif // NEIGHBOR_DISCOVERY_H
