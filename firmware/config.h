/**
 * Mycelium Sensors Network - ESP32 Node Configuration
 * File: firmware/config.h
 */

#ifndef CONFIG_H
#define CONFIG_H

#include <stdint.h>

// WiFi & ESP-NOW Config
#define WIFI_CHANNEL 1
#define SENSOR_BROADCAST_INTERVAL_MS 5000 // 5 seconds
#define HELLO_SPORE_INTERVAL_MS 10000     // 10 seconds for neighbor discovery

// Core Mycelium Weighting Parameters
const float ALPHA_ENERGY = 0.5f;   // Residual Battery weight (highest priority)
const float BETA_RSSI = 0.3f;      // Signal quality weight
const float GAMMA_DISTANCE = 0.2f; // Geodistance proximity weight

// Battery management thresholds
#define LOW_BATTERY_THRESHOLD 20   // Percentage
#define CRITICAL_BATTERY_LIMIT 10  // Deep sleep threshold (Duty Cycling)
#define DEEP_SLEEP_DURATION_SEC 300 // 5 minutes in deep sleep if depleted

// Sensor thresholds
#define TEMP_THRESHOLD_CRITICAL 45.0f // Celsius
#define SMOKE_THRESHOLD_CRITICAL 400  // MQ-2 ppm

// Broadcast MAC address (for ESP-NOW mesh spores)
static const uint8_t BroadcastMac[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Structure of telemetry payload (Data Link Layer packet format)
struct __attribute__((__packed__)) TelemetryPacket {
    char header[4];          // "MYCL"
    uint16_t senderId;       // Node identifier
    float temperature;       // DHT22 reading
    float humidity;          // DHT22 reading
    uint16_t smoke;          // MQ-2 smoke reading
    uint8_t battery;         // Charge percent (0-100)
    int8_t rssi;             // Signal strength of last hop
    uint8_t lqi;             // Link Quality Indicator
    uint32_t timestamp;      // Device uptime in ms
    uint16_t crc;            // Integrity check checksum
};

// Neighbor node structure
struct Neighbor {
    uint16_t nodeId;
    uint8_t macAddress[6];
    int8_t rssi;
    uint8_t battery;
    float weight;
    uint32_t lastSeen;
};

// Routing table entry structure
struct RouteEntry {
    uint16_t destinationId;
    uint16_t nextHopId;
    float pathWeight;
    uint8_t hopCount;
    bool isBackup;
};

#endif // CONFIG_H
