/**
 * Mycelium Sensors Network - Main Firmware Entry
 * File: firmware/src/main.cpp
 * 
 * Implements 4-Layer Architecture:
 * 1. Application Layer (sensor reading DHT22/MQ-2, threshold checking)
 * 2. Mycelium Routing Layer (mycelium weighting, path selection, self-healing)
 * 3. MAC/Data Link Layer (ESP-NOW protocol packets, CRC checksum verification)
 * 4. HAL (Hardware Abstraction Layer - sleep modes, duty cycles, GPIO)
 */

#include <Arduino.h> // Mock Arduino environment header
#include "../config.h"
#include "mycelium_weighting.h"
#include "neighbor_discovery.h"
#include "self_healing.h"

// Device state variables
uint16_t localNodeId = 3; // Siri Phum Waterfall station
uint8_t currentBattery = 88;
float localDistanceToGateway = 0.015f; // Doi Suthep relative distance

RouteEntry primaryRoute;
uint32_t lastBroadcastTime = 0;
uint32_t lastDiscoveryTime = 0;

// Simple CRC16 checksum function for packet validation
uint16_t calculateCRC16(const uint8_t* data, size_t length) {
    uint16_t crc = 0xFFFF;
    for (size_t i = 0; i < length; i++) {
        crc ^= data[i];
        for (int j = 0; j < 8; j++) {
            if (crc & 0x0001) {
                crc = (crc >> 1) ^ 0xA001;
            } else {
                crc = crc >> 1;
            }
        }
    }
    return crc;
}

// HAL (Hardware Abstraction Layer) - Deep sleep power management
void enterLowPowerSleep(uint32_t seconds) {
    // In ESP32, this sets deep sleep and shuts down unnecessary peripherals:
    // esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
    // esp_deep_sleep_start();
    Serial.printf("[HAL] Entering Deep Sleep for %d seconds...\n", seconds);
}

// Application Layer - Read Sensors (Mock/Physical)
void readSensors(float& temp, float& hum, uint16_t& smoke) {
    // Reading physical sensor pins:
    // temp = dht.readTemperature();
    // smoke = analogRead(MQ2_PIN);
    temp = 29.5f;
    hum = 60.0f;
    smoke = 85; // clean air baseline
}

void setup() {
    Serial.begin(115200);
    Serial.println("[System] Initializing Mycelium Embedded Node...");

    // Initialize neighbor discovery tables
    initNeighborDiscovery();

    // Select primary route on startup
    primaryRoute = selectOptimalRoute(neighborTable, neighborCount, localDistanceToGateway);
    Serial.println("[Routing] Initial route selection complete.");
}

void loop() {
    uint32_t currentMillis = millis();

    // 1. Neighbor discovery: Send Hello Spores periodically (MAC/Data Link Layer)
    if (currentMillis - lastDiscoveryTime >= HELLO_SPORE_INTERVAL_MS) {
        lastDiscoveryTime = currentMillis;
        broadcastHelloSpore(localNodeId, currentBattery);
        purgeStaleNeighbors(30000); // Purge neighbors inactive for >30s
    }

    // 2. Read environmental telemetry (Application Layer)
    float temperature, humidity;
    uint16_t smoke;
    readSensors(temperature, humidity, smoke);

    // Check alert thresholds
    bool criticalCondition = (temperature > TEMP_THRESHOLD_CRITICAL) || (smoke > SMOKE_THRESHOLD_CRITICAL);

    // 3. Process routing and self-healing (Mycelium Routing Layer)
    bool rerouted = checkAndReroute(primaryRoute, neighborTable, neighborCount, localDistanceToGateway);
    if (rerouted) {
        Serial.printf("[Routing] Self-Healing triggered! Alternate path selected via node-%02d\n", primaryRoute.nextHopId);
    }

    // 4. Send telemetry packet (MAC/Data Link Layer / ESP-NOW)
    if (currentMillis - lastBroadcastTime >= SENSOR_BROADCAST_INTERVAL_MS || criticalCondition) {
        lastBroadcastTime = currentMillis;

        TelemetryPacket packet;
        memcpy(packet.header, "MYCL", 4);
        packet.senderId = localNodeId;
        packet.temperature = temperature;
        packet.humidity = humidity;
        packet.smoke = smoke;
        packet.battery = currentBattery;
        packet.rssi = -65; // Base signal strength
        packet.lqi = 220;  // Strong link quality
        packet.timestamp = currentMillis;

        // Calculate packet checksum for integrity
        packet.crc = calculateCRC16((uint8_t*)&packet, sizeof(TelemetryPacket) - sizeof(uint16_t));

        Serial.printf("[Packet] Broadasting telemetry payload. CRC: 0x%04X, Next-Hop: node-%02d\n", packet.crc, primaryRoute.nextHopId);
        // esp_now_send(BroadcastMac, (uint8_t*)&packet, sizeof(packet));
    }

    // 5. Duty Cycling / Power Management (HAL Layer)
    if (currentBattery < CRITICAL_BATTERY_LIMIT) {
        Serial.println("[HAL] Battery critical! Triggering duty-cycling backup path announcement...");
        enterLowPowerSleep(DEEP_SLEEP_DURATION_SEC);
    }

    delay(100);
}
