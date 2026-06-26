import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';
import { X, AlertOctagon, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const AlertToasts: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  // Programmatic alarm sound synthesizer using Web Audio API
  const playAlertSound = (type: string) => {
    if (type !== 'error' && type !== 'warning') return;
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // We create a dual tone alarm for critical alerts
      if (type === 'error') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        
        osc1.start();
        osc2.start();

        setTimeout(() => {
          osc1.stop();
          osc2.stop();
          audioCtx.close();
        }, 400);
      } else {
        // Shorter warning beep
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

        osc.start();

        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 150);
      }
    } catch (e) {
      console.warn('AudioContext sound failed to play:', e);
    }
  };

  // Play sound whenever a new notification is added
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      playAlertSound(latest.type);
    }
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {notifications.map((toast) => {
        let bgClass = 'bg-bg-surface text-text-main border-border-main shadow-lg';
        let iconColor = 'text-blue-500';
        let Icon = Info;

        if (toast.type === 'error') {
          bgClass = 'bg-red-50 dark:bg-red-950/90 text-red-900 dark:text-red-100 border-red-200 dark:border-red-500/20 shadow-lg shadow-red-100 dark:shadow-black/20';
          iconColor = 'text-red-500';
          Icon = AlertOctagon;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-500/20 shadow-lg shadow-amber-100 dark:shadow-black/20';
          iconColor = 'text-amber-500';
          Icon = AlertTriangle;
        } else if (toast.type === 'success') {
          bgClass = 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-500/20 shadow-lg shadow-emerald-100 dark:shadow-black/20';
          iconColor = 'text-emerald-500';
          Icon = CheckCircle;
        }

        return (
          <ToastItem
            key={toast.id}
            toast={toast}
            bgClass={bgClass}
            iconColor={iconColor}
            Icon={Icon}
            onClose={() => dispatch(removeNotification(toast.id))}
          />
        );
      })}
    </div>
  );
};

// Subcomponent to handle individual timers properly
const ToastItem: React.FC<{
  toast: any;
  bgClass: string;
  iconColor: string;
  Icon: any;
  onClose: () => void;
}> = ({ toast, bgClass, iconColor, Icon, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // 8 seconds auto-dismiss
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`p-4 rounded-2xl border ${bgClass} flex items-start gap-3 pointer-events-auto transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 flex flex-col gap-0.5">
        <p className="text-xs font-bold tracking-wide leading-tight">{toast.message}</p>
        <span className="text-[9px] text-text-muted font-mono mt-1">
          {new Date(toast.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-bg-surface-elevated transition-colors focus:outline-none"
        aria-label="Dismiss toast"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default AlertToasts;
