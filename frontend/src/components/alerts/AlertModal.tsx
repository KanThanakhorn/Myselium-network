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

const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [actionTaken, setActionTaken] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!alert) return null;

  const isAcknowledged = !!alert.acknowledgedAt;
  const isResolved = alert.status === 'resolved';

  const handleAcknowledge = () => {
    const rangerId = currentUser?.name || 'ranger_somchai';
    dispatch(acknowledgeAlert({ alertId: alert.alertId, rangerId }) as any);
    dispatch(addNotification({
      message: `Alert ${alert.alertId} acknowledged`,
      type: 'success',
    }));
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
      message: `Alert ${alert.alertId} marked as resolved`,
      type: 'success',
    }));
    
    setIsResolving(false);
    onClose();
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
              <h2 className="text-lg font-bold text-white m-0">Alert Details: {alert.alertId}</h2>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                SOURCE NODE: {alert.sourceNodeId}
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
                <span className="text-[10px] font-mono text-gray-500 uppercase">Geographic Location</span>
                <span className="text-sm font-semibold text-white mt-1">
                  ({alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)})
                </span>
                <span className="text-xs text-gray-400 mt-1">Doi Suthep forest area</span>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="text-blue-400 mt-1">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Detection Time</span>
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
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Sensor Readings</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-300 capitalize">{alert.sensorType} Reading</span>
                  <span className="text-white font-mono">{alert.value} / {alert.threshold} limit</span>
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
                <span className="text-xs font-semibold text-white">Fire incident detected by {alert.sourceNodeId}</span>
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
                    ? `Acknowledged by ranger: ${alert.acknowledgedBy}` 
                    : 'Awaiting Ranger Acknowledgment'}
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
                    ? `Resolved by ranger: ${alert.responseDetails?.rangerId}` 
                    : 'Awaiting Resolution'}
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
              <label className="text-xs font-semibold text-emerald-400 block">Incident Resolution Report</label>
              <textarea
                placeholder="Describe actions taken (e.g. Dispatched fire truck, cleared dry leaves...)"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-dark-950 hover:bg-emerald-400 transition-colors"
                >
                  Confirm Resolution
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
            Close
          </button>
          
          {alert.status === 'active' && (
            <>
              {!isAcknowledged ? (
                <button
                  onClick={handleAcknowledge}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Acknowledge Alert
                </button>
              ) : (
                !isResolving && (
                  <button
                    onClick={() => setIsResolving(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-dark-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Resolve Incident
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
