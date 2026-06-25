import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setDarkMode } from '../../store/slices/uiSlice';
import { Sun, Moon, Wifi, WifiOff, User as UserIcon, LogOut } from 'lucide-react';
import { logout } from '../../store/slices/userSlice';

interface HeaderProps {
  socketConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ socketConnected }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview': return 'ภาพรวมโครงข่าย';
      case 'alerts': return 'การแจ้งเตือนไฟป่า';
      case 'nodes': return 'อุปกรณ์และสถานะเซนเซอร์';
      case 'health': return 'สุขภาพเครือข่ายและเส้นทาง';
      case 'analytics': return 'กราฟสถิติและข้อมูล';
      case 'settings': return 'ตั้งค่าระบบ';
      default: return tab;
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'ผู้ดูแลระบบ';
    if (role === 'ranger') return 'เจ้าหน้าที่ป่าไม้';
    return role;
  };

  const tabTitle = getTabTitle(activeTab);

  return (
    <header className="glass-panel border-b border-gray-800 h-16 flex items-center justify-between px-6 sticky top-0 z-30 w-full">
      {/* Current Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-wide m-0">{tabTitle}</h1>
        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono font-medium">
          ระบบ / {tabTitle}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Network Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/40 border border-gray-800 text-xs">
          {socketConnected ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-emerald-400 font-mono font-medium text-[11px] flex items-center gap-1">
                <Wifi size={12} /> สัญญาณสดออนไลน์
              </span>
            </>
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              <span className="text-red-400 font-mono font-medium text-[11px] flex items-center gap-1">
                <WifiOff size={12} /> ข้อมูลออฟไลน์
              </span>
            </>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => dispatch(setDarkMode(!darkMode))}
          className="text-gray-400 hover:text-white p-2 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 border border-gray-800/50 transition-colors"
          title={darkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* User Info & Profile */}
        {currentUser && (
          <div className="flex items-center gap-3 border-l border-gray-800 pl-5">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-none">{currentUser.name || currentUser.email}</span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider mt-0.5">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserIcon size={18} />
            </div>

            <button
              onClick={() => dispatch(logout())}
              className="text-gray-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors ml-1"
              title="ออกจากระบบ"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
