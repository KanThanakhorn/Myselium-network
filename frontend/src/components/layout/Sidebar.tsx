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
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlerts > 0 ? activeAlerts : undefined },
    { id: 'nodes', label: 'Nodes & Status', icon: Cpu },
    { id: 'health', label: 'Network Health', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside 
      className={`glass-panel border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      } h-screen sticky top-0`}
    >
      {/* Sidebar Header Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <ShieldAlert className="w-5 h-5 text-dark-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-wider leading-none">MYCELIUM</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest mt-0.5">Forest Guard</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <ShieldAlert className="w-5 h-5 text-dark-950" />
          </div>
        )}

        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800/50 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveTab(item.id))}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/30 border border-transparent'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-200'
                }`} 
              />
              
              {sidebarOpen && (
                <span className="text-sm tracking-wide flex-1 text-left">{item.label}</span>
              )}

              {/* Badge for Alerts */}
              {item.badge !== undefined && (
                <span className={`flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold rounded-full ${
                  item.id === 'alerts' 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-emerald-500 text-dark-950'
                } ${!sidebarOpen && 'absolute top-1 right-1'}`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-950 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-gray-800 text-center">
        {sidebarOpen ? (
          <div className="text-[11px] text-gray-500 font-mono">
            v1.0.0-Beta
          </div>
        ) : (
          <div className="text-[10px] text-gray-500 font-mono">v1.0</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
