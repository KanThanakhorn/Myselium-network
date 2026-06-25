#!/usr/bin/env python3
"""
Mycelium Network Simulation: Algorithm Comparison
File: simulation/mycelium_routing.py

Compares:
1. Shortest Path Routing (static link optimization)
2. Mycelium Bio-inspired Routing (W_total = alpha*E + beta*RSSI + gamma*Dist)

Outputs:
- Energy depletion rate comparison
- Overall network lifetime improvement percentage (Goal: >= 20-30% improvement)
"""

import math
import random

# Simulation Parameters
NUM_NODES = 8
SIMULATION_STEPS = 1000
INITIAL_ENERGY = 100.0 # Battery percentage
BASE_TX_COST = 0.05    # Base energy drain per packet transmission
SIGNAL_FLUCTUATION = 5  # RSSI random variation range

# Node Coordinates (Doi Suthep)
NODE_POSITIONS = {
    1: (18.7902, 98.9562),  # Gateway
    2: (18.8015, 98.9482),
    3: (18.7991, 98.9488),
    4: (18.8112, 98.9205),
    5: (18.8023, 98.9502),
    6: (18.8048, 98.9219),
    7: (18.8055, 98.9540),
    8: (18.8090, 98.9350)
}

# Network Edges (Adjacency)
ADJACENCY = {
    1: [2, 3],
    2: [1, 5, 7],
    3: [1, 5],
    4: [6, 8],
    5: [2, 3, 7, 8],
    6: [4, 8],
    7: [2, 5, 8],
    8: [4, 5, 6, 7]
}

def get_distance(node_a, node_b):
    pos_a = NODE_POSITIONS[node_a]
    pos_b = NODE_POSITIONS[node_b]
    return math.sqrt((pos_a[0] - pos_b[0])**2 + (pos_a[1] - pos_b[1])**2)

class NetworkSimulation:
    def __init__(self, use_mycelium=True):
        self.use_mycelium = use_mycelium
        self.energies = {node: INITIAL_ENERGY for node in range(1, NUM_NODES + 1)}
        self.rssi_matrix = {}
        self.setup_rssi()

    def setup_rssi(self):
        for node in range(1, NUM_NODES + 1):
            self.rssi_matrix[node] = {}
            for neighbor in ADJACENCY.get(node, []):
                dist = get_distance(node, neighbor)
                # Map distance to simulated RSSI (-90 to -40 dBm)
                base_rssi = -40 - (dist * 1500)
                self.rssi_matrix[node][neighbor] = max(-95, min(-35, base_rssi))

    def get_route_weight(self, source, target):
        """
        Mycelium Weighting Function:
        W_total = (alpha * E_residual) + (beta * RSSI_reliability) + (gamma * D_proximity)
        """
        if self.energies[target] <= 0:
            return 0.0

        # Coefficients
        alpha = 0.5  # Energy Priority (high)
        beta = 0.3   # Signal reliability (medium)
        gamma = 0.2  # Proximity to gateway (low)

        # 1. Residual Energy: [0.0, 1.0]
        e_residual = self.energies[target] / 100.0

        # 2. RSSI Reliability: Maps -95dBm..-35dBm to [0.0, 1.0]
        rssi = self.rssi_matrix[source][target] + random.uniform(-SIGNAL_FLUCTUATION, SIGNAL_FLUCTUATION)
        rssi_reliability = (rssi + 95.0) / 60.0
        rssi_reliability = max(0.0, min(1.0, rssi_reliability))

        # 3. Proximity to gateway (node 1)
        dist_to_gateway = get_distance(target, 1)
        d_proximity = 1.0 / (1.0 + dist_to_gateway * 10)

        return (alpha * e_residual) + (beta * rssi_reliability) + (gamma * d_proximity)

    def find_path(self, start_node):
        """
        Finds route to Gateway (Node 1)
        """
        if start_node == 1:
            return [1]

        path = [start_node]
        current = start_node
        visited = {start_node}

        while current != 1:
            neighbors = ADJACENCY.get(current, [])
            active_neighbors = [n for n in neighbors if self.energies[n] > 0]
            
            if not active_neighbors:
                return None # Dead end / disconnected

            if self.use_mycelium:
                # Select neighbor maximizing weight
                best_neighbor = None
                max_weight = -1.0
                for n in active_neighbors:
                    weight = self.get_route_weight(current, n)
                    if weight > max_weight:
                        max_weight = weight
                        best_neighbor = n
                next_hop = best_neighbor
            else:
                # Shortest Path: Select neighbor closest to gateway by physical distance
                next_hop = min(active_neighbors, key=lambda n: get_distance(n, 1))

            if next_hop in visited:
                return None # Routing loop protection
            
            path.append(next_hop)
            current = next_hop
            visited.add(next_hop)

        return path

    def run_step(self):
        # Trigger packet sends from all non-gateway active nodes
        active_nodes = [node for node in range(2, NUM_NODES + 1) if self.energies[node] > 0]
        
        for node in active_nodes:
            path = self.find_path(node)
            if path:
                # Deduct transmission cost for each hop along path
                for hop in path[:-1]:
                    self.energies[hop] -= BASE_TX_COST * 1.2
                # Deduct reception cost
                for hop in path[1:]:
                    self.energies[hop] -= BASE_TX_COST * 0.8

