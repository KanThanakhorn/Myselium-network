import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  TrendingUp, 
  Map, 
  Signal, 
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';

// Simulated 30-day historical time-series data
const generateHistoricalData = (daysCount: number) => {
  const data = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate gradual fluctuations with a few fire anomalies
    let temp = 28 + Math.sin(i / 3) * 3 + Math.random() * 1.5;
    let smoke = 80 + Math.cos(i / 4) * 15 + Math.random() * 10;
    let humidity = 60 - Math.sin(i / 3) * 10 + Math.random() * 5;
    
    // Injected historical fire spikes
    if (i === 12 || i === 22) {
      temp += 10;
      smoke += 350;
      humidity -= 25;
    }

    data.push({ date: dateString, temp, smoke, humidity });
  }
  return data;
};

const DATA_30D = generateHistoricalData(30);
const DATA_7D = DATA_30D.slice(23);

export default function AnalyticsDashboard() {
  const nodes = useSelector((state: RootState) => state.nodes.list);
  const activeAlerts = useSelector((state: RootState) => state.alerts.active);

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');
  const [selectedSensor, setSelectedSensor] = useState<'temp' | 'smoke' | 'humidity'>('temp');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  const chartData = timeRange === '30d' ? DATA_30D : DATA_7D;

  // Chart rendering parameters
  const chartWidth = 500;
  const chartHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const dataValues = chartData.map(d => d[selectedSensor]);
  const minValue = Math.min(...dataValues) * 0.95;
  const maxValue = Math.max(...dataValues) * 1.05;
  const valueRange = maxValue - minValue;

  // Map data to SVG coordinates
  const points = chartData.map((d, index) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
    const y = chartHeight - paddingBottom - ((d[selectedSensor] - minValue) / valueRange) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, data: d };
  });

  // SVG path definitions
  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  // Bounding boxes for Chiang Mai Doi Suthep simulation
  const minLat = 18.790;
  const maxLat = 18.815;
  const minLng = 98.910;
  const maxLng = 98.960;

  // Coordinate projections for the geographical map card
  const mapWidth = 320;
  const mapHeight = 220;

  const projectLatLng = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 40) + 20;
    const y = mapHeight - (((lat - minLat) / (maxLat - minLat)) * (mapHeight - 40) + 20);
    return { x, y };
  };

  // Signal dead zones recommendations
  const deadZones = [
    { name: 'Doi Pui Ridge Gap', severity: 'High', recommendation: 'Deploy node between Node-05 and Node-08' },
    { name: 'South Siri Bhum Valley', severity: 'Medium', recommendation: 'Deploy node near Node-06 path' }
  ];

  return (
    <div className="px-6 space-y-6">
      
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart View Panel */}
        <div className="glass-panel border-gray-800 rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="text-blue-400" size={18} />
                Sensor Trends & Historical Analytics
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Forest fire trigger indicators history</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Selector Sensor */}
              <div className="flex bg-gray-950/80 p-0.5 rounded-xl border border-gray-900">
                {(['temp', 'smoke', 'humidity'] as const).map(sensor => (
                  <button
                    key={sensor}
                    onClick={() => setSelectedSensor(sensor)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      selectedSensor === sensor 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {sensor === 'temp' ? 'Temperature' : sensor === 'smoke' ? 'Smoke' : 'Humidity'}
                  </button>
                ))}
              </div>

              {/* Selector Time range */}
              <div className="flex bg-gray-950/80 p-0.5 rounded-xl border border-gray-900">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    timeRange === '7d' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    timeRange === '30d' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative flex-1 min-h-[220px] flex items-center justify-center">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoveredDataIndex(null)}
            >
              {/* Horizontal gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                const val = maxValue - ratio * valueRange;
                return (
                  <g key={`grid-${idx}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#6b7280"
                      className="text-[8px] font-mono"
                    >
                      {selectedSensor === 'temp' 
                        ? `${val.toFixed(0)}°` 
                        : selectedSensor === 'smoke' 
                        ? `${val.toFixed(0)}p` 
                        : `${val.toFixed(0)}%`}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path
                d={areaD}
                fill={
                  selectedSensor === 'temp' 
                    ? 'url(#tempGrad)' 
                    : selectedSensor === 'smoke' 
                    ? 'url(#smokeGrad)' 
                    : 'url(#humGrad)'
                }
                className="transition-all duration-300"
              />

              {/* Trend Polyline Path */}
              <path
                d={pathD}
                fill="none"
                stroke={selectedSensor === 'temp' ? '#f59e0b' : selectedSensor === 'smoke' ? '#ef4444' : '#3b82f6'}
                strokeWidth="2.5"
                className="transition-all duration-300"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="smokeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Day dates labels */}
              {chartData.map((d, index) => {
                // Show label for every 5th item for 30d, every item for 7d
                if (timeRange === '30d' && index % 6 !== 0) return null;
                const x = paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
                return (
                  <text
                    key={`label-${index}`}
                    x={x}
                    y={chartHeight - paddingBottom + 14}
                    textAnchor="middle"
                    fill="#6b7280"
                    className="text-[8px] font-mono"
                  >
                    {d.date}
                  </text>
                );
              })}

              {/* Interactive vertical hover indicator */}
              {hoveredDataIndex !== null && points[hoveredDataIndex] && (
                <g>
                  <line
                    x1={points[hoveredDataIndex].x}
                    y1={paddingTop}
                    x2={points[hoveredDataIndex].x}
                    y2={chartHeight - paddingBottom}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={points[hoveredDataIndex].x}
                    cy={points[hoveredDataIndex].y}
                    r="5"
                    fill={selectedSensor === 'temp' ? '#f59e0b' : selectedSensor === 'smoke' ? '#ef4444' : '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Invisible interactive hover rect slices */}
              {points.map((p, index) => {
                const sliceWidth = (chartWidth - paddingLeft - paddingRight) / chartData.length;
                return (
                  <rect
                    key={`slice-${index}`}
                    x={p.x - sliceWidth / 2}
                    y={paddingTop}
                    width={sliceWidth}
                    height={chartHeight - paddingTop - paddingBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDataIndex(index)}
                  />
                );
              })}
            </svg>

            {/* Float Tooltip */}
            {hoveredDataIndex !== null && points[hoveredDataIndex] && (
              <div 
                className="absolute top-2 left-10 bg-gray-950/90 border border-gray-800 rounded-xl p-2.5 backdrop-blur-md text-[10px] text-gray-300 shadow-xl flex flex-col gap-0.5"
                style={{
                  left: `${(points[hoveredDataIndex].x / chartWidth) * 90 + 5}%`
                }}
              >
                <span className="font-bold text-white text-[9px] flex items-center gap-1">
                  <Calendar size={10} className="text-blue-400" />
                  {points[hoveredDataIndex].data.date}
                </span>
                <span className="font-mono mt-0.5">
                  {selectedSensor === 'temp' && `Temperature: ${points[hoveredDataIndex].data.temp.toFixed(1)}°C`}
                  {selectedSensor === 'smoke' && `Smoke Density: ${points[hoveredDataIndex].data.smoke.toFixed(0)} ppm`}
                  {selectedSensor === 'humidity' && `Humidity: ${points[hoveredDataIndex].data.humidity.toFixed(0)}%`}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Coverage map panel */}
        <div className="glass-panel border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Map className="text-emerald-400" size={18} />
              Geospatial Signal Coverage
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Doi Suthep forest mesh dead zones</p>
          </div>

          {/* Canvas Map Projection SVG */}
          <div className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-2 relative my-4 flex items-center justify-center overflow-hidden">
            
            {/* Doi Suthep mountains mockup overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

            <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full aspect-[16/11]">
              
              {/* Draw Dead Zone polygons */}
              <polygon
                points="110,60 160,50 170,90 120,90"
                fill="rgba(239, 68, 68, 0.12)"
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <text x="140" y="75" textAnchor="middle" fill="#f87171" className="text-[7px] font-mono tracking-tighter opacity-80">
                DEAD ZONE
              </text>

              {/* Draw coverage radius around active nodes */}
              {nodes.map((node) => {
                const pos = projectLatLng(node.location.lat, node.location.lng);
                if (node.status === 'dead' || node.status === 'inactive') return null;

                // Radius proportional to signal strength RSSI
                const radius = 30 + (Math.max(-100, Math.min(-30, node.rssi)) + 100) * 0.5;

                return (
                  <circle
                    key={`cov-${node.nodeId}`}
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill="none"
                    stroke={node.rssi > -60 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)'}
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Draw node markers */}
              {nodes.map((node) => {
                const pos = projectLatLng(node.location.lat, node.location.lng);
                const hasCriticalAlert = activeAlerts.some(
                  a => a.sourceNodeId === node.nodeId && a.severity === 'critical'
                );

                const isOffline = node.status === 'dead' || node.status === 'inactive';

                return (
                  <g key={`marker-${node.nodeId}`}>
                    {/* Pulsing ring for alerts */}
                    {hasCriticalAlert && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="6"
                        fill="none"
                        stroke="#ef4444"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill={hasCriticalAlert ? '#ef4444' : isOffline ? '#4b5563' : '#10b981'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text x={pos.x} y={pos.y - 7} textAnchor="middle" fill="#9ca3af" className="text-[6px] font-mono font-bold">
                      {node.nodeId}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Info Box */}
          <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-3 flex items-start gap-2.5">
            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={14} />
            <p className="text-[10px] text-gray-400 leading-normal">
              Radius circles show simulated 2.4GHz RF signal bounds. Overlap areas allow mesh routing hops. Red dotted area represents Doi Pui ridge shadowing where signal blockage occurs.
            </p>
          </div>

        </div>

      </div>

      {/* Recommended placements & signal matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Placement recommendations */}
        <div className="glass-panel border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500" size={18} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dead Zone Recommender</h4>
          </div>

          <div className="space-y-3 flex-1">
            {deadZones.map((zone, idx) => (
              <div key={idx} className="p-3 bg-gray-950/40 border border-gray-800 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white">{zone.name}</span>
                  <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    zone.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {zone.severity} Risk
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">{zone.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signal quality details table */}
        <div className="glass-panel border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Signal className="text-blue-400" size={18} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Signal Quality Matrix</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-left">
              <thead>
                <tr className="border-b border-gray-950 text-gray-500">
                  <th className="pb-2">Node Pair</th>
                  <th className="pb-2">RSSI (dBm)</th>
                  <th className="pb-2">Link Quality</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-950 text-gray-300">
                <tr className="border-b border-gray-950">
                  <td className="py-2">node-01 ↔ node-02</td>
                  <td className="py-2">-52</td>
                  <td className="py-2">Excellent (225/255)</td>
                  <td className="py-2 text-right text-emerald-400 font-semibold">Active</td>
                </tr>
                <tr className="border-b border-gray-950">
                  <td className="py-2">node-02 ↔ node-03</td>
                  <td className="py-2">-65</td>
                  <td className="py-2">Good (192/255)</td>
                  <td className="py-2 text-right text-emerald-400 font-semibold">Active</td>
                </tr>
                <tr className="border-b border-gray-950">
                  <td className="py-2">node-04 ↔ node-07</td>
                  <td className="py-2">-58</td>
                  <td className="py-2">Good (208/255)</td>
                  <td className="py-2 text-right text-emerald-400 font-semibold">Active</td>
                </tr>
                <tr className="border-b border-gray-950">
                  <td className="py-2">node-05 ↔ node-08</td>
                  <td className="py-2">-80</td>
                  <td className="py-2">Degraded (145/255)</td>
                  <td className="py-2 text-right text-amber-400 font-semibold">Weak</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
