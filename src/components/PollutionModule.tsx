import React from 'react';
import { 
  Wind, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { PollutionStation } from '../types';

interface PollutionModuleProps {
  stations: PollutionStation[];
}

export default function PollutionModule({ stations }: PollutionModuleProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="pollution-module-container">
      
      {/* Overview Cards */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        
        {/* City-wide Average card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4" id="aqi-average-card">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-4 h-4 text-blue-600" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Average Urban Air Quality</h4>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">92</span>
            <span className="text-xs font-bold text-slate-500 font-mono">AQI</span>
          </div>
          
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            ⚠️ Moderate - Active diesel particulate warnings in cargo logistics channels.
          </p>
        </div>

        {/* Advisory Tips Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4" id="aqi-advisory-card">
          <div className="flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Operational Advisory</h5>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 font-sans">
                Recommend triggering public transport incentives when average industrial AQI peaks above 150 to mitigate tailpipe emissions.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Sensor stations telemetry dashboard */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 lg:col-span-3 flex flex-col" id="pollution-stations-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Sensory Deployment Grid</h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono">
            5 ATMOSPHERIC SENSORS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-3 font-medium">Sensor Station</th>
                <th className="pb-3 text-center font-medium">AQI Value</th>
                <th className="pb-3 text-center font-medium">PM 2.5</th>
                <th className="pb-3 text-center font-medium">NO₂ Level</th>
                <th className="pb-3 text-center font-medium">CO (PPM)</th>
                <th className="pb-3 text-center font-medium">6H Trend</th>
                <th className="pb-3 text-right font-medium">Status Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stations.map((st) => {
                const isUnhealthy = st.aqi > 100;
                const isHazardous = st.aqi > 150;
                
                // Color badges
                const badgeStyle = 
                  st.status === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  st.status === 'Good' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  st.status === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 pr-2">
                      <div className="font-semibold text-slate-800">{st.zone}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{st.id}</div>
                    </td>
                    
                    {/* AQI Score */}
                    <td className="py-3.5 text-center">
                      <span className={`font-mono font-bold text-sm ${
                        isHazardous ? 'text-rose-600' : isUnhealthy ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {st.aqi}
                      </span>
                    </td>

                    {/* PM2.5 */}
                    <td className="py-3.5 text-center font-mono text-slate-600">{st.pm25} µg/m³</td>
                    
                    {/* NO2 */}
                    <td className="py-3.5 text-center font-mono text-slate-600">{st.no2} ppb</td>
                    
                    {/* CO */}
                    <td className="py-3.5 text-center font-mono text-slate-600">{st.co} ppm</td>

                    {/* Simple sparkline visualization inside a small inline SVG */}
                    <td className="py-3.5 text-center">
                      <div className="inline-block h-6 w-16">
                        <svg className="w-full h-full overflow-visible" stroke={isHazardous ? "#f43f5e" : "#3b82f6"} strokeWidth="1.5" fill="none">
                          <polyline
                            points={st.trend.map((val, index) => {
                              // scale x in 0-16, y in 0-6 range based on aqi min 20 max 200
                              const x = (index / (st.trend.length - 1)) * 64;
                              const minAQI = 20;
                              const maxAQI = 200;
                              const normalizedY = ((val - minAQI) / (maxAQI - minAQI));
                              const y = 24 - (normalizedY * 20); // invert to draw down from top
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </svg>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-tight ${badgeStyle}`}>
                        {st.status.toUpperCase()}
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
