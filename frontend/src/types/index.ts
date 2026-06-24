export type NodeStatus = 'active' | 'inactive' | 'dead';

export interface SensorData {
  temp: number;
  humidity: number;
  smoke: number;
  pm25: number;
}

export interface SensorNode {
  _id: string;
  nodeId: string;
  location: {
    lat: number;
    lng: number;
  };
  status: NodeStatus;
  battery: number;
  maxBattery: number;
  rssi: number;
  lqi: number;
  sensors: SensorData;
  lastUpdate: string;
  metadata?: {
    deployedDate: string;
    location_name: string;
  };
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved';

export interface Alert {
  _id: string;
  alertId: string;
  severity: AlertSeverity;
  sourceNodeId: string;
  location: {
    lat: number;
    lng: number;
  };
  sensorType: 'smoke' | 'temperature' | 'pm25';
  value: number;
  threshold: number;
  timestamp: string;
  status: AlertStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  responseDetails?: {
    rangerId: string;
    actionTaken: string;
    resolvedAt: string;
  };
}

export interface RoutingEvent {
  _id: string;
  eventType: 'self-healing' | 'path-failure' | 'link-recovery';
  timestamp: string;
  affectedNodes: string[];
  description: string;
  recoveryTime_ms: number;
  success: boolean;
}

export interface SystemMetrics {
  networkUptime: number;
  packetLossRate: number;
  avgLatencyMs: number;
  activeNodeCount: number;
  deadNodeCount: number;
  avgBatteryPercent: number;
  estimatedNetworkLifetimeDays: number;
  lastUpdate: string;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  routing: {
    selfHealingEventsLast24h: number;
    deliverySuccessRate: number;
  };
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'ranger' | 'analyst';
  name?: string;
}

export interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
