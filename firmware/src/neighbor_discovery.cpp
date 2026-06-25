/**
 * Neighbor Discovery Module - ESP32 Firmware
 * File: firmware/src/neighbor_discovery.cpp
 */

#include "neighbor_discovery.h"
#include <string.h>

Neighbor neighborTable[MAX_NEIGHBORS];
int neighborCount = 0;

void initNeighborDiscovery() {
    neighborCount = 0;
    memset(neighborTable, 0, sizeof(neighborTable));
}

void broadcastHelloSpore(uint16_t nodeId, uint8_t battery) {
    // Mock simulation code of ESP-NOW broadcast
    // In a physical ESP32 implementation, this initiates an ESP-NOW broadcast:
    // esp_now_send(BroadcastMac, (uint8_t*)&packet, sizeof(packet));
}

void handleIncomingSpore(const uint8_t* macAddr, uint16_t nodeId, int8_t rssi, uint8_t battery) {
    // Check if neighbor already exists in table
    int index = -1;
    for (int i = 0; i < neighborCount; i++) {
        if (neighborTable[i].nodeId == nodeId) {
            index = i;
            break;
        }
    }

    if (index != -1) {
        // Update existing neighbor
        neighborTable[index].rssi = rssi;
        neighborTable[index].battery = battery;
        neighborTable[index].lastSeen = 0; // Reset lastSeen tick count
        memcpy(neighborTable[index].macAddress, macAddr, 6);
    } else {
        // Add new neighbor if capacity allows
        if (neighborCount < MAX_NEIGHBORS) {
            neighborTable[neighborCount].nodeId = nodeId;
            neighborTable[neighborCount].rssi = rssi;
            neighborTable[neighborCount].battery = battery;
            neighborTable[neighborCount].lastSeen = 0;
            memcpy(neighborTable[neighborCount].macAddress, macAddr, 6);
            neighborTable[neighborCount].weight = 0.0f;
            neighborCount++;
        }
    }
}

void purgeStaleNeighbors(uint32_t timeoutMs) {
    // Remove neighbors that haven't sent HELLO packets within the timeout window
    for (int i = 0; i < neighborCount; ) {
        if (neighborTable[i].lastSeen > timeoutMs) {
            // Shift table elements left
            for (int j = i; j < neighborCount - 1; j++) {
                neighborTable[j] = neighborTable[j + 1];
            }
            neighborCount--;
        } else {
            neighborTable[i].lastSeen += HELLO_SPORE_INTERVAL_MS;
            i++;
        }
    }
}
