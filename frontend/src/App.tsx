import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { useSocket } from './hooks/useSocket';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Statusbar from './components/layout/Statusbar';
import AlertToasts from './components/alerts/AlertToasts';
import AlertList from './components/alerts/AlertList';
import AlertModal from './components/alerts/AlertModal';
import { 
  MapPin, 
  Battery, 
  Flame, 
  Activity, 
  CheckCircle, 
  Download,
  AlertOctagon,
  Workflow,
  Settings as SettingsIcon
} from 'lucide-react';
import type { Alert } from './types';
import { addNotification } from './store/slices/uiSlice';
import { addRealtimeAlert, acknowledgeAllAlerts } from './store/slices/alertsSlice';


function App() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);
  const nodes = useSelector((state: RootState) => state.nodes.list);
  const activeAlerts = useSelector((state: RootState) => state.alerts.active);
  const { isConnected } = useSocket();
  
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Apply Theme
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#0d0f12';
      document.body.style.color = '#f3f4f6';
    } else {
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
    }
  }, [darkMode]);

  // Handle Quick Actions
  const handleAcknowledgeAll = () => {
    if (activeAlerts.length === 0) {
      dispatch(addNotification({ message: 'No active alerts to acknowledge', type: 'info' }));
      return;
    }
    dispatch(acknowledgeAllAlerts('ranger_somchai'));
    dispatch(addNotification({ message: 'All active alerts acknowledged', type: 'success' }));
  };

  const handleDownloadReport = () => {
    dispatch(addNotification({ message: 'Report download started...', type: 'success' }));
  };

  const triggerTestSimulation = () => {
    // Generate a mock critical fire alert for testing the system
    const testAlert: Alert = {
      _id: Math.random().toString(36).substring(2, 9),
      alertId: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      severity: 'critical',
      sourceNodeId: 'node-04',
      location: { lat: 18.8112, lng: 98.9205 },
      sensorType: 'smoke',
      value: 680,
      threshold: 400,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    dispatch(addRealtimeAlert(testAlert));
    dispatch(addNotification({
      message: `⚠️ CRITICAL: Fire/Smoke detected at ${testAlert.sourceNodeId}!`,
      type: 'error'
    }));
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark text-gray-200' : 'text-gray-800'}`}>
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Layout */}
        <Header socketConnected={isConnected} />

        {/* Statusbar KPI indicators */}
        <Statusbar />

        {/* Main Workspace content */}
        <main className="flex-1 overflow-y-auto pb-10">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="px-6 space-y-6">
              
              {/* Quick Actions & Alarm Test Panel */}
              <div className="glass-panel border-gray-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Quick Actions Control</h3>
                  <p className="text-xs text-gray-400 mt-1">Control system telemetry and trigger mock events</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={triggerTestSimulation}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-400 transition-colors shadow-lg shadow-red-500/20"
                  >
                    <Flame size={14} /> Trigger Fire Test
                  </button>
                  <button
                    onClick={handleAcknowledgeAll}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-colors"
                  >
                    <CheckCircle size={14} /> Acknowledge All
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
                  >
                    <Download size={14} /> Download Report
                  </button>
                </div>
              </div>

              {/* Grid Layout: Map Info / Algorithm Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mycelium Bio-Routing context */}
                <div className="glass-panel border-gray-800 rounded-3xl p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Workflow className="text-emerald-400" size={20} />
                    <h3 className="text-sm font-semibold text-white">Mycelium Routing Parameters</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-5">
                    Bio-inspired self-healing protocol that routes signals dynamically around obstacles or failed nodes. 
                    Paths are weighted based on three distinct coefficients:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Residual Energy (α)</span>
                      <div className="text-lg font-bold text-white mt-1">Weight: 0.50</div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-800">
                        <div className="bg-emerald-400 h-full w-[50%]"></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Link Quality RSSI (β)</span>
                      <div className="text-lg font-bold text-white mt-1">Weight: 0.30</div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-800">
                        <div className="bg-blue-400 h-full w-[30%]"></div>
                      </div>
                    </div>

                    <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Data Urgency (γ)</span>
                      <div className="text-lg font-bold text-white mt-1">Weight: 0.20</div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-800">
                        <div className="bg-red-400 h-full w-[20%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Self-Healing log monitor */}
                <div className="glass-panel border-gray-800 rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="text-emerald-400 animate-pulse" size={18} />
                      <h3 className="text-sm font-semibold text-white">Self-Healing Event Log</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      LIVE
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-2">
                    <div className="p-3 bg-gray-950/40 border border-gray-800 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-red-400">Node-06 Failed</span>
                        <span className="text-[9px] font-mono text-gray-500">10m ago</span>
                      </div>
                      <p className="text-xs text-gray-300">Rerouted via Node-03 and Node-01. Packets delivered.</p>
                      <span className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                        <CheckCircle size={10} /> Recovery: 245ms
                      </span>
                    </div>

                    <div className="p-3 bg-gray-950/40 border border-gray-800 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400">Link Degradation</span>
                        <span className="text-[9px] font-mono text-gray-500">1h ago</span>
                      </div>
                      <p className="text-xs text-gray-300">RSSI degraded between Node-05 → Node-08. Switch to backup path.</p>
                      <span className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                        <CheckCircle size={10} /> Recovery: 180ms
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. ALERTS TAB */}
          {activeTab === 'alerts' && (
            <AlertList onSelectAlert={setSelectedAlert} />
          )}

          {/* 3. NODES & STATUS TAB */}
          {activeTab === 'nodes' && (
            <div className="px-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nodes.map((node) => {
                  const hasCriticalAlert = activeAlerts.some(
                    a => a.sourceNodeId === node.nodeId && a.severity === 'critical'
                  );

                  return (
                    <div 
                      key={node._id}
                      className={`glass-panel rounded-3xl p-5 border flex flex-col relative transition-all duration-300 ${
                        hasCriticalAlert 
                          ? 'border-red-500/30 bg-red-950/5 shadow-[0_4px_25px_rgba(239,68,68,0.1)]' 
                          : node.status === 'dead'
                          ? 'border-gray-800/40 opacity-50'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {/* Node Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-white">{node.nodeId}</span>
                        {hasCriticalAlert ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-500 text-white animate-pulse">
                            <AlertOctagon size={10} /> FIRE ALERT
                          </span>
                        ) : node.status === 'active' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ONLINE
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-850 text-gray-500">
                            OFFLINE
                          </span>
                        )}
                      </div>

                      {/* Coordinates */}
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-0.5 mt-2">
                        <MapPin size={10} /> ({node.location.lat.toFixed(4)}, {node.location.lng.toFixed(4)})
                      </span>

                      {/* Sensor Readings */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Temp</span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {node.status === 'dead' ? '—' : `${node.sensors.temp.toFixed(1)}°C`}
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Smoke</span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {node.status === 'dead' ? '—' : `${node.sensors.smoke} ppm`}
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Humidity</span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {node.status === 'dead' ? '—' : `${node.sensors.humidity.toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Battery</span>
                          <span className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                            <Battery size={12} className={node.battery < 20 ? 'text-red-400 animate-pulse' : 'text-emerald-400'} />
                            {node.status === 'dead' ? '0%' : `${node.battery}%`}
                          </span>
                        </div>
                      </div>

                      {/* Additional Signal details */}
                      <div className="flex items-center justify-between mt-4 border-t border-gray-900 pt-3 text-[10px] text-gray-500 font-mono">
                        <span>RSSI: {node.status === 'dead' ? '—' : `${node.rssi} dBm`}</span>
                        <span>LQI: {node.status === 'dead' ? '—' : node.lqi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. NETWORK HEALTH TAB */}
          {activeTab === 'health' && (
            <div className="px-6 py-4 glass-panel border-gray-800 rounded-3xl m-6 text-center">
              <Activity className="mx-auto text-emerald-400 mb-3" size={32} />
              <h3 className="text-md font-semibold text-white">Network Topology Monitor</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                Phase 1 complete. Interactive network topology visualization using Vis.js / D3.js will be implemented in Phase 2.
              </p>
            </div>
          )}

          {/* 5. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="px-6 py-4 glass-panel border-gray-800 rounded-3xl m-6 text-center">
              <Activity className="mx-auto text-blue-400 mb-3" size={32} />
              <h3 className="text-md font-semibold text-white">Historical Analytics</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                Time-series charts and anomaly analysis will be implemented in Phase 3.
              </p>
            </div>
          )}

          {/* 6. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="px-6 py-4 glass-panel border-gray-800 rounded-3xl m-6 text-center">
              <SettingsIcon className="mx-auto text-gray-400 mb-3" size={32} />
              <h3 className="text-md font-semibold text-white">Configuration Parameters</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                Threshold limits configuration and user settings form will be implemented in Phase 3.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Floating Stack of Toasts */}
      <AlertToasts />

      {/* Pop-up modal details */}
      <AlertModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  );
}

export default App;
