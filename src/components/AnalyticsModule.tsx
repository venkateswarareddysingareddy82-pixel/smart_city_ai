import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  FileSpreadsheet, 
  Award,
  Clock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { DashboardKPIs } from '../types';

interface AnalyticsModuleProps {
  kpis: DashboardKPIs;
}

export default function AnalyticsModule({ kpis }: AnalyticsModuleProps) {
  
  // Custom CSV download trigger helper
  const downloadReport = (type: string) => {
    window.open(`/api/reports/download?type=${type}`, '_blank');
  };

  return (
    <div className="space-y-6" id="analytics-module-container">
      
      {/* 1. Quick Stats Indicators (Department KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-kpis-grid">
        
        {/* SLA Dispatch Response Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Emergency Dispatch SLA</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{kpis.averageResponseTime} mins</div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1 font-sans">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Optimal (SLA target &lt; 10m)</span>
            </p>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Congestion Points */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Active Congestion Points</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{kpis.activeCongestionPoints}</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 font-sans">
              Across major expressway grids
            </p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Ambient AQI Index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Atmospheric AQI Index</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{kpis.averageAQI}</div>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-0.5 mt-1 font-sans">
              <span>Moderate air quality warnings</span>
            </p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Citizen Satisfaction Index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Citizen Approval Rating</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{kpis.citizenSatisfactionRate}%</div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1 font-sans">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target 85% exceeded</span>
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. Visual Reports & Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics-reports-grid">
        
        {/* Weekly Traffic Bottlenecks Bar chart (Custom Inline Vector) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 lg:col-span-2 flex flex-col" id="traffic-bottlenecks-chart-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Weekly Traffic Delay index</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">7-Day Period</span>
          </div>

          <div className="flex-1 min-h-[220px] relative flex items-end justify-between px-4 pb-2 pt-6" id="vector-bar-chart">
            {/* Custom Grid lines */}
            <div className="absolute inset-x-0 top-1/4 h-px bg-slate-100" />
            <div className="absolute inset-x-0 top-2/4 h-px bg-slate-100" />
            <div className="absolute inset-x-0 top-3/4 h-px bg-slate-100" />

            {/* Bars for Mon - Sun delay index */}
            {[
              { day: 'Mon', value: 42, color: 'bg-slate-400' },
              { day: 'Tue', value: 58, color: 'bg-slate-400' },
              { day: 'Wed', value: 89, color: 'bg-rose-500' }, // Congestion peak
              { day: 'Thu', value: 64, color: 'bg-slate-400' },
              { day: 'Fri', value: 78, color: 'bg-blue-600' },
              { day: 'Sat', value: 31, color: 'bg-emerald-500' },
              { day: 'Sun', value: 24, color: 'bg-emerald-500' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center w-12 group relative">
                {/* Tooltip value */}
                <div className="absolute bottom-full mb-1 bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {bar.value}%
                </div>
                {/* Visual bar container */}
                <div className="w-6 bg-slate-100 h-[140px] rounded-t flex items-end">
                  <div 
                    className={`w-full rounded-t transition-all duration-1000 ${bar.color}`}
                    style={{ height: `${bar.value}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSV Reports & Resource Exports Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col" id="reports-export-panel">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Award className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 font-sans">Operational Data Export</h3>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-4" id="export-buttons-list">
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Securely query and export live operational telemetry, air pollution indexes, and smart signal recommendations directly as tabular CSV worksheets for third-party GIS analysis.
            </p>

            <div className="space-y-2.5">
              <button 
                onClick={() => downloadReport('traffic')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Traffic Signaling Dataset</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => downloadReport('pollution')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Atmospheric AQI Logsheet</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => downloadReport('city-kpi')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>Operations SLA KPI Audit</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
