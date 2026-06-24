import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SensorNode, SystemMetrics } from '../../types';

// Mock Chiang Mai Forest nodes (Doi Suthep - Pui National Park coordinates)
const mockNodes: SensorNode[] = [
  {
    _id: 'n1',
    nodeId: 'node-01',
    location: { lat: 18.8021, lng: 98.9215 },
    status: 'active',
    battery: 89,
    maxBattery: 100,
    rssi: -45,
    lqi: 240,
    sensors: { temp: 28.4, humidity: 62.1, smoke: 85, pm25: 18 },
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-01-10', location_name: 'Doi Suthep Peak Station' }
  },
  {
    _id: 'n2',
    nodeId: 'node-02',
    location: { lat: 18.8054, lng: 98.9262 },
    status: 'active',
    battery: 74,
    maxBattery: 100,
    rssi: -58,
    lqi: 210,
    sensors: { temp: 29.1, humidity: 59.8, smoke: 110, pm25: 22 },
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-01-12', location_name: 'Bhubing Palace West Ridge' }
  },
  {
    _id: 'n3',
    nodeId: 'node-03',
    location: { lat: 18.7991, lng: 98.9318 },
    status: 'active',
    battery: 15, // Low battery warning
    maxBattery: 100,
    rssi: -72,
    lqi: 175,
    sensors: { temp: 31.5, humidity: 55.4, smoke: 120, pm25: 25 },
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-01-12', location_name: 'Huay Kaew Waterfall Overlook' }
  },
  {
    _id: 'n4',
    nodeId: 'node-04',
    location: { lat: 18.8112, lng: 98.9205 },
    status: 'active',
    battery: 92,
    maxBattery: 100,
    rssi: -38,
    lqi: 250,
    sensors: { temp: 27.2, humidity: 68.0, smoke: 70, pm25: 12 },
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-02-05', location_name: 'North Forest Fire Watchtower' }
  },
  {
    _id: 'n5',
    nodeId: 'node-05',
    location: { lat: 18.8023, lng: 98.9502 },
    status: 'active',
    battery: 62,
    maxBattery: 100,
    rssi: -82,
    lqi: 140,
    sensors: { temp: 42.5, humidity: 32.1, smoke: 480, pm25: 150 }, // Critical reading (fire)
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-02-10', location_name: 'Doi Pui Campsite East' }
  },
  {
    _id: 'n6',
    nodeId: 'node-06',
    location: { lat: 18.7942, lng: 98.9150 },
    status: 'inactive',
    battery: 0, // Dead node
    maxBattery: 100,
    rssi: -100,
    lqi: 0,
    sensors: { temp: 0, humidity: 0, smoke: 0, pm25: 0 },
    lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    metadata: { deployedDate: '2026-01-10', location_name: 'Siri Bhum Waterfall Trail' }
  },
  {
    _id: 'n7',
    nodeId: 'node-07',
    location: { lat: 18.8077, lng: 98.9102 },
    status: 'active',
    battery: 51,
    maxBattery: 100,
    rssi: -66,
    lqi: 190,
    sensors: { temp: 30.2, humidity: 57.5, smoke: 98, pm25: 20 },
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-02-15', location_name: 'Chang Khian Hmong Village' }
  },
  {
    _id: 'n8',
    nodeId: 'node-08',
    location: { lat: 18.8055, lng: 98.9540 },
    status: 'active',
    battery: 68,
    maxBattery: 100,
    rssi: -78,
    lqi: 155,
    sensors: { temp: 38.5, humidity: 41.2, smoke: 220, pm25: 75 }, // Warning (smoke/temp)
    lastUpdate: new Date().toISOString(),
    metadata: { deployedDate: '2026-02-15', location_name: 'Pha Lat Temple Trail' }
  }
];

const initialMetrics: SystemMetrics = {
  networkUptime: 99.7,
  packetLossRate: 0.3,
  avgLatencyMs: 245,
  activeNodeCount: 7,
  deadNodeCount: 1,
  avgBatteryPercent: 64,
  estimatedNetworkLifetimeDays: 8,
  lastUpdate: new Date().toISOString(),
  alerts: { critical: 1, warning: 1, info: 0 },
  routing: { selfHealingEventsLast24h: 3, deliverySuccessRate: 98.5 }
};

interface NodesState {
  list: SensorNode[];
  selectedNodeId: string | null;
  metrics: SystemMetrics;
  loading: boolean;
  error: string | null;
}

const initialState: NodesState = {
  list: mockNodes,
  selectedNodeId: null,
  metrics: initialMetrics,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNodes = createAsyncThunk(
  'nodes/fetchNodes',
  async () => {
    try {
      const response = await fetch('/api/nodes');
      if (!response.ok) throw new Error('Failed to fetch nodes');
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.log('Using mock nodes (backend connection bypassed)');
      return mockNodes;
    }
  }
);

export const fetchSystemHealth = createAsyncThunk(
  'nodes/fetchSystemHealth',
  async () => {
    try {
      const response = await fetch('/api/system/health');
      if (!response.ok) throw new Error('Failed to fetch system metrics');
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.log('Using mock system metrics (backend connection bypassed)');
      return initialMetrics;
    }
  }
);

const nodesSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    updateRealtimeNode: (state, action: PayloadAction<Partial<SensorNode> & { nodeId: string }>) => {
      const index = state.list.findIndex(n => n.nodeId === action.payload.nodeId);
      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...action.payload,
          sensors: {
            ...state.list[index].sensors,
            ...(action.payload.sensors || {}),
          },
          lastUpdate: new Date().toISOString(),
        };
      }
    },
    updateMetrics: (state, action: PayloadAction<Partial<SystemMetrics>>) => {
      state.metrics = {
        ...state.metrics,
        ...action.payload,
        lastUpdate: new Date().toISOString()
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNodes.fulfilled, (state, action: PayloadAction<SensorNode[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action: PayloadAction<SystemMetrics>) => {
        state.metrics = action.payload;
      });
  },
});

export const { selectNode, updateRealtimeNode, updateMetrics } = nodesSlice.actions;

export default nodesSlice.reducer;
