import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { recalibrateNodeThunk, updateNodeStatusThunk } from '../../store/slices/nodesSlice';
import { addNotification } from '../../store/slices/uiSlice';
import type { SensorNode } from '../../types';
import { 
  Activity, 
  MapPin, 
  Battery, 
  Signal, 
  RefreshCw, 
  Power,
  Workflow
} from 'lucide-react';

// Pre-defined static links between nodes
const MESH_LINKS = [
  { source: 'node-01', target: 'node-02', type: 'primary' },
  { source: 'node-01', target: 'node-04', type: 'primary' },
  { source: 'node-01', target: 'node-03', type: 'backup' },
  { source: 'node-02', target: 'node-03', type: 'primary' },
  { source: 'node-02', target: 'node-08', type: 'backup' },
  { source: 'node-03', target: 'node-05', type: 'primary' },
  { source: 'node-04', target: 'node-07', type: 'primary' },
  { source: 'node-05', target: 'node-08', type: 'primary' },
  { source: 'node-06', target: 'node-03', type: 'backup' },
  { source: 'node-06', target: 'node-07', type: 'backup' },
  { source: 'node-07', target: 'node-04', type: 'primary' },
];

interface NodePosition {
  x: number;
  y: number;
}

export default function NetworkTopology() {
  const dispatch = useDispatch<AppDispatch>();
  const nodes = useSelector((state: RootState) => state.nodes.list);
  const activeAlerts = useSelector((state: RootState) => state.alerts.active);
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [isCalibrating, setIsCalibrating] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Width and height of SVG canvas
  const width = 800;
  const height = 500;

  // Initialize geographical mapping positions
  useEffect(() => {
    if (nodes.length === 0) return;

    // Define Chiang Mai Doi Suthep bounding coordinates
    const minLat = 18.790;
    const maxLat = 18.815;
    const minLng = 98.910;
    const maxLng = 98.960;

    const initialPositions: Record<string, NodePosition> = {};
    
    nodes.forEach((node) => {
      // Scale lat/lng to canvas width/height
      const x = ((node.location.lng - minLng) / (maxLng - minLng)) * (width - 160) + 80;
      const y = height - (((node.location.lat - minLat) / (maxLat - minLat)) * (height - 160) + 80);
      initialPositions[node.nodeId] = { x, y };
    });

    setNodePositions(initialPositions);
  }, [nodes]);



  // Action: Recalibrate Node
  const handleRecalibrate = async (nodeId: string) => {
    setIsCalibrating(true);
    try {
      await dispatch(recalibrateNodeThunk(nodeId)).unwrap();
      dispatch(addNotification({ message: `Node ${nodeId} successfully recalibrated`, type: 'success' }));
    } catch (err: any) {
      dispatch(addNotification({ message: err || 'Recalibration failed', type: 'error' }));
    } finally {
      setIsCalibrating(false);
    }
  };

  // Action: Toggle Node Status
  const handleToggleStatus = async (node: SensorNode) => {
    const nextStatus = node.status === 'active' ? 'inactive' : 'active';
    try {
      await dispatch(updateNodeStatusThunk({ nodeId: node.nodeId, status: nextStatus })).unwrap();
      dispatch(addNotification({ 
        message: `Node ${node.nodeId} status updated to ${nextStatus.toUpperCase()}`, 
        type: 'success' 
      }));
    } catch (err: any) {
      dispatch(addNotification({ message: err || 'Status update failed', type: 'error' }));
    }
  };

  const selectedNodeObj = nodes.find(n => n.nodeId === selectedNodeId);

  return (
    <div className="px-6 space-y-6">
      
      {/* Topology Header Panel */}
      <div className="glass-panel border-gray-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Workflow className="text-emerald-400" size={18} />
            Doi Suthep Mesh Network Topology Monitor
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time wireless communication graph mapping actual physical node coordinates.
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Information Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Network SVG Canvas panel */}
        <div className="glass-panel border-gray-800 rounded-3xl p-4 lg:col-span-2 relative overflow-hidden flex flex-col items-center bg-gray-950/20">
          
          {/* Canvas Legend */}
          <div className="absolute top-4 left-4 bg-gray-950/80 border border-gray-800/80 rounded-2xl p-3 flex flex-col gap-1.5 text-[10px] text-gray-400 backdrop-blur-md z-10 shadow-lg">
            <span className="font-bold text-white mb-0.5">Status Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              <span>Active (Good Battery)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
              <span>Low Battery (&lt; 30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
              <span>Offline / Fire Alert</span>
            </div>
            <div className="border-t border-gray-900 my-1 pt-1 font-bold text-white">Route Links</div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-500"></span>
              <span>Primary Path</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-emerald-500/50"></span>
              <span>Backup Path</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full aspect-[8/5] select-none"
          >
            {/* Draw grid lines background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 1. Draw Mesh connections */}
            {MESH_LINKS.map((link, idx) => {
              const p1 = nodePositions[link.source];
              const p2 = nodePositions[link.target];
              if (!p1 || !p2) return null;

              const node1 = nodes.find(n => n.nodeId === link.source);
              const node2 = nodes.find(n => n.nodeId === link.target);

              // Check if connection is active/healthy
              const isDisconnected = !node1 || !node2 || node1.status === 'dead' || node2.status === 'dead' || node1.status === 'inactive' || node2.status === 'inactive';
              const averageRSSI = node1 && node2 ? (node1.rssi + node2.rssi) / 2 : -100;
              
              let strokeColor = 'rgba(16, 185, 129, 0.4)'; // healthy green
              if (isDisconnected) {
                strokeColor = 'rgba(239, 68, 68, 0.2)'; // offline link
              } else if (averageRSSI < -75) {
                strokeColor = 'rgba(245, 158, 11, 0.4)'; // weak amber
              }

              // Highlight connections attached to selected node
              const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;

              return (
                <g key={`link-${idx}`}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={link.type === 'backup' ? '4,4' : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Draw packet flow animation circles along active primary links */}
                  {!isDisconnected && link.type === 'primary' && (
                    <circle r="2.5" fill="#34d399">
                      <animateMotion
                        dur="4s"
                        repeatCount="indefinite"
                        path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* 2. Draw Sensor Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.nodeId];
              if (!pos) return null;

              const hasAlert = activeAlerts.some(
                a => a.sourceNodeId === node.nodeId && a.severity === 'critical'
              );

              // Determine Node styling based on operational metrics
              const isOffline = node.status === 'dead' || node.status === 'inactive';
              const isLowBattery = node.battery < 30;

              let ringColor = 'rgba(16, 185, 129, 0.2)';
              let circleColor = '#10b981'; // Green active

              if (hasAlert) {
                circleColor = '#ef4444'; // Red fire alert
                ringColor = 'rgba(239, 68, 68, 0.4)';
              } else if (isOffline) {
                circleColor = '#4b5563'; // Gray offline
                ringColor = 'rgba(75, 85, 99, 0.1)';
              } else if (isLowBattery) {
                circleColor = '#f59e0b'; // Amber low battery
                ringColor = 'rgba(245, 158, 11, 0.3)';
              }

              const isSelected = selectedNodeId === node.nodeId;

              // Node radius proportional to battery level (minimum 10px, max 16px)
              const radius = 10 + (node.battery / 100) * 5;

              return (
                <g
                  key={node.nodeId}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(node.nodeId)}
                  className="cursor-pointer group"
                >
                  <defs>
                    <filter id={`glow-${node.nodeId}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Pulsing ring for nodes in active fire alert state or selection */}
                  {(hasAlert || isSelected) && (
                    <circle
                      r={radius}
                      fill="none"
                      stroke={hasAlert ? '#ef4444' : '#60a5fa'}
                      strokeWidth="1.5"
                    >
                      <animate
                        attributeName="r"
                        values={`${radius};${radius + 15}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Outer selection ring */}
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke={isSelected ? '#60a5fa' : ringColor}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all duration-300 group-hover:scale-110"
                  />

                  {/* Core Node Circle */}
                  <circle
                    r={radius}
                    fill={circleColor}
                    filter={!isOffline ? `url(#glow-${node.nodeId})` : undefined}
                    style={{ fill: circleColor }}
                    className="transition-all duration-300"
                  />

                  {/* Node Label Text */}
                  <text
                    y={-radius - 8}
                    textAnchor="middle"
                    fill={isSelected ? '#60a5fa' : '#ffffff'}
                    className="text-[10px] font-mono font-bold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {node.nodeId}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Card / Sidebar */}
        <div className="glass-panel border-gray-800 rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
          {selectedNodeObj ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Header: Node Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white font-mono">{selectedNodeObj.nodeId}</span>
                  {selectedNodeObj.status === 'active' ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ONLINE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-gray-500 border border-gray-800">
                      OFFLINE
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-400" />
                  {selectedNodeObj.metadata?.location_name || 'Forest Area Watchpoint'}
                </p>
                <span className="text-[10px] text-gray-500 font-mono block">
                  Location Coordinates: {selectedNodeObj.location.lat.toFixed(5)}, {selectedNodeObj.location.lng.toFixed(5)}
                </span>
              </div>

              {/* Metrics gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950/40 border border-gray-800/60 rounded-2xl p-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Temperature</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.sensors.temp.toFixed(1)}°C`}
                  </div>
                </div>

                <div className="bg-gray-950/40 border border-gray-800/60 rounded-2xl p-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Smoke Density</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.sensors.smoke} ppm`}
                  </div>
                </div>

                <div className="bg-gray-950/40 border border-gray-800/60 rounded-2xl p-3">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Humidity</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.sensors.humidity.toFixed(0)}%`}
                  </div>
                </div>

                <div className="bg-gray-950/40 border border-gray-800/60 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Battery Level</span>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                    <Battery size={14} className={selectedNodeObj.battery < 20 ? 'text-red-400 animate-pulse' : 'text-emerald-400'} />
                    {selectedNodeObj.battery}%
                  </div>
                </div>
              </div>

              {/* Link Details */}
              <div className="space-y-2 border-t border-gray-900 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Signal Quality Link</span>
                <div className="flex justify-between text-xs font-mono text-gray-300">
                  <span className="flex items-center gap-1"><Signal size={12} /> RSSI</span>
                  <span>{selectedNodeObj.rssi} dBm</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-gray-300">
                  <span className="flex items-center gap-1"><Activity size={12} /> Link Quality (LQI)</span>
                  <span>{selectedNodeObj.lqi} / 255</span>
                </div>
              </div>

              {/* Action Buttons: Calibrate/Toggle */}
              {user && (user.role === 'admin' || user.role === 'ranger') ? (
                <div className="flex gap-3 border-t border-gray-900 pt-4 mt-auto">
                  <button
                    disabled={isCalibrating || selectedNodeObj.status === 'dead'}
                    onClick={() => handleRecalibrate(selectedNodeObj.nodeId)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gray-850 hover:bg-gray-850 text-white border border-gray-800 hover:border-gray-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={isCalibrating ? 'animate-spin' : ''} size={14} /> 
                    {isCalibrating ? 'Calibrating...' : 'Recalibrate'}
                  </button>

                  <button
                    onClick={() => handleToggleStatus(selectedNodeObj)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors ${
                      selectedNodeObj.status === 'active' 
                        ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    <Power size={14} /> 
                    {selectedNodeObj.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gray-950/20 border border-gray-800 rounded-xl text-[10px] text-gray-500 leading-normal mt-4">
                  🔒 Log in as Ranger or Administrator to calibrate sensor nodes or change node states.
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center my-auto space-y-3">
              <Workflow className="text-gray-650" size={32} />
              <div className="text-xs text-gray-400 font-semibold">Select a Node to Inspect</div>
              <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
                Click on any node in the topology mesh map to view its active sensor readings, coordinates, and signal details.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
