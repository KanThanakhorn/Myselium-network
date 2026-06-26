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
    <header className="glass-panel border-b border-border-main h-16 flex items-center justify-between px-6 sticky top-0 z-30 w-full bg-bg-surface/90">
      {/* Current Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-text-main tracking-tight m-0">{tabTitle}</h1>
        <span className="text-[9px] bg-bg-surface-elevated text-text-sub px-2.5 py-0.5 rounded-full font-mono font-medium border border-border-main">
          ระบบ / {tabTitle}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Network Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface-elevated/80 border border-border-main text-xs">
          {socketConnected ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-1">
                <Wifi size={11} /> สัญญาณสดออนไลน์
              </span>
            </>
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              <span className="text-red-500 dark:text-red-400 font-mono font-bold text-[10px] flex items-center gap-1">
                <WifiOff size={11} /> ข้อมูลออฟไลน์
              </span>
            </>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => dispatch(setDarkMode(!darkMode))}
          className="text-text-sub hover:text-text-main p-2 rounded-xl bg-bg-surface-elevated hover:bg-bg-surface-elevated/80 border border-border-main transition-colors focus:outline-none"
          title={darkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
        </button>

        {/* User Info & Profile */}
        {currentUser && (
          <div className="flex items-center gap-3 border-l border-border-main pl-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-text-main leading-none">{currentUser.name || currentUser.email}</span>
              <span className="text-[9px] text-primary-600 dark:text-primary-500 font-bold font-mono uppercase tracking-wider mt-0.5">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
            
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm shadow-primary-500/5">
              <UserIcon size={16} />
            </div>

            <button
              onClick={() => dispatch(logout())}
              className="text-text-muted hover:text-red-500 p-2 rounded-xl hover:bg-red-500/5 transition-colors border border-transparent focus:outline-none"
              title="ออกจากระบบ"
              aria-label="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