def run_simulation_comparison():
    print("=" * 60)
    print("🚀 Starting Comparative Mycelium Network Simulation")
    print("=" * 60)

    # 1. Simulate Shortest Path routing
    sim_sp = NetworkSimulation(use_mycelium=False)
    sp_steps = 0
    sp_nodes_alive = NUM_NODES
    first_death_step_sp = SIMULATION_STEPS
    first_death_step_myc = SIMULATION_STEPS
    
    while sp_steps < SIMULATION_STEPS:
        sim_sp.run_step()
        alive = sum(1 for node in sim_sp.energies if sim_sp.energies[node] > 0)
        # Check if first node died
        if alive < NUM_NODES and sp_nodes_alive == NUM_NODES:
            first_death_step_sp = sp_steps
            sp_nodes_alive = alive
        
        # Stop simulation if network is completely disconnected (Gateway loses all connections)
        connections = [n for n in ADJACENCY[1] if sim_sp.energies[n] > 0]
        if not connections:
            break
        sp_steps += 1

    # 2. Simulate Mycelium Bio-inspired routing
    sim_myc = NetworkSimulation(use_mycelium=True)
    myc_steps = 0
    myc_nodes_alive = NUM_NODES

    while myc_steps < SIMULATION_STEPS:
        sim_myc.run_step()
        alive = sum(1 for node in sim_myc.energies if sim_myc.energies[node] > 0)
        if alive < NUM_NODES and myc_nodes_alive == NUM_NODES:
            first_death_step_myc = myc_steps
            myc_nodes_alive = alive
            
        connections = [n for n in ADJACENCY[1] if sim_myc.energies[n] > 0]
        if not connections:
            break
        myc_steps += 1

    # Calculate metrics
    lifetime_increase = ((myc_steps - sp_steps) / sp_steps) * 100.0
    first_death_improvement = ((first_death_step_myc - first_death_step_sp) / first_death_step_sp) * 100.0

    print(f"\n📊 RESULTS SUMMARY:")
    print(f"{"Routing Protocol":<25} | {"Time Steps to Failure":<25} | {"First Node Depletion Step":<25}")
    print("-" * 80)
    print(f"{"Shortest-Path (Static)":<25} | {sp_steps:<25} | {first_death_step_sp:<25}")
    print(f"{"Mycelium Weighting":<25} | {myc_steps:<25} | {first_death_step_myc:<25}")
    print("-" * 80)
    print(f"✅ Network Lifetime Extension: {lifetime_increase:.2f}%")
    print(f"✅ First Node Longevity Improvement: {first_death_improvement:.2f}%")
    print("-" * 80)
    print(f"Verdict: Mycelium algorithm achieves a {lifetime_increase:.1f}% increase in total mesh lifetime")
    print(f"by dynamically sharing routing workloads and avoiding hot-spot battery drain.")
    print("=" * 60)

if __name__ == "__main__":
    run_simulation_comparison()
