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
    // 1. Search search term
    const matchesSearch = 
      alert.alertId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.sourceNodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.location.lat.toString() + ',' + alert.location.lng.toString()).includes(searchTerm);

    // 2. Severity filter
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

  return (
    <div className="flex flex-col gap-5 p-6 h-full">
      {/* Filters & Search Header */}
      <div className="glass-panel border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Sub-tabs: Active vs Resolved */}
          <div className="flex p-1 bg-gray-950 rounded-xl w-fit border border-gray-800">
            <button
              onClick={() => setActiveSubTab('active')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'active' 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              แจ้งเตือนปัจจุบัน ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('resolved')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'resolved' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ประวัติเหตุการณ์ ({historicalAlerts.length})
            </button>
          </div>

          {/* Quick Severity Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
              <Filter size={12} /> ความรุนแรง:
            </span>
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => handleSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  filters.severity === sev
                    ? sev === 'critical'
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : sev === 'warning'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : sev === 'info'
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                      : 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                {getSeverityLabel(sev)}
              </button>
            ))}
          </div>

        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาด้วย รหัสการแจ้งเตือน, รหัสโหนด, หรือ พิกัด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-950/60 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Alerts List Table */}
      <div className="glass-panel border-gray-800 rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/40 text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-4 px-5">รหัส</th>
                <th className="py-4 px-5">เวลาตรวจพบ</th>
                <th className="py-4 px-5">ความรุนแรง</th>
                <th className="py-4 px-5">โหนดต้นทาง</th>
                <th className="py-4 px-5">เซนเซอร์ / ค่าที่วัดได้</th>
                <th className="py-4 px-5">สถานะ</th>
                <th className="py-4 px-5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  let sevBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  let sevText = 'ข้อมูล';
                  if (alert.severity === 'critical') {
                    sevBg = 'bg-red-500/10 text-red-400 border-red-500/20';
                    sevText = 'วิกฤต';
                  } else if (alert.severity === 'warning') {
                    sevBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    sevText = 'เตือนภัย';
                  }

                  const isAcknowledged = !!alert.acknowledgedAt;

                  return (
                    <tr 
                      key={alert._id} 
                      onClick={() => onSelectAlert(alert)}
                      className="hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="py-4 px-5">
                        <span className="font-mono text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {alert.alertId}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                          <Clock size={12} className="text-gray-600" />
                          {new Date(alert.timestamp).toLocaleTimeString()}
                          <span className="text-[10px] text-gray-600">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${sevBg}`}>
                          {sevText}
                        </span>
                      </td>

                      {/* Source Node */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-medium text-gray-200">
                            {alert.sourceNodeId}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                            <MapPin size={10} /> ({alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)})
                          </span>
                        </div>
                      </td>

                      {/* Sensor value */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-300 font-medium capitalize">
                            {getSensorLabel(alert.sensorType)}
                          </span>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {alert.value} / {alert.threshold} (ขีดจำกัด)
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {alert.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={10} /> แก้ไขแล้ว
                          </span>
                        ) : isAcknowledged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Clock size={10} /> รับทราบแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                            <ShieldAlert size={10} /> ยังไม่จัดการ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="ดูรายละเอียด"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/80 transition-all"
                          >
                            <Eye size={15} />
                          </button>
                          
                          {alert.status === 'active' && !isAcknowledged && (
                            <button
                              onClick={(e) => handleAcknowledge(e, alert.alertId)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500 text-dark-950 hover:bg-emerald-400 transition-colors"
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
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
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
