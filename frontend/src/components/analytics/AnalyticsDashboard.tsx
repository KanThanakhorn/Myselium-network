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
    const dateString = date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    
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
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);

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

  const deadZones = [
    { name: 'สันเขาดอยปุย', severity: 'High', recommendation: 'ควรติดตั้งโหนดเพิ่มเติมระหว่าง Node-05 และ Node-08' },
    { name: 'หุบเขาสิริภูมิฝั่งใต้', severity: 'Medium', recommendation: 'ควรติดตั้งโหนดเพิ่มเติมใกล้แนวสัญญาณ Node-06' }
  ];

  return (
    <div className="px-6 space-y-6">
      
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart View Panel */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between bg-bg-surface border-border-main">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                <TrendingUp className="text-primary-500" size={18} />
                แนวโน้มและข้อมูลการวัดของเซนเซอร์ย้อนหลัง
              </h3>
              <p className="text-xs text-text-sub mt-0.5">ประวัติค่าดัชนีตรวจจับความเสี่ยงในการเกิดไฟป่า</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Selector Sensor */}
              <div className="flex bg-bg-surface-elevated p-0.5 rounded-xl border border-border-main">
                {(['temp', 'smoke', 'humidity'] as const).map(sensor => (
                  <button
                    key={sensor}
                    onClick={() => setSelectedSensor(sensor)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-colors focus:outline-none ${
                      selectedSensor === sensor 
                        ? 'bg-bg-surface border border-border-main text-primary-500 shadow-sm' 
                        : 'text-text-sub hover:text-text-main'
                    }`}
                  >
                    {sensor === 'temp' ? 'อุณหภูมิ' : sensor === 'smoke' ? 'ควันไฟ' : 'ความชื้น'}
                  </button>
                ))}
              </div>

              {/* Selector Time range */}
              <div className="flex bg-bg-surface-elevated p-0.5 rounded-xl border border-border-main">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-colors focus:outline-none ${
                    timeRange === '7d' 
                      ? 'bg-bg-surface border border-border-main text-text-main shadow-sm' 
                      : 'text-text-sub hover:text-text-main'
                  }`}
                >
                  7 วัน
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-colors focus:outline-none ${
                    timeRange === '30d' 
                      ? 'bg-bg-surface border border-border-main text-text-main shadow-sm' 
                      : 'text-text-sub hover:text-text-main'
                  }`}
                >
                  30 วัน
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
                      stroke={darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill={darkMode ? "#9ca3af" : "#4b5563"}
                      className="text-[8px] font-mono font-semibold"
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
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="smokeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Day dates labels */}
              {chartData.map((d, index) => {
                if (timeRange === '30d' && index % 6 !== 0) return null;
                const x = paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
                return (
                  <text
                    key={`label-${index}`}
                    x={x}
                    y={chartHeight - paddingBottom + 14}
                    textAnchor="middle"
                    fill={darkMode ? "#9ca3af" : "#4b5563"}
                    className="text-[8px] font-mono font-semibold"
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
                    stroke={darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={points[hoveredDataIndex].x}
                    cy={points[hoveredDataIndex].y}
                    r="4.5"
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
                className="absolute top-2 left-10 bg-bg-surface-modal border border-border-main rounded-xl p-2.5 text-[10px] text-text-sub shadow-lg flex flex-col gap-0.5 z-20"
                style={{
                  left: `${(points[hoveredDataIndex].x / chartWidth) * 90 + 5}%`
                }}
              >
                <span className="font-bold text-text-main text-[9px] flex items-center gap-1">
                  <Calendar size={10} className="text-primary-500" />
                  {points[hoveredDataIndex].data.date}
                </span>
                <span className="font-mono mt-0.5 font-semibold">
                  {selectedSensor === 'temp' && `อุณหภูมิ: ${points[hoveredDataIndex].data.temp.toFixed(1)}°C`}
                  {selectedSensor === 'smoke' && `ความหนาแน่นควัน: ${points[hoveredDataIndex].data.smoke.toFixed(0)} ppm`}
                  {selectedSensor === 'humidity' && `ความชื้น: ${points[hoveredDataIndex].data.humidity.toFixed(0)}%`}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Coverage map panel */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between bg-bg-surface border-border-main">
          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
              <Map className="text-primary-500" size={18} />
              ขอบเขตความครอบคลุมของสัญญาณไร้สาย
            </h3>
            <p className="text-xs text-text-sub mt-0.5">พื้นที่อับสัญญาณในโครงข่ายบริเวณป่าดอยสุเทพ</p>
          </div>

          {/* Canvas Map Projection SVG */}
          <div className="bg-bg-surface-elevated/20 border border-border-main rounded-2xl p-2 relative my-4 flex items-center justify-center overflow-hidden">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

            {nodes.length === 0 ? (
              <div className="w-full aspect-[16/11] flex items-center justify-center text-text-muted text-xs">
                ไม่มีข้อมูลโหนดแสดงพิกัด
              </div>
            ) : (
              <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full aspect-[16/11]">
                
                {/* Draw Dead Zone polygons */}
                <polygon
                  points="110,60 160,50 170,90 120,90"
                  fill="rgba(239, 68, 68, 0.08)"
                  stroke="rgba(239, 68, 68, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text x="140" y="75" textAnchor="middle" fill="#ef4444" className="text-[7px] font-mono font-bold tracking-tighter opacity-80">
                  พื้นที่อับสัญญาณ
                </text>

                {/* Draw coverage radius around active nodes */}
                {nodes.map((node) => {
                  const pos = projectLatLng(node.location.lat, node.location.lng);
                  if (node.status === 'dead' || node.status === 'inactive' || node.battery <= 0) return null;

                  const radius = 30 + (Math.max(-100, Math.min(-30, node.rssi)) + 100) * 0.5;

                  return (
                    <circle
                      key={`cov-${node.nodeId}`}
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill="none"
                      stroke={node.rssi > -60 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)'}
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Draw node markers */}
                {nodes.map((node) => {
                  const pos = projectLatLng(node.location.lat, node.location.lng);
                  const hasCriticalAlert = activeAlerts.some(
                    a => a.sourceNodeId === node.nodeId && a.severity === 'critical'
                  );

                  const isOffline = node.status === 'dead' || node.status === 'inactive' || node.battery <= 0;

                  return (
                    <g key={`marker-${node.nodeId}`}>
                      {hasCriticalAlert && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="4"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="1"
                        >
                          <animate
                            attributeName="r"
                            values="4;14"
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
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="3.5"
                        fill={hasCriticalAlert ? '#ef4444' : isOffline ? '#9ca3af' : '#10b981'}
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <text x={pos.x} y={pos.y - 6} textAnchor="middle" fill={darkMode ? '#9ca3af' : '#4b5563'} className="text-[6px] font-mono font-bold">
                        {node.nodeId}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Map Info Box */}
          <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-3 flex items-start gap-2.5">
            <Info className="text-primary-500 flex-shrink-0 mt-0.5" size={14} />
            <p className="text-[9px] text-text-sub leading-normal font-medium">
              วงกลมแสดงขอบเขตสัญญาณวิทยุ 2.4GHz ที่ผ่านการจำลอง พื้นที่ทับซ้อนแสดงส่วนเชื่อมโยงโครงข่ายแบบ Mesh ส่วนกรอบสีแดงประแสดงพื้นที่เงาอับสัญญาณเนื่องจากแนวเขาดอยปุยบดบัง
            </p>
          </div>

        </div>

      </div>

      {/* Recommended placements & signal matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Placement recommendations */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between bg-bg-surface border-border-main">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500" size={18} />
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">ระบบแนะนำการติดตั้งเสริมในจุดอับสัญญาณ</h4>
          </div>

          <div className="space-y-3 flex-1">
            {deadZones.map((zone, idx) => (
              <div key={idx} className="p-3 bg-bg-surface-elevated/30 border border-border-main rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-main">{zone.name}</span>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    zone.severity === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                    {zone.severity === 'High' ? 'ความเสี่ยงสูง' : 'ความเสี่ยงปานกลาง'}
                  </span>
                </div>
                <p className="text-[10px] text-text-sub font-medium">{zone.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signal quality details table */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between bg-bg-surface border-border-main">
          <div className="flex items-center gap-2 mb-4">
            <Signal className="text-primary-500" size={18} />
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">ตารางแสดงความแรงสัญญาณโครงข่าย</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-left">
              <thead>
                <tr className="border-b border-border-main text-text-muted">
                  <th className="pb-2 font-bold">โหนดคู่เชื่อมต่อ</th>
                  <th className="pb-2 font-bold">RSSI (dBm)</th>
                  <th className="pb-2 font-bold">คุณภาพลิงก์</th>
                  <th className="pb-2 text-right font-bold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-text-sub font-medium">
                <tr>
                  <td className="py-2">node-01 ↔ node-02</td>
                  <td className="py-2">-52</td>
                  <td className="py-2">ดีเยี่ยม (225/255)</td>
                  <td className="py-2 text-right text-emerald-600 dark:text-emerald-400 font-bold">ใช้งานอยู่</td>
                </tr>
                <tr>
                  <td className="py-2">node-02 ↔ node-03</td>
                  <td className="py-2">-65</td>
                  <td className="py-2">ดี (192/255)</td>
                  <td className="py-2 text-right text-emerald-600 dark:text-emerald-400 font-bold">ใช้งานอยู่</td>
                </tr>
                <tr>
                  <td className="py-2">node-04 ↔ node-07</td>
                  <td className="py-2">-58</td>
                  <td className="py-2">ดี (208/255)</td>
                  <td className="py-2 text-right text-emerald-600 dark:text-emerald-400 font-bold">ใช้งานอยู่</td>
                </tr>
                <tr>
                  <td className="py-2">node-05 ↔ node-08</td>
                  <td className="py-2">-80</td>
                  <td className="py-2">สัญญาณดรอป (145/255)</td>
                  <td className="py-2 text-right text-amber-600 dark:text-amber-500 font-bold">สัญญาณอ่อน</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
