import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { acknowledgeAlert, resolveAlert } from '../../store/slices/alertsSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { X, ShieldAlert, Clock, MapPin, CheckCircle, FileText } from 'lucide-react';
import type { Alert } from '../../types';


interface AlertModalProps {
  alert: Alert | null;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert: propAlert, onClose }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Retrieve the fresh alert object from Redux state to avoid stale props
  const alert = useSelector((state: RootState) => {
    if (!propAlert) return null;
    const active = state.alerts.active.find(a => a.alertId === propAlert.alertId || a._id === propAlert._id);
    if (active) return active;
    const history = state.alerts.history.find(a => a.alertId === propAlert.alertId || a._id === propAlert._id);
    return history || propAlert;
  });

  const [actionTaken, setActionTaken] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!alert) return null;

  const isAcknowledged = !!alert.acknowledgedAt;
  const isResolved = alert.status === 'resolved';

  const handleAcknowledge = () => {
    const rangerId = currentUser?.name || 'ranger_somchai';
    dispatch(acknowledgeAlert({ alertId: alert.alertId, rangerId }) as any);
    dispatch(addNotification({
      message: `รับทราบการแจ้งเตือน ${alert.alertId} แล้ว`,
      type: 'success',
    }));
    onClose(); // ปิด popup ทันทีและกลับมาที่เดิม
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTaken.trim()) return;

    const rangerId = currentUser?.name || 'ranger_somchai';
    dispatch(resolveAlert({ 
      alertId: alert.alertId, 
      rangerId, 
      actionTaken 
    }) as any);

    dispatch(addNotification({
      message: `บันทึกการแก้ไขการแจ้งเตือน ${alert.alertId} เรียบร้อยแล้ว`,
      type: 'success',
    }));
    
    setIsResolving(false);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      ></div>

      {/* Modal Content */}
      <div className="glass-panel border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">รายละเอียดการแจ้งเตือน: {alert.alertId}</h2>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                โหนดต้นทาง: {alert.sourceNodeId}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Card */}
            <div className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="text-emerald-400 mt-1">
                <MapPin size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-500 uppercase">พิกัดทางภูมิศาสตร์</span>
                <span className="text-sm font-semibold text-white mt-1">
                  ({alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)})
                </span>
                <span className="text-xs text-gray-400 mt-1">พื้นที่ป่าดอยสุเทพ</span>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="text-blue-400 mt-1">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-500 uppercase">เวลาที่ตรวจพบ</span>
                <span className="text-sm font-semibold text-white mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(alert.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Sensor readings section */}
          <div className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-5">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">ข้อมูลจากเซนเซอร์</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-300 capitalize">ค่าที่วัดได้จากเซนเซอร์ {getSensorLabel(alert.sensorType)}</span>
                  <span className="text-white font-mono">{alert.value} / {alert.threshold} (ขีดจำกัด)</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <div 
                    className={`h-full rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((alert.value / alert.threshold) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Process */}
          <div className="relative border-l border-gray-800 ml-3 pl-6 space-y-5">
            {/* Step 1: Detected */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-dark-900"></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">ตรวจพบเหตุไฟป่าโดยโหนด {alert.sourceNodeId}</span>
                <span className="text-[10px] font-mono text-gray-500 mt-0.5">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Step 2: Acknowledged */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-dark-900 ${
                isAcknowledged ? 'bg-blue-500' : 'bg-gray-800'
              }`}></div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${isAcknowledged ? 'text-white' : 'text-gray-500'}`}>
                  {isAcknowledged 
                    ? `รับทราบเหตุแล้วโดยเจ้าหน้าที่: ${alert.acknowledgedBy}` 
                    : 'กำลังรอเจ้าหน้าที่รับทราบเหตุ'}
                </span>
                {alert.acknowledgedAt && (
                  <span className="text-[10px] font-mono text-gray-500 mt-0.5">
                    {new Date(alert.acknowledgedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Step 3: Resolved */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-dark-900 ${
                isResolved ? 'bg-emerald-500' : 'bg-gray-800'
              }`}></div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${isResolved ? 'text-white' : 'text-gray-500'}`}>
                  {isResolved 
                    ? `แก้ไขเหตุเรียบร้อยแล้วโดยเจ้าหน้าที่: ${alert.responseDetails?.rangerId}` 
                    : 'กำลังรอดำเนินการแก้ไข'}
                </span>
                {alert.responseDetails && (
                  <>
                    <span className="text-[10px] font-mono text-gray-500 mt-0.5">
                      {new Date(alert.responseDetails.resolvedAt).toLocaleString()}
                    </span>
                    <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                      <FileText size={14} className="mt-0.5" />
                      <span>{alert.responseDetails.actionTaken}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Resolve Form if Acknowledged and not resolved */}
          {isAcknowledged && !isResolved && isResolving && (
            <form onSubmit={handleResolveSubmit} className="bg-gray-950/40 border border-emerald-500/20 rounded-2xl p-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
              <label className="text-xs font-semibold text-emerald-400 block">รายงานผลการเข้าระงับเหตุ</label>
              <textarea
                placeholder="ระบุวิธีการเข้าระงับเหตุ (เช่น ดับไฟเสร็จสิ้น, ปัดกวาดแนวกันไฟ...)"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 min-h-20"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResolving(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-800 text-gray-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-dark-950 hover:bg-emerald-400 transition-colors"
                >
                  ยืนยันการแก้ไขเสร็จสิ้น
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-950/20 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
          
          {alert.status === 'active' && (
            <>
              {!isAcknowledged ? (
                <button
                  onClick={handleAcknowledge}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> รับทราบเหตุ
                </button>
              ) : (
                !isResolving && (
                  <button
                    onClick={() => setIsResolving(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-dark-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> ลงบันทึกแก้ไขเหตุ
                  </button>
                )
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AlertModal;
