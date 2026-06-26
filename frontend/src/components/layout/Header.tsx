import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setDarkMode, removeNotification, clearNotifications } from '../../store/slices/uiSlice';
import { Sun, Moon, Wifi, WifiOff, User as UserIcon, LogOut, Bell, BellOff, Trash2, X, AlertOctagon, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { logout } from '../../store/slices/userSlice';

interface HeaderProps {
  socketConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ socketConnected }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-text-sub hover:text-text-main p-2 rounded-xl bg-bg-surface-elevated hover:bg-bg-surface-elevated/80 border border-border-main transition-colors focus:outline-none relative cursor-pointer flex items-center justify-center"
            title="การแจ้งเตือน"
            aria-label="Notifications"
          >
            <Bell size={16} className={notifications.length > 0 ? "animate-pulse text-primary-500" : ""} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                {notifications.length}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-80 glass-panel border border-border-main rounded-2xl shadow-xl z-50 py-3 bg-bg-surface/95 backdrop-blur-md animate-fade-in flex flex-col max-h-[350px]">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-4 pb-2 border-b border-border-main/50">
                <span className="text-xs font-bold text-text-main">การแจ้งเตือน ({notifications.length})</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => dispatch(clearNotifications())}
                    className="text-[10px] text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={10} /> ล้างทั้งหมด
                  </button>
                )}
              </div>

              {/* Dropdown List */}
              <div className="overflow-y-auto flex-1 divide-y divide-border-main/20">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-text-muted">
                    <BellOff size={22} className="mb-2 opacity-50 text-text-sub" />
                    <p className="text-xs font-semibold">ไม่มีการแจ้งเตือนในขณะนี้</p>
                  </div>
                ) : (
                  notifications.map((toast) => {
                    let Icon = Info;
                    let iconColor = 'text-blue-500';
                    if (toast.type === 'error') {
                      Icon = AlertOctagon;
                      iconColor = 'text-red-500';
                    } else if (toast.type === 'warning') {
                      Icon = AlertTriangle;
                      iconColor = 'text-amber-500';
                    } else if (toast.type === 'success') {
                      Icon = CheckCircle;
                      iconColor = 'text-emerald-500';
                    }

                    return (
                      <div key={toast.id} className="p-3 hover:bg-bg-surface-elevated/40 transition-colors flex items-start gap-2.5 group">
                        <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                          <p className="text-xs text-text-sub font-semibold leading-snug break-words pr-1">{toast.message}</p>
                          <span className="text-[8px] text-text-muted font-mono">
                            {new Date(toast.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeNotification(toast.id));
                          }}
                          className="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-bg-surface-elevated transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shrink-0"
                          title="ลบ"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
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
