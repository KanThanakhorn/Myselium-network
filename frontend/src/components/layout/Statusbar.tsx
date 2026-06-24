import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Cpu, ShieldAlert, Clock, BatteryMedium } from 'lucide-react';

const Statusbar: React.FC = () => {
  const metrics = useSelector((state: RootState) => state.nodes.metrics);
  const activeNodesCount = useSelector((state: RootState) => {
    return state.nodes.list.filter(n => n.status === 'active').length;
  });
  const totalNodesCount = useSelector((state: RootState) => state.nodes.list.length);
  const activeAlertsCount = useSelector((state: RootState) => {
    return state.alerts.active.filter(a => a.severity === 'critical').length;
  });

  // Calculate average battery level
  const avgBattery = useSelector((state: RootState) => {
    const activeNodes = state.nodes.list.filter(n => n.status === 'active');
    if (activeNodes.length === 0) return 0;
    const sum = activeNodes.reduce((acc, node) => acc + node.battery, 0);
    return Math.round(sum / activeNodes.length);
  });

  const cards = [
    {
      title: 'Active Nodes',
      value: `${activeNodesCount} / ${totalNodesCount}`,
      subtitle: 'Online sensor grid',
      icon: Cpu,
      colorClass: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 to-emerald-500/0',
      borderClass: 'border-emerald-500/10',
    },
    {
      title: 'Critical Alerts',
      value: activeAlertsCount.toString(),
      subtitle: 'Active fire warnings',
      icon: ShieldAlert,
      colorClass: activeAlertsCount > 0 ? 'text-red-400 animate-pulse' : 'text-gray-400',
      bgGradient: activeAlertsCount > 0 ? 'from-red-500/10 to-red-500/0' : 'from-gray-500/5 to-gray-500/0',
      borderClass: activeAlertsCount > 0 ? 'border-red-500/20' : 'border-gray-800',
    },
    {
      title: 'Network Uptime',
      value: `${metrics.networkUptime}%`,
      subtitle: 'Average 30-day uptime',
      icon: Clock,
      colorClass: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-blue-500/0',
      borderClass: 'border-blue-500/10',
    },
    {
      title: 'Average Battery',
      value: `${avgBattery}%`,
      subtitle: 'Calculated node health',
      icon: BatteryMedium,
      colorClass: avgBattery > 50 ? 'text-emerald-400' : avgBattery > 20 ? 'text-amber-400' : 'text-red-400',
      bgGradient: 'from-amber-500/5 to-amber-500/0',
      borderClass: 'border-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`glass-panel border ${card.borderClass} rounded-2xl p-5 flex items-center justify-between bg-gradient-to-br ${card.bgGradient} relative overflow-hidden`}
          >
            {/* Background Glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-current opacity-[0.02] rounded-full blur-xl pointer-events-none"></div>

            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                {card.title}
              </span>
              <span className="text-2xl font-bold text-white tracking-tight mt-1.5 leading-none">
                {card.value}
              </span>
              <span className="text-xs text-gray-400 mt-2 font-medium">
                {card.subtitle}
              </span>
            </div>

            <div className={`p-3 rounded-xl bg-gray-800/40 border border-gray-800/50 ${card.colorClass}`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Statusbar;
