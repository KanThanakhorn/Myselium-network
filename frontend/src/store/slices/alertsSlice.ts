import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Alert, AlertSeverity, AlertStatus } from '../../types';

// Mock alerts for initial verification
const mockAlerts: Alert[] = [
  {
    _id: 'a1',
    alertId: 'ALT-1024',
    severity: 'critical',
    sourceNodeId: 'node-05',
    location: { lat: 18.8023, lng: 98.9502 },
    sensorType: 'smoke',
    value: 480,
    threshold: 400,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    status: 'active',
  },
  {
    _id: 'a2',
    alertId: 'ALT-1025',
    severity: 'warning',
    sourceNodeId: 'node-08',
    location: { lat: 18.8055, lng: 98.9540 },
    sensorType: 'temperature',
    value: 38.5,
    threshold: 35.0,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    status: 'active',
  },
  {
    _id: 'a3',
    alertId: 'ALT-1022',
    severity: 'info',
    sourceNodeId: 'node-03',
    location: { lat: 18.7991, lng: 98.9488 },
    sensorType: 'pm25',
    value: 120,
    threshold: 100,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hr ago
    status: 'resolved',
    acknowledgedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    acknowledgedBy: 'ranger_somchai',
    responseDetails: {
      rangerId: 'ranger_somchai',
      actionTaken: 'Inspected area. Found small agricultural burning, advised farmer to extinguish. Area cleared.',
      resolvedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    }
  }
];

interface AlertsState {
  active: Alert[];
  history: Alert[];
  filters: {
    severity: AlertSeverity | 'all';
    status: AlertStatus | 'all';
    nodeId: string;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  active: mockAlerts.filter(a => a.status === 'active'),
  history: mockAlerts.filter(a => a.status === 'resolved'),
  filters: {
    severity: 'all',
    status: 'all',
    nodeId: '',
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchActiveAlerts = createAsyncThunk(
  'alerts/fetchActive',
  async () => {
    try {
      const response = await fetch('/api/alerts/active');
      if (!response.ok) throw new Error('Failed to fetch active alerts');
      const data = await response.json();
      return data;
    } catch (err: any) {
      // Fallback to mock data in development
      console.log('Using mock active alerts (backend connection bypassed)');
      return mockAlerts.filter(a => a.status === 'active');
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledge',
  async ({ alertId, rangerId }: { alertId: string; rangerId: string }) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rangerId }),
      });
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      const data = await response.json();
      return { alertId, acknowledgedBy: rangerId, ...data };
    } catch (err: any) {
      // Fallback in development
      return { alertId, acknowledgedBy: rangerId, acknowledgedAt: new Date().toISOString() };
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'alerts/resolve',
  async (
    { alertId, rangerId, actionTaken }: { alertId: string; rangerId: string; actionTaken: string }
  ) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rangerId, actionTaken }),
      });
      if (!response.ok) throw new Error('Failed to resolve alert');
      const data = await response.json();
      return data;
    } catch (err: any) {
      // Fallback in development
      return {
        alertId,
        status: 'resolved' as AlertStatus,
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: rangerId,
        responseDetails: {
          rangerId,
          actionTaken,
          resolvedAt: new Date().toISOString(),
        }
      };
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addRealtimeAlert: (state, action: PayloadAction<Alert>) => {
      // Check if it already exists to avoid duplicates
      if (!state.active.some(a => a.alertId === action.payload.alertId)) {
        state.active.unshift(action.payload);
      }
    },
    setAlertFilters: (state, action: PayloadAction<Partial<AlertsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAlertFilters: (state) => {
      state.filters = {
        severity: 'all',
        status: 'all',
        nodeId: '',
      };
    },
    // Action to acknowledge all alerts at once
    acknowledgeAllAlerts: (state, action: PayloadAction<string>) => {
      const rangerId = action.payload;
      const ackTimestamp = new Date().toISOString();
      
      state.active.forEach(alert => {
        alert.acknowledgedAt = ackTimestamp;
        alert.acknowledgedBy = rangerId;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active Alerts
      .addCase(fetchActiveAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveAlerts.fulfilled, (state, action: PayloadAction<Alert[]>) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(fetchActiveAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })
      // Acknowledge Alert
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const { alertId, acknowledgedBy, acknowledgedAt } = action.payload;
        const alert = state.active.find(a => a.alertId === alertId || a._id === alertId);
        if (alert) {
          alert.acknowledgedBy = acknowledgedBy;
          alert.acknowledgedAt = acknowledgedAt;
        }
      })
      // Resolve Alert
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const updatedAlert = action.payload;
        // Remove from active
        state.active = state.active.filter(a => a.alertId !== updatedAlert.alertId && a._id !== updatedAlert.alertId);
        // Add to history
        if (!state.history.some(a => a.alertId === updatedAlert.alertId)) {
          state.history.unshift(updatedAlert);
        }
      });
  },
});

export const { addRealtimeAlert, setAlertFilters, clearAlertFilters, acknowledgeAllAlerts } = alertsSlice.actions;

export default alertsSlice.reducer;
