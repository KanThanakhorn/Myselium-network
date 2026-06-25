import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addRealtimeAlert } from '../store/slices/alertsSlice';
import { updateRealtimeNode, updateMetrics, updateRealtimeRoutes } from '../store/slices/nodesSlice';
import { addNotification } from '../store/slices/uiSlice';
import type { Alert, SensorNode, SystemMetrics } from '../types';

export const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In dev mode, we proxy '/socket.io' to port 5000 in vite.config.ts
    // If not in development, connect to the window host location
    const socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      setIsConnected(true);
      
      // Join the dashboard room
      socket.emit('join_dashboard');
      
      dispatch(addNotification({
        message: 'Connected to Mycelium network telemetry',
        type: 'info'
      }));
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      dispatch(addNotification({
        message: 'Disconnected from Mycelium network telemetry',
        type: 'warning'
      }));
    });

    // Real-time sensor node update
    socket.on('node_update', (nodeData: Partial<SensorNode> & { nodeId: string }) => {
      console.log('Node update received:', nodeData);
      dispatch(updateRealtimeNode(nodeData));
    });

    // Dynamic routing path update
    socket.on('routes_update', (routesData: any) => {
      console.log('Dynamic routes update received:', routesData);
      dispatch(updateRealtimeRoutes(routesData));
      dispatch(addNotification({
        message: 'Mycelium network topology self-healed and rerouted.',
        type: 'success'
      }));
    });

    // New fire/smoke alert detected!
    socket.on('new_alert', (alertData: Alert) => {
      console.log('New alert received:', alertData);
      dispatch(addRealtimeAlert(alertData));
      
      // Trigger user toast notification
      dispatch(addNotification({
        message: `⚠️ CRITICAL: Fire/Smoke detected at ${alertData.sourceNodeId}!`,
        type: alertData.severity === 'critical' ? 'error' : 'warning',
      }));
    });

    // Network overall metrics update
    socket.on('metrics_update', (metricsData: Partial<SystemMetrics>) => {
      console.log('Metrics update received:', metricsData);
      dispatch(updateMetrics(metricsData));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('node_update');
      socket.off('routes_update');
      socket.off('new_alert');
      socket.off('metrics_update');
      socket.disconnect();
    };
  }, [dispatch]);

  // Function to manually emit events if needed
  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { isConnected, emit };
};
