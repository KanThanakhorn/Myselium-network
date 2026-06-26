import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Cpu,
  Flame, 
  CheckCircle, 
  Download, 
  MapPin, 
  Battery, 
  Activity, 
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

  // Apply Theme class on documentElement for Tailwind 4 class compatibility
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

  const hasActiveFireAlert = activeAlerts.some(a => a.severity === 'critical' && a.status === 'active');

  return (
    <div className="flex min-h-screen bg-bg-app text-text-main transition-colors duration-200">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Layout */}
        <Header socketConnected={isConnected} />

        {/* Emergency Alert Banner */}
        {hasActiveFireAlert && (
          <div className="bg-red-500/10 border-y border-red-500/20 px-6 py-3.5 flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5 animate-pulse-soft">
                <AlertOctagon size={14} className="text-red-500" />
                แจ้งเตือนฉุกเฉิน: ตรวจพบไฟไหม้/กลุ่มควันหนาแน่น จากเซนเซอร์ในป่าดอยสุเทพ!
              </span>
            </div>
            <button 
              onClick={handleAcknowledgeAll}
              className="text-[10px] font-extrabold uppercase px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-lg border border-red-500/20 transition-colors cursor-pointer focus:outline-none"
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
              <div className="glass-panel rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface">
                <div>
                  <h3 className="text-sm font-bold text-text-main">แผงควบคุมและดำเนินการด่วน</h3>
                  <p className="text-xs text-text-sub mt-0.5">ควบคุมระบบการวัดระยะไกลและการทดสอบจำลองเหตุการณ์</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={triggerTestSimulation}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm focus:outline-none"
                  >
                    <Flame size={14} /> จำลองสัญญาณไฟป่า
                  </button>
                  <button
                    onClick={handleAcknowledgeAll}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors focus:outline-none"
                  >
                    <CheckCircle size={14} /> รับทราบเหตุทั้งหมด
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-bg-surface border border-border-main text-text-main hover:bg-bg-surface-elevated transition-colors focus:outline-none"
                  >
                    <Download size={14} /> ดาวน์โหลดรายงาน
                  </button>
                </div>
              </div>

              {/* Grid Layout: Map Info / Algorithm Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mycelium Bio-Routing context */}
                <div className="glass-panel rounded-3xl p-6 lg:col-span-2 bg-bg-surface">
                  <div className="flex items-center gap-2 mb-4">
                    <Workflow className="text-primary-500" size={18} />
                    <h3 className="text-sm font-bold text-text-main">ค่าพารามิเตอร์ระบบหาเส้นทาง Mycelium</h3>
                  </div>
                  <p className="text-xs text-text-sub leading-relaxed mb-5">
                    โปรโตคอลการฟื้นฟูตัวเองที่ได้รับแรงบันดาลใจจากธรรมชาติ (โครงข่ายรากเห็ด Mycelium) ในการหาเส้นทางส่งสัญญาณหลบหลีกสิ่งกีดขวางหรือจุดโหนดที่ล้มเหลว โดยจะคำนวณค่าน้ำหนักจาก 3 ค่าปัจจัยหลัก:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4">
                      <span className="text-[10px] font-mono font-semibold text-text-muted uppercase">พลังงานแบตเตอรี่คงเหลือ (α)</span>
                      <div className="text-base font-bold text-text-main mt-1">ค่าน้ำหนัก: 0.50</div>
                      <div className="w-full bg-bg-surface h-2 rounded-full mt-2.5 overflow-hidden border border-border-main">
                        <div className="bg-emerald-500 h-full w-[50%]"></div>
                      </div>
                    </div>
                    
                    <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4">
                      <span className="text-[10px] font-mono font-semibold text-text-muted uppercase">คุณภาพความแรงสัญญาณ RSSI (β)</span>
                      <div className="text-base font-bold text-text-main mt-1">ค่าน้ำหนัก: 0.30</div>
                      <div className="w-full bg-bg-surface h-2 rounded-full mt-2.5 overflow-hidden border border-border-main">
                        <div className="bg-blue-500 h-full w-[30%]"></div>
                      </div>
                    </div>

                    <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4">
                      <span className="text-[10px] font-mono font-semibold text-text-muted uppercase">ความเร่งด่วนของข้อมูล (γ)</span>
                      <div className="text-base font-bold text-text-main mt-1">ค่าน้ำหนัก: 0.20</div>
                      <div className="w-full bg-bg-surface h-2 rounded-full mt-2.5 overflow-hidden border border-border-main">
                        <div className="bg-red-500 h-full w-[20%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Self-Healing log monitor */}
                <div className="glass-panel rounded-3xl p-6 flex flex-col bg-bg-surface">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="text-primary-500 animate-pulse" size={16} />
                      <h3 className="text-sm font-bold text-text-main">บันทึกเหตุการณ์ฟื้นฟูตัวเอง</h3>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      สด
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-2">
                    <div className="p-3 bg-bg-surface-elevated/45 border border-border-main rounded-2xl flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-red-500 dark:text-red-400">โหนด Node-06 ล้มเหลว</span>
                        <span className="text-[9px] font-mono text-text-muted">10 นาทีที่แล้ว</span>
                      </div>
                      <p className="text-[11px] text-text-sub">เปลี่ยนเส้นทางผ่าน Node-03 และ Node-01 การส่งข้อมูลสำเร็จ</p>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                        <CheckCircle size={10} /> เวลาในการกู้คืนระบบ: 245ms
                      </span>
                    </div>

                    <div className="p-3 bg-bg-surface-elevated/45 border border-border-main rounded-2xl flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-500">คุณภาพลิงก์สัญญาณลดลง</span>
                        <span className="text-[9px] font-mono text-text-muted">1 ชั่วโมงที่แล้ว</span>
                      </div>
                      <p className="text-[11px] text-text-sub">ค่า RSSI ลดลงระหว่าง Node-05 → Node-08 สลับไปใช้เส้นทางสำรอง</p>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
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
              {nodes.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 text-center bg-bg-surface">
                  <Cpu className="mx-auto text-text-muted mb-4" size={40} />
                  <h3 className="text-sm font-bold text-text-main">ไม่มีข้อมูลโหนดเซนเซอร์</h3>
                  <p className="text-xs text-text-sub mt-1">ยังไม่มีโหนดที่ลงทะเบียนในระบบ หรือ ข้อมูลยังไม่ถูกดึงเข้ามา</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {nodes.map((node) => {
                    const hasCriticalAlert = activeAlerts.some(
                      a => a.sourceNodeId === node.nodeId && a.severity === 'critical'
                    );

                    return (
                      <div 
                        key={node._id}
                        className={`glass-panel rounded-3xl p-5 border flex flex-col relative transition-all duration-300 bg-bg-surface ${
                          hasCriticalAlert 
                            ? 'border-red-500/30 bg-red-500/5 shadow-md shadow-red-500/5' 
                            : node.status === 'dead'
                            ? 'opacity-60 border-border-main'
                            : 'border-border-main hover:border-text-muted'
                        }`}
                      >
                        {/* Node Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-text-main">{node.nodeId}</span>
                          {hasCriticalAlert ? (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-500 text-white animate-pulse">
                              <AlertOctagon size={10} /> ตรวจพบไฟไหม้
                            </span>
                          ) : node.status === 'active' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              ออนไลน์
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-bg-surface-elevated text-text-muted border border-border-main">
                              ออฟไลน์
                            </span>
                          )}
                        </div>

                        {/* Coordinates */}
                        <span className="text-[10px] text-text-sub font-mono flex items-center gap-0.5 mt-2.5">
                          <MapPin size={10} className="text-text-muted" /> ({node.location.lat.toFixed(4)}, {node.location.lng.toFixed(4)})
                        </span>

                        {/* Sensor Readings */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="p-2.5 bg-bg-surface-elevated/40 rounded-2xl border border-border-main flex flex-col">
                            <span className="text-[9px] font-mono text-text-muted uppercase">อุณหภูมิ</span>
                            <span className="text-xs font-bold text-text-main mt-0.5">
                              {node.status === 'dead' ? '—' : `${node.sensors.temp.toFixed(1)}°C`}
                            </span>
                          </div>
                          <div className="p-2.5 bg-bg-surface-elevated/40 rounded-2xl border border-border-main flex flex-col">
                            <span className="text-[9px] font-mono text-text-muted uppercase">ควันไฟ</span>
                            <span className="text-xs font-bold text-text-main mt-0.5">
                              {node.status === 'dead' ? '—' : `${node.sensors.smoke} ppm`}
                            </span>
                          </div>
                          <div className="p-2.5 bg-bg-surface-elevated/40 rounded-2xl border border-border-main flex flex-col">
                            <span className="text-[9px] font-mono text-text-muted uppercase">ความชื้น</span>
                            <span className="text-xs font-bold text-text-main mt-0.5">
                              {node.status === 'dead' ? '—' : `${node.sensors.humidity.toFixed(0)}%`}
                            </span>
                          </div>
                          <div className="p-2.5 bg-bg-surface-elevated/40 rounded-2xl border border-border-main flex flex-col">
                            <span className="text-[9px] font-mono text-text-muted uppercase">แบตเตอรี่</span>
                            <span className="text-xs font-bold text-text-main mt-0.5 flex items-center gap-1">
                              <Battery size={11} className={node.battery < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
                              {node.status === 'dead' ? '0%' : `${node.battery}%`}
                            </span>
                          </div>
                        </div>

                        {/* Additional Signal details */}
                        <div className="flex items-center justify-between mt-4 border-t border-border-main pt-3 text-[10px] text-text-muted font-mono">
                          <span>RSSI: {node.status === 'dead' ? '—' : `${node.rssi} dBm`}</span>
                          <span>LQI: {node.status === 'dead' ? '—' : node.lqi}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              <div className="glass-panel rounded-3xl p-6 bg-bg-surface">
                <div className="flex items-center gap-2 mb-5 border-b border-border-main pb-3">
                  <SettingsIcon className="text-text-sub" size={18} />
                  <h3 className="text-sm font-bold text-text-main">ตั้งค่าพารามิเตอร์ระบบ</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-sub">ขีดจำกัดอุณหภูมิวิกฤต (°C)</label>
                    <input 
                      type="number" 
                      defaultValue={40} 
                      className="bg-bg-surface-elevated border border-border-main rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary-500 font-mono"
                    />
                    <span className="text-[10px] text-text-muted">ส่งสัญญาณเตือนภัยวิกฤตหากพบอุณหภูมิโหนดใดสูงเกินขีดจำกัดนี้</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-text-sub">ขีดจำกัดความหนาแน่นควันวิกฤต (ppm)</label>
                    <input 
                      type="number" 
                      defaultValue={400} 
                      className="bg-bg-surface-elevated border border-border-main rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary-500 font-mono"
                    />
                    <span className="text-[10px] text-text-muted">ส่งสัญญาณเตือนภัยวิกฤตหากพบค่าความเข้มข้นควันเกินขีดจำกัดนี้</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold text-text-sub">ขีดจำกัดค่าฝุ่น PM2.5 วิกฤต (µg/m³)</label>
                    <input 
                      type="number" 
                      defaultValue={100} 
                      className="bg-bg-surface-elevated border border-border-main rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary-500 font-mono"
                    />
                    <span className="text-[10px] text-text-muted">ส่งสัญญาณเตือนอันตรายต่อสุขภาพหากพบฝุ่น PM2.5 เกินขีดจำกัดนี้</span>
                  </div>

                  <div className="pt-5 border-t border-border-main flex justify-end">
                    <button
                      onClick={() => dispatch(addNotification({ message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', type: 'success' }))}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors focus:outline-none"
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
