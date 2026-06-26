import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const AlertToasts: React.FC = () => {
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

  return null;
};

export default AlertToasts;
