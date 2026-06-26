import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Cpu, ShieldAlert, WifiOff, BatteryMedium, Activity, Map } from 'lucide-react';

const Statusbar: React.FC = () => {
  const metrics = useSelector((state: RootState) => state.nodes.metrics);
  const nodes = useSelector((state: RootState) => state.nodes.list);
  const activeAlerts = useSelector((state: RootState) => state.alerts.active);
  
  // Calculate states dynamically from active application state
  const totalNodesCount = nodes.length;
  const onlineNodesCount = nodes.filter(n => n.status === 'active').length;
  const offlineNodesCount = nodes.filter(n => n.status === 'inactive' || n.status === 'dead').length;
  const activeAlertsCount = activeAlerts.length;

  const avgBattery = React.useMemo(() => {
    const activeNodes = nodes.filter(n => n.status === 'active');
    if (activeNodes.length === 0) return 0;
    const sum = activeNodes.reduce((acc, node) => acc + node.battery, 0);
    return Math.round(sum / activeNodes.length);
  }, [nodes]);

  // Derived Coverage area based on the percentage of online nodes
  const coverageAreaPercent = React.useMemo(() => {
    if (totalNodesCount === 0) return 0;
    return Math.round((onlineNodesCount / totalNodesCount) * 1000) / 10;
  }, [onlineNodesCount, totalNodesCount]);

  const cards = [
    {
      title: 'แจ้งเตือนวิกฤต',
      value: activeAlertsCount.toString(),
      subtitle: activeAlertsCount > 0 ? 'พบความเสี่ยงไฟป่า' : 'สถานการณ์ปกติ',
      icon: ShieldAlert,
      colorClass: activeAlertsCount > 0 ? 'text-red-500 animate-pulse' : 'text-text-muted',
      borderClass: activeAlertsCount > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-border-main',
    },
    {
      title: 'เซนเซอร์ออนไลน์',
      value: `${onlineNodesCount} โหนด`,
      subtitle: `จากทั้งหมด ${totalNodesCount} โหนด`,
      icon: Cpu,
      colorClass: 'text-emerald-500',
      borderClass: 'border-border-main',
    },
    {
      title: 'เซนเซอร์ออฟไลน์',
      value: `${offlineNodesCount} โหนด`,
      subtitle: 'ต้องการการบำรุงรักษา',
      icon: WifiOff,
      colorClass: offlineNodesCount > 0 ? 'text-amber-500' : 'text-text-muted',
      borderClass: 'border-border-main',
    },
    {
      title: 'ประจุแบตเตอรี่เฉลี่ย',
      value: `${avgBattery}%`,
      subtitle: 'โหนดออนไลน์ทุกตัว',
      icon: BatteryMedium,
      colorClass: avgBattery > 50 ? 'text-emerald-500' : avgBattery > 20 ? 'text-amber-500' : 'text-red-500',
      borderClass: 'border-border-main',
    },
    {
      title: 'ความเสถียรระบบ',
      value: `${metrics.networkUptime || 99.7}%`,
      subtitle: 'เฉลี่ยทำงาน 30 วัน',
      icon: Activity,
      colorClass: 'text-blue-500',
      borderClass: 'border-border-main',
    },
    {
      title: 'พื้นที่ครอบคลุม',
      value: `${coverageAreaPercent}%`,
      subtitle: 'อิงตามสัดส่วนออนไลน์',
      icon: Map,
      colorClass: 'text-purple-500',
      borderClass: 'border-border-main',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-6 pt-6 pb-2">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`glass-panel border ${card.borderClass} rounded-2xl p-4 flex items-center justify-between relative overflow-hidden bg-bg-surface`}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider truncate">
                {card.title}
              </span>
              <span className="text-lg font-bold text-text-main tracking-tight mt-1 leading-none truncate">
                {card.value}
              </span>
              <span className="text-[10px] text-text-sub mt-2 truncate font-medium">
                {card.subtitle}
              </span>
            </div>

            <div className={`p-2 rounded-xl bg-bg-surface-elevated border border-border-main shrink-0 ${card.colorClass}`}>
              <Icon size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Statusbar;
