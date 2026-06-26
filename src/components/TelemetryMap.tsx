import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Radio, 
  CloudSnow, 
  Layers, 
  TrafficCone, 
  Flame, 
  AlertOctagon, 
  Timer, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { 
  TrafficSignal, 
  PollutionStation, 
  EmergencyUnit, 
  EmergencyIncident, 
  TransitVehicle 
} from '../types';

interface TelemetryMapProps {
  trafficSignals: TrafficSignal[];
  pollutionStations: PollutionStation[];
  emergencyUnits: EmergencyUnit[];
  emergencyIncidents: EmergencyIncident[];
  transitVehicles: TransitVehicle[];
  onSelectSignal: (sig: TrafficSignal) => void;
  onSelectIncident: (inc: EmergencyIncident) => void;
  onSelectUnit: (unit: EmergencyUnit) => void;
}

type MapLayer = 'all' | 'traffic' | 'pollution' | 'transit' | 'emergency';

export default function TelemetryMap({
  trafficSignals,
  pollutionStations,
  emergencyUnits,
  emergencyIncidents,
  transitVehicles,
  onSelectSignal,
  onSelectIncident,
  onSelectUnit
}: TelemetryMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('all');
  const [hoveredItem, setHoveredItem] = useState<{ name: string; info: string; x: number; y: number } | null>(null);

  // Filter items based on selected layer
  const showTraffic = activeLayer === 'all' || activeLayer === 'traffic';
  const showPollution = activeLayer === 'all' || activeLayer === 'pollution';
  const showTransit = activeLayer === 'all' || activeLayer === 'transit';
  const showEmergency = activeLayer === 'all' || activeLayer === 'emergency';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full" id="telemetry-map-card">
      
      {/* Map Control Header */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/55" id="map-controls">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Operational Grid Control</span>
        </div>
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'traffic', 'pollution', 'transit', 'emergency'] as MapLayer[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md font-semibold transition-all border cursor-pointer ${
                activeLayer === layer
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {layer.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Stage */}
      <div className="flex-1 relative min-h-[380px] bg-slate-100 p-2 overflow-hidden select-none" id="map-stage">
        
        {/* Grid dots background representing the streets of Metro City */}
        <div className="absolute inset-0 border border-slate-200/60 rounded-xl bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-75" />

        {/* Abstract Major Arterial Road Networks & Canals mapped as vectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          {/* Main Broadway Boulevard */}
          <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="#cbd5e1" strokeWidth="8" strokeDasharray="4 4" />
          {/* 5th Avenue */}
          <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="#cbd5e1" strokeWidth="10" />
          {/* Industrial Highway */}
          <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="#94a3b8" strokeWidth="12" />
          {/* Marina Coastal Freeway */}
          <path d="M 0 80 Q 50 75 100 85" fill="none" stroke="#64748b" strokeWidth="14" />
          {/* Harbor Canal Waterway */}
          <path d="M 0 50 Q 40 55 100 45" fill="none" stroke="#93c5fd" strokeWidth="16" />
        </svg>

        {/* ==========================================
            RENDER TRAFFIC SIGNALS (Green / Red / Yellow)
            ========================================== */}
        {showTraffic && trafficSignals.map((sig) => {
          const colorClass = 
            sig.status === 'GREEN' ? 'bg-emerald-500 shadow-emerald-500/50' : 
            sig.status === 'YELLOW' ? 'bg-amber-500 shadow-amber-500/50' : 
            'bg-rose-500 shadow-rose-500/50';

          return (
            <div
              key={sig.id}
              onClick={() => onSelectSignal(sig)}
              onMouseEnter={(e) => setHoveredItem({
                name: sig.id,
                info: `${sig.intersection} - Queue: ${sig.queueLength} vehicles, Congestion: ${sig.congestionIndex}%`,
                x: sig.coordinates.x,
                y: sig.coordinates.y
              })}
              onMouseLeave={() => setHoveredItem(null)}
              className="absolute transition-all duration-500 cursor-pointer"
              style={{ left: `${sig.coordinates.x}%`, top: `${sig.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative group">
                <span className="absolute inline-flex h-6 w-6 rounded-full bg-slate-300/30 animate-ping opacity-65"></span>
                <div className={`w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${colorClass}`}>
                  <span className="text-[7px] text-white font-bold">{sig.id.replace('SIG-0', '')}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ==========================================
            RENDER POLLUTION STATIONS (Air Quality Monitors)
            ========================================== */}
        {showPollution && pollutionStations.map((station) => {
          const badgeColor = 
            station.aqi <= 50 ? 'bg-emerald-500' :
            station.aqi <= 100 ? 'bg-lime-500' :
            station.aqi <= 150 ? 'bg-amber-500' :
            'bg-rose-500';

          return (
            <div
              key={station.id}
              onMouseEnter={(e) => setHoveredItem({
                name: station.zone,
                info: `AQI: ${station.aqi} (${station.status}) | PM2.5: ${station.pm25}`,
                x: station.coordinates.x,
                y: station.coordinates.y
              })}
              onMouseLeave={() => setHoveredItem(null)}
              className="absolute cursor-help"
              style={{ left: `${station.coordinates.x}%`, top: `${station.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <div className={`w-3.5 h-3.5 rounded-sm rotate-45 border border-white shadow-md flex items-center justify-center ${badgeColor}`}>
                  <span className="text-[6px] text-white font-bold -rotate-45 font-sans">AQ</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ==========================================
            RENDER PUBLIC TRANSIT VEHICLES (Buses & Metro)
            ========================================== */}
        {showTransit && transitVehicles.map((v) => {
          const isMetro = v.type === 'Metro';
          return (
            <div
              key={v.id}
              onMouseEnter={(e) => setHoveredItem({
                name: `${v.id} (${v.routeName})`,
                info: `Status: ${v.status} | Occupancy: ${v.occupancy}% | Delay: ${v.delayMinutes} min`,
                x: v.coordinates.x,
                y: v.coordinates.y
              })}
              onMouseLeave={() => setHoveredItem(null)}
              className="absolute transition-all duration-1000 ease-out"
              style={{ left: `${v.coordinates.x}%`, top: `${v.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`p-1 rounded shadow-md border border-white flex items-center justify-center text-white ${
                isMetro ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                <Navigation className={`w-3 h-3 ${isMetro ? '' : 'rotate-90'}`} />
                <span className="text-[8px] font-bold font-mono px-0.5">{v.id}</span>
              </div>
            </div>
          );
        })}

        {/* ==========================================
            RENDER EMERGENCY UNITS (Ambulance, Fire, Police)
            ========================================== */}
        {showEmergency && emergencyUnits.map((unit) => {
          const color = 
            unit.type === 'Ambulance' ? 'bg-red-500' :
            unit.type === 'Fire Engine' ? 'bg-orange-500' :
            'bg-indigo-600';

          return (
            <div
              key={unit.id}
              onClick={() => onSelectUnit(unit)}
              onMouseEnter={(e) => setHoveredItem({
                name: unit.name,
                info: `Status: ${unit.status} | Charge: ${Math.round(unit.batteryLevel)}% | Phone: ${unit.contactNumber}`,
                x: unit.coordinates.x,
                y: unit.coordinates.y
              })}
              onMouseLeave={() => setHoveredItem(null)}
              className="absolute transition-all duration-1000 ease-out cursor-pointer"
              style={{ left: `${unit.coordinates.x}%`, top: `${unit.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`p-1 rounded-full text-white shadow-lg border border-white flex items-center justify-center ${color} ${
                unit.status !== 'Idle' ? 'animate-bounce' : ''
              }`}>
                <Radio className="w-3 h-3" />
                <span className="text-[8px] font-mono font-bold px-0.5">{unit.id.replace('AMB-', 'A').replace('FIR-', 'F').replace('POL-', 'P')}</span>
              </div>
            </div>
          );
        })}

        {/* ==========================================
            RENDER ACTIVE EMERGENCY INCIDENTS
            ========================================== */}
        {showEmergency && emergencyIncidents.filter(i => i.status !== 'Resolved').map((inc) => {
          const isCritical = inc.severity === 'Critical' || inc.severity === 'High';
          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              onMouseEnter={(e) => setHoveredItem({
                name: `INCIDENT ${inc.id}: ${inc.type}`,
                info: `Location: ${inc.location} | Severity: ${inc.severity} | Status: ${inc.status}`,
                x: inc.coordinates.x,
                y: inc.coordinates.y
              })}
              onMouseLeave={() => setHoveredItem(null)}
              className="absolute cursor-pointer animate-pulse"
              style={{ left: `${inc.coordinates.x}%`, top: `${inc.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`p-1.5 rounded-lg border flex items-center gap-1 shadow-lg ${
                isCritical 
                  ? 'bg-rose-50 border-rose-400 text-rose-700 font-bold' 
                  : 'bg-amber-50 border-amber-300 text-amber-700'
              }`}>
                {inc.type === 'Structural Fire' ? (
                  <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                ) : (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span className="text-[9px] uppercase tracking-tight">{inc.id}</span>
              </div>
            </div>
          );
        })}

        {/* Map Legend (Bottom Left Corner) */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-sm max-w-[200px] pointer-events-none">
          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Operational Map Legend</h4>
          <div className="space-y-1 text-[10px] text-slate-600 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
              <span>Traffic Control Light</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm rotate-45 bg-amber-500 border border-white"></span>
              <span>AQI Air Sensor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 border border-white flex items-center justify-center text-[6px] text-white font-bold">▶</span>
              <span>Public Transit Vehicle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
              <span>Emergency Services Unit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-50 border border-rose-300 rounded flex items-center justify-center text-[7px] font-bold text-rose-700">!</span>
              <span>Active Dispatch Emergency</span>
            </div>
          </div>
        </div>

        {/* Live Vector Overlay Tooltip / Hover box */}
        {hoveredItem && (
          <div 
            className="absolute bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none max-w-[250px] border border-slate-800 z-40"
            style={{ 
              left: `${hoveredItem.x}%`, 
              top: `${hoveredItem.y - 6}%`, 
              transform: 'translate(-50%, -100%)',
              transition: 'left 0.15s ease-out, top 0.15s ease-out'
            }}
          >
            <p className="font-bold border-b border-slate-800 pb-1 mb-1 font-sans">{hoveredItem.name}</p>
            <p className="text-[10px] text-slate-300 font-mono">{hoveredItem.info}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900" />
          </div>
        )}

      </div>
    </div>
  );
}
