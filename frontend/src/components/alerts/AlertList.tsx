import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { acknowledgeAlert, setAlertFilters } from '../../store/slices/alertsSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { Search, Filter, ShieldAlert, CheckCircle, Clock, MapPin, Eye } from 'lucide-react';
import type { Alert, AlertSeverity } from '../../types';

interface AlertListProps {
  onSelectAlert: (alert: Alert) => void;
}

const AlertList: React.FC<AlertListProps> = ({ onSelectAlert }) => {
  const dispatch = useDispatch();
  const activeAlerts = useSelector((state: RootState) => state.alerts.active);
  const historicalAlerts = useSelector((state: RootState) => state.alerts.history);
  const filters = useSelector((state: RootState) => state.alerts.filters);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'resolved'>('active');

  const allAlerts = activeSubTab === 'active' ? activeAlerts : historicalAlerts;

  // Filter alerts based on UI selections
  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = 
      alert.alertId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.sourceNodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.location.lat.toString() + ',' + alert.location.lng.toString()).includes(searchTerm);

    const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;

    return matchesSearch && matchesSeverity;
  });

  const handleAcknowledge = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation(); // Avoid triggering row select
    const rangerId = currentUser?.name || 'ranger_somchai';
    dispatch(acknowledgeAlert({ alertId, rangerId }) as any);
    dispatch(addNotification({
      message: `รับทราบการแจ้งเตือน ${alertId} เรียบร้อยแล้ว`,
      type: 'success',
    }));
  };

  const handleSeverityFilter = (severity: AlertSeverity | 'all') => {
    dispatch(setAlertFilters({ severity }));
  };

  const getSeverityLabel = (sev: string) => {
    switch (sev) {
      case 'all': return 'ทั้งหมด';
      case 'critical': return 'วิกฤต';
      case 'warning': return 'เตือนภัย';
      case 'info': return 'ข้อมูล';
      default: return sev;
    }
  };

  const getSensorLabel = (sensor: string) => {
    switch (sensor) {
      case 'temperature': return 'อุณหภูมิ';
      case 'smoke': return 'ควันไฟ';
      case 'humidity': return 'ความชื้น';
      case 'battery': return 'แบตเตอรี่';
      default: return sensor;
    }
  };

  // Severity Colors mapping (Critical = Red, High/Warning = Orange, Medium = Yellow, Low = Blue, Info = Gray)
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'high':
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'info':
      default:
        return 'bg-gray-500/10 text-text-sub border-border-main';
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 h-full">
      {/* Filters & Search Header */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 bg-bg-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Sub-tabs: Active vs Resolved */}
          <div className="flex p-0.5 bg-bg-surface-elevated rounded-xl w-fit border border-border-main">
            <button
              onClick={() => setActiveSubTab('active')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all focus:outline-none ${
                activeSubTab === 'active' 
                  ? 'bg-bg-surface border border-border-main text-red-500' 
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              แจ้งเตือนปัจจุบัน ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('resolved')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all focus:outline-none ${
                activeSubTab === 'resolved' 
                  ? 'bg-bg-surface border border-border-main text-emerald-500' 
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              ประวัติเหตุการณ์ ({historicalAlerts.length})
            </button>
          </div>

          {/* Quick Severity Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono flex items-center gap-1">
              <Filter size={12} /> ความรุนแรง:
            </span>
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => handleSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border focus:outline-none ${
                  filters.severity === sev
                    ? sev === 'critical'
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : sev === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : sev === 'info'
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      : 'bg-primary-500/10 border-primary-500/20 text-primary-500'
                    : 'bg-transparent border-border-main text-text-sub hover:text-text-main hover:bg-bg-surface-elevated'
                }`}
              >
                {getSeverityLabel(sev)}
              </button>
            ))}
          </div>

        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาด้วย รหัสการแจ้งเตือน, รหัสโหนด, หรือ พิกัด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-bg-surface-elevated border border-border-main rounded-xl text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-primary-500 transition-colors font-medium"
          />
        </div>
      </div>

      {/* Alerts List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-main bg-bg-surface-elevated/40 text-text-muted font-mono text-[9px] uppercase tracking-wider">
                <th className="py-4.5 px-5 font-bold">รหัส</th>
                <th className="py-4.5 px-5 font-bold">เวลาตรวจพบ</th>
                <th className="py-4.5 px-5 font-bold">ความรุนแรง</th>
                <th className="py-4.5 px-5 font-bold">โหนดต้นทาง</th>
                <th className="py-4.5 px-5 font-bold">เซนเซอร์ / ค่าที่วัดได้</th>
                <th className="py-4.5 px-5 font-bold">สถานะ</th>
                <th className="py-4.5 px-5 text-right font-bold">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  const badgeStyles = getSeverityStyles(alert.severity);
                  const isAcknowledged = !!alert.acknowledgedAt;

                  return (
                    <tr 
                      key={alert._id} 
                      onClick={() => onSelectAlert(alert)}
                      className="hover:bg-bg-surface-elevated/60 transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="py-4.5 px-5">
                        <span className="font-mono text-xs font-bold text-text-main group-hover:text-primary-500 transition-colors">
                          {alert.alertId}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4.5 px-5">
                        <div className="flex items-center gap-1.5 text-xs text-text-sub font-mono">
                          <Clock size={11} className="text-text-muted" />
                          {new Date(alert.timestamp).toLocaleTimeString()}
                          <span className="text-[10px] text-text-muted">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-4.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${badgeStyles}`}>
                          {getSeverityLabel(alert.severity)}
                        </span>
                      </td>

                      {/* Source Node */}
                      <td className="py-4.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-text-main">
                            {alert.sourceNodeId}
                          </span>
                          <span className="text-[9px] text-text-muted flex items-center gap-0.5">
                            <MapPin size={9} /> ({alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)})
                          </span>
                        </div>
                      </td>

                      {/* Sensor value */}
                      <td className="py-4.5 px-5">
                        <div className="flex flex-col">
                          <span className="text-xs text-text-main font-semibold capitalize">
                            {getSensorLabel(alert.sensorType)}
                          </span>
                          <span className="text-[10px] text-text-sub font-mono mt-0.5">
                            {alert.value} / {alert.threshold} (ขีดจำกัด)
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-5">
                        {alert.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={9} /> แก้ไขแล้ว
                          </span>
                        ) : isAcknowledged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Clock size={9} /> รับทราบแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                            <ShieldAlert size={9} /> ยังไม่จัดการ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectAlert(alert)}
                            title="ดูรายละเอียด"
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-elevated transition-all focus:outline-none"
                            aria-label="View details"
                          >
                            <Eye size={14} />
                          </button>
                          
                          {alert.status === 'active' && !isAcknowledged && (
                            <button
                              onClick={(e) => handleAcknowledge(e, alert.alertId)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors focus:outline-none"
                            >
                              รับทราบเหตุ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted text-xs font-medium">
                    ไม่พบรายการแจ้งเตือนที่ตรงเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertList;
