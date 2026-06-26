import React, { useState } from 'react';
import { 
  Flame, 
  Activity, 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  Battery, 
  Radio, 
  Play, 
  Users, 
  AlertOctagon,
  BellRing
} from 'lucide-react';
import { EmergencyUnit, EmergencyIncident } from '../types';

interface EmergencyModuleProps {
  units: EmergencyUnit[];
  incidents: EmergencyIncident[];
  onDispatchUnit: (unitId: string, incidentId: string) => void;
}

export default function EmergencyModule({
  units,
  incidents,
  onDispatchUnit
}: EmergencyModuleProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    incidents.filter(i => i.status !== 'Resolved')[0]?.id || null
  );

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  // Available rescue units for dispatch (must be Idle)
  const availableUnits = units.filter(u => u.status === 'Idle');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="emergency-module-container">
      
      {/* 1. Active Emergency Incidents Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col" id="emergency-incidents-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Active Incident Feed</h3>
          </div>
          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded font-mono">
            {activeIncidents.length} REPORTED
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] pr-1">
          {activeIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs">
              <AlertOctagon className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">All Emergency Sectors Secured</p>
              <p className="text-[10px] text-slate-400 mt-0.5">No unresolved dispatch emergencies pending.</p>
            </div>
          ) : (
            activeIncidents.map((inc) => {
              const isCritical = inc.severity === 'Critical' || inc.severity === 'High';
              const isSelected = inc.id === selectedIncidentId;

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 ${
                    isSelected 
                      ? 'border-rose-500 bg-rose-50/10 shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                      <span className="text-xs font-mono font-bold text-slate-800">{inc.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-sans border ${
                        inc.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        inc.severity === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>{inc.severity.toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{inc.type}</h4>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{inc.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 border-t border-slate-100 pt-2 text-[10px] font-mono">
                    <span className="text-slate-400">DISPATCH STATUS:</span>
                    <span className={`font-bold uppercase ${
                      inc.status === 'Reported' ? 'text-slate-500 animate-pulse' :
                      inc.status === 'Dispatched' ? 'text-amber-600' :
                      'text-indigo-600'
                    }`}>{inc.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Available Rescue Responders Standby Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 lg:col-span-2 flex flex-col" id="rescue-responders-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Standby Fleet Deployment</h3>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono">
            {availableUnits.length} IDLE UNITS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
          {units.map((unit) => {
            const isIdle = unit.status === 'Idle';
            const isBatteryLow = unit.batteryLevel < 30;

            return (
              <div
                key={unit.id}
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
                  isIdle ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-75'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{unit.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{unit.type}</span>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight border ${
                    unit.status === 'Idle' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    unit.status === 'Dispatched' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    {unit.status.toUpperCase()}
                  </span>
                </div>

                {/* Battery and Dispatch controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                    <Battery className={`w-4 h-4 ${isBatteryLow ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                    <span className={isBatteryLow ? 'text-rose-600 font-bold' : ''}>{Math.round(unit.batteryLevel)}% EV Capacity</span>
                  </div>

                  {/* Dispatch recommendation trigger button */}
                  {isIdle && selectedIncident && selectedIncident.status === 'Reported' && (
                    <button
                      onClick={() => onDispatchUnit(unit.id, selectedIncident.id)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-[10px] transition-colors flex items-center gap-1 cursor-pointer border-none"
                    >
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>DISPATCH</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
