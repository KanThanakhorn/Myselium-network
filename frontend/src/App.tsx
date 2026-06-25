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
import NetworkTopology from './components/network/NetworkTopology';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
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
import { fetchNodes, fetchRoutes, fetchSystemHealth } from './store/slices/nodesSlice';


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

  // Fetch initial telemetry and dynamic routing data
  useEffect(() => {
    dispatch(fetchNodes() as any);
    dispatch(fetchRoutes() as any);
    dispatch(fetchSystemHealth() as any);
  }, [dispatch]);

  // Handle Quick Actions
  const handleAcknowledgeAll = () => {
    if (activeAlerts.length === 0) {
      dispatch(addNotification({ message: 'ไม่มีการแจ้งเตือนปัจจุบันให้รับทราบ', type: 'info' }));
      return;
    }
    dispatch(acknowledgeAllAlerts('ranger_somchai'));
    dispatch(addNotification({ message: 'รับทราบการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว', type: 'success' }));
  };

  const handleDownloadReport = () => {
    dispatch(addNotification({ message: 'กำลังเริ่มการดาวน์โหลดรายงาน...', type: 'success' }));
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
      message: `⚠️ วิกฤต: ตรวจพบไฟไหม้/กลุ่มควันหนาแน่น ที่จุด ${testAlert.sourceNodeId}!`,
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

        {/* Emergency Alert Banner */}
        {activeAlerts.some(a => a.severity === 'critical' && a.status === 'active') && (
          <div className="bg-red-500/15 border-y border-red-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <AlertOctagon size={14} className="text-red-500" />
                แจ้งเตือนฉุกเฉิน: ตรวจพบไฟไหม้/กลุ่มควันหนาแน่น จากเซนเซอร์ในป่าดอยสุเทพ!
              </span>
            </div>
            <button 
              onClick={handleAcknowledgeAll}
              className="text-[10px] font-bold uppercase px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-colors cursor-pointer"
            >
              รับทราบเหตุทั้งหมด
            </button>
          </div>
        )}

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
                  <h3 className="text-sm font-semibold text-white">แผงควบคุมและดำเนินการด่วน</h3>
                  <p className="text-xs text-gray-400 mt-1">ควบคุมระบบการวัดระยะไกลและการทดสอบจำลองเหตุการณ์</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={triggerTestSimulation}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-400 transition-colors shadow-lg shadow-red-500/20"
                  >
                    <Flame size={14} /> จำลองสัญญาณไฟป่า
                  </button>
                  <button
                    onClick={handleAcknowledgeAll}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-colors"
                  >
                    <CheckCircle size={14} /> รับทราบเหตุทั้งหมด
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
                  >
                    <Download size={14} /> ดาวน์โหลดรายงาน
                  </button>
                </div>
              </div>

              {/* Grid Layout: Map Info / Algorithm Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mycelium Bio-Routing context */}
                <div className="glass-panel border-gray-800 rounded-3xl p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Workflow className="text-emerald-400" size={20} />
                    <h3 className="text-sm font-semibold text-white">ค่าพารามิเตอร์ระบบหาเส้นทาง Mycelium</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-5">
                    โปรโตคอลการฟื้นฟูตัวเองที่ได้รับแรงบันดาลใจจากธรรมชาติ (โครงข่ายรากเห็ด Mycelium) ในการหาเส้นทางส่งสัญญาณหลบหลีกสิ่งกีดขวางหรือจุดโหนดที่ล้มเหลว โดยจะคำนวณค่าน้ำหนักจาก 3 ค่าปัจจัยหลัก:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">พลังงานแบตเตอรี่คงเหลือ (α)</span>
                      <div className="text-lg font-bold text-white mt-1">ค่าน้ำหนัก: 0.50</div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-800">
                        <div className="bg-emerald-400 h-full w-[50%]"></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">คุณภาพความแรงสัญญาณ RSSI (β)</span>
                      <div className="text-lg font-bold text-white mt-1">ค่าน้ำหนัก: 0.30</div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-800">
                        <div className="bg-blue-400 h-full w-[30%]"></div>
                      </div>
                    </div>

                    <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">ความเร่งด่วนของข้อมูล (γ)</span>
                      <div className="text-lg font-bold text-white mt-1">ค่าน้ำหนัก: 0.20</div>
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
                      <h3 className="text-sm font-semibold text-white">บันทึกเหตุการณ์ฟื้นฟูตัวเองอัตโนมัติ</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      สด
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-2">
                    <div className="p-3 bg-gray-950/40 border border-gray-800 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-red-400">โหนด Node-06 ล้มเหลว</span>
                        <span className="text-[9px] font-mono text-gray-500">10 นาทีที่แล้ว</span>
                      </div>
                      <p className="text-xs text-gray-300">เปลี่ยนเส้นทางผ่าน Node-03 และ Node-01 การส่งข้อมูลสำเร็จ</p>
                      <span className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                        <CheckCircle size={10} /> เวลาในการกู้คืนระบบ: 245ms
                      </span>
                    </div>

                    <div className="p-3 bg-gray-950/40 border border-gray-800 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400">คุณภาพลิงก์สัญญาณลดลง</span>
                        <span className="text-[9px] font-mono text-gray-500">1 ชั่วโมงที่แล้ว</span>
                      </div>
                      <p className="text-xs text-gray-300">ค่า RSSI ลดลงระหว่าง Node-05 → Node-08 สลับไปใช้เส้นทางสำรอง</p>
                      <span className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                        <CheckCircle size={10} /> เวลาในการกู้คืนระบบ: 180ms
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
                            <AlertOctagon size={10} /> ตรวจพบไฟไหม้
                          </span>
                        ) : node.status === 'active' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ออนไลน์
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-855 text-gray-500 border border-gray-800">
                            ออฟไลน์
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
                          <span className="text-[9px] font-mono text-gray-500 uppercase">อุณหภูมิ</span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {node.status === 'dead' ? '—' : `${node.sensors.temp.toFixed(1)}°C`}
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">ควันไฟ</span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {node.status === 'dead' ? '—' : `${node.sensors.smoke} ppm`}
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">ความชื้น</span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {node.status === 'dead' ? '—' : `${node.sensors.humidity.toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-950/40 rounded-2xl border border-gray-900/50 flex flex-col">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">แบตเตอรี่</span>
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
            <NetworkTopology />
          )}

          {/* 5. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {/* 6. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="px-6 max-w-2xl mx-auto space-y-6">
              <div className="glass-panel border-gray-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-900 pb-3">
                  <SettingsIcon className="text-gray-400" size={20} />
                  <h3 className="text-sm font-semibold text-white">ตั้งค่าพารามิเตอร์ระบบ</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">ขีดจำกัดอุณหภูมิวิกฤต (°C)</label>
                    <input 
                      type="number" 
                      defaultValue={40} 
                      className="bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <span className="text-[10px] text-gray-500">ส่งสัญญาณเตือนภัยวิกฤตหากพบอุณหภูมิโหนดใดสูงเกินขีดจำกัดนี้</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-400">ขีดจำกัดความหนาแน่นควันวิกฤต (ppm)</label>
                    <input 
                      type="number" 
                      defaultValue={400} 
                      className="bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <span className="text-[10px] text-gray-500">ส่งสัญญาณเตือนภัยวิกฤตหากพบค่าความเข้มข้นควันเกินขีดจำกัดนี้</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-400">ขีดจำกัดค่าฝุ่น PM2.5 วิกฤต (µg/m³)</label>
                    <input 
                      type="number" 
                      defaultValue={100} 
                      className="bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <span className="text-[10px] text-gray-500">ส่งสัญญาณเตือนอันตรายต่อสุขภาพหากพบฝุ่น PM2.5 เกินขีดจำกัดนี้</span>
                  </div>

                  <div className="pt-4 border-t border-gray-900 flex justify-end">
                    <button
                      onClick={() => dispatch(addNotification({ message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', type: 'success' }))}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors"
                    >
                      บันทึกการตั้งค่า
                    </button>
                  </div>
                </div>
              </div>
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
