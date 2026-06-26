import React from 'react';
import { 
  Bus, 
  Map, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { TransitVehicle } from '../types';

interface TransitModuleProps {
  vehicles: TransitVehicle[];
}

export default function TransitModule({ vehicles }: TransitModuleProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="transit-module-container">
      
      {/* Overview Analytics card */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        
        {/* Transit summary card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4" id="transit-summary-card">
          <div className="flex items-center gap-2 mb-3">
            <Bus className="w-4 h-4 text-blue-600" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Transit System Load</h4>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">74%</span>
            <span className="text-xs font-bold text-slate-500">Avg Occupancy</span>
          </div>

          <p className="text-[11px] text-amber-600 font-medium mt-1">
            ⚠️ Rush hour peak - Delay risk high at Southside Harbor Expressway.
          </p>
        </div>

        {/* Optimizations Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4" id="transit-advice-card">
          <div className="flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide font-sans">Route Advisory</h5>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 font-sans">
                Bus Route 101: Recommended frequency increase to 6 minutes from financial plaza due to severe pedestrian queue propagation.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Transit vehicle telemetry list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 lg:col-span-3 flex flex-col" id="transit-vehicles-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Metro & Bus Telemetry Streams</h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono">
            {vehicles.length} ACTIVE TRANSPORTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-3 font-medium">Vehicle ID</th>
                <th className="pb-3 font-medium">Assigned Route</th>
                <th className="pb-3 text-center font-medium">Vehicle Type</th>
                <th className="pb-3 text-center font-medium font-sans">Live Occupancy</th>
                <th className="pb-3 text-center font-medium">Average Speed</th>
                <th className="pb-3 text-center font-medium">Delay Check</th>
                <th className="pb-3 text-right font-medium">Telemetry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vehicles.map((v) => {
                const isDelayed = v.delayMinutes > 5;
                const isHeavyDelay = v.delayMinutes > 10;
                
                // Color formatting
                const delayColor = isHeavyDelay ? 'text-rose-600 font-bold' : isDelayed ? 'text-amber-600 font-semibold' : 'text-emerald-600';

                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Vehicle ID */}
                    <td className="py-3.5 pr-2 font-mono font-bold text-slate-800">{v.id}</td>

                    {/* Assigned Route */}
                    <td className="py-3.5 text-slate-700 font-medium font-sans">{v.routeName}</td>

                    {/* Vehicle Type */}
                    <td className="py-3.5 text-center font-semibold font-mono text-slate-600">{v.type.toUpperCase()}</td>

                    {/* Occupancy bar */}
                    <td className="py-3.5 text-center px-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-xs text-slate-700 font-semibold w-8 text-right">{v.occupancy}%</span>
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              v.occupancy > 85 ? 'bg-rose-500' :
                              v.occupancy > 60 ? 'bg-amber-500' :
                              'bg-blue-600'
                            }`}
                            style={{ width: `${v.occupancy}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 text-center font-mono text-slate-600">{v.speed} km/h</td>

                    {/* Delay minutes */}
                    <td className={`py-3.5 text-center font-mono ${delayColor}`}>
                      {v.delayMinutes === 0 ? 'On Time' :
                       v.delayMinutes < 0 ? `${Math.abs(v.delayMinutes)}m Early` :
                       `+${v.delayMinutes}m Late`}
                    </td>

                    {/* Live status check */}
                    <td className="py-3.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-tight ${
                        v.status === 'On Time' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
