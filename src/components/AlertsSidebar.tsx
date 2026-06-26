import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Radio, 
  Info, 
  Check, 
  BellOff, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { CityAlert } from '../types';

interface AlertsSidebarProps {
  alerts: CityAlert[];
  onClose: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export default function AlertsSidebar({
  alerts,
  onClose,
  onAcknowledgeAlert,
  onAcknowledgeAll
}: AlertsSidebarProps) {
  const unacknowledged = alerts.filter(a => !a.acknowledged);

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col h-full" id="alerts-sidebar-container">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Operational Alerts Feed</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer border-none bg-transparent"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Control Buttons */}
      {unacknowledged.length > 0 && (
        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onAcknowledgeAll}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer border-none bg-transparent"
          >
            <BellOff className="w-3.5 h-3.5" />
            <span>Acknowledge All ({unacknowledged.length})</span>
          </button>
        </div>
      )}

      {/* Alerts Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20" id="alerts-sidebar-stream">
        {alerts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center">
            <Check className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700 font-sans">Clear Alert Ledger</p>
            <p className="text-[10px] text-slate-400 mt-0.5">No warnings logged across departments.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'Critical';
            const isWarn = alert.severity === 'Warning';
            
            // Layout styling
            const borderStyle = alert.acknowledged 
              ? 'border-slate-150 opacity-60' 
              : isCritical 
              ? 'border-rose-300 bg-rose-50/20' 
              : isWarn 
              ? 'border-amber-250 bg-amber-50/10'
              : 'border-slate-200 bg-white';

            return (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all duration-200 ${borderStyle}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{alert.department} DEPARTMENT</span>
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer border-none bg-transparent"
                      title="Mark as Acknowledged"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <h4 className={`text-xs font-bold leading-tight ${alert.acknowledged ? 'text-slate-500' : 'text-slate-800'}`}>
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans mt-1">
                    {alert.message}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-2 mt-1">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>{alert.severity.toUpperCase()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
