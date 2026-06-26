import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setActiveTab, toggleSidebar } from '../../store/slices/uiSlice';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  BarChart3, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const activeAlerts = useSelector((state: RootState) => state.alerts.active.length);

  const menuItems = [
    { id: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
    { id: 'alerts', label: 'การแจ้งเตือน', icon: AlertTriangle, badge: activeAlerts > 0 ? activeAlerts : undefined },
    { id: 'nodes', label: 'อุปกรณ์และสถานะ', icon: Cpu },
    { id: 'health', label: 'โครงข่ายและเส้นทาง', icon: Activity },
    { id: 'analytics', label: 'กราฟสถิติและข้อมูล', icon: BarChart3 },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: SettingsIcon },
  ];

  return (
    <aside 
      className={`glass-panel border-r border-border-main transition-all duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'w-[256px]' : 'w-[80px]'
      } h-screen sticky top-0 z-40 bg-bg-surface`}
    >
      {/* Sidebar Header Brand */}
      <div className="flex items-center justify-between p-4 border-b border-border-main h-16 bg-bg-surface/50">
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/10">
              <ShieldAlert className="w-5 h-5 text-white font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-text-main text-xs tracking-wider leading-none uppercase">Mycelium</span>
              <span className="text-[9px] text-primary-600 dark:text-primary-500 font-bold uppercase tracking-widest mt-0.5">Forest Guard</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/10">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
        )}

        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-bg-surface-elevated transition-colors border border-transparent focus:outline-none"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveTab(item.id))}
              className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all duration-200 group relative border focus:outline-none ${
                isActive 
                  ? 'bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-500 font-semibold shadow-[0_1px_2px_rgba(16,185,129,0.05)]' 
                  : 'text-text-sub hover:text-text-main hover:bg-bg-surface-elevated border-transparent'
              }`}
            >
              <Icon 
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-primary-500' : 'text-text-muted group-hover:text-text-sub'
                }`} 
              />
              
              {sidebarOpen && (
                <span className="text-xs font-medium tracking-wide flex-1 text-left">{item.label}</span>
              )}

              {/* Badge for Alerts */}
              {item.badge !== undefined && (
                <span className={`flex items-center justify-center min-w-5 h-5 px-1.5 text-[9px] font-bold rounded-full ${
                  item.id === 'alerts' 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-primary-500 text-white'
                } ${!sidebarOpen && 'absolute top-1 right-1'}`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-4 px-2.5 py-1 bg-gray-900 dark:bg-bg-surface-elevated text-white text-[10px] font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md whitespace-nowrap z-50 border border-border-main">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-border-main text-center bg-bg-surface/50">
        {sidebarOpen ? (
          <div className="text-[10px] text-text-muted font-mono">
            v1.0.0-Beta
          </div>
        ) : (
          <div className="text-[9px] text-text-muted font-mono">v1.0</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
