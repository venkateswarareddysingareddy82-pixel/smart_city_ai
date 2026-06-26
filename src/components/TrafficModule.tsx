import React, { useState } from 'react';
import { 
  TrafficCone, 
  Settings, 
  Zap, 
  Clock, 
  List, 
  BarChart2, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Wrench
} from 'lucide-react';
import { TrafficSignal } from '../types';

interface TrafficModuleProps {
  signals: TrafficSignal[];
  onAdjustSignal: (id: string, cycleTime: number) => void;
}

export default function TrafficModule({ signals, onAdjustSignal }: TrafficModuleProps) {
  const [selectedSigId, setSelectedSigId] = useState<string | null>(signals[0]?.id || null);
  const [customCycle, setCustomCycle] = useState<number>(60);

  const selectedSig = signals.find(s => s.id === selectedSigId);

  const handleSelectSignal = (sig: TrafficSignal) => {
    setSelectedSigId(sig.id);
    setCustomCycle(sig.cycleTime);
  };

  const executeAdjustment = () => {
    if (selectedSigId) {
      onAdjustSignal(selectedSigId, customCycle);
    }
  };

  const applyAISuggestion = () => {
    if (selectedSig && selectedSig.recommendedCycleTime) {
      setCustomCycle(selectedSig.recommendedCycleTime);
      onAdjustSignal(selectedSig.id, selectedSig.recommendedCycleTime);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="traffic-module-container">
      
      {/* 1. Live Signaling Sensors List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 lg:col-span-2 flex flex-col" id="traffic-signals-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <TrafficCone className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Autonomous Signal Management</h3>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded font-mono">
            {signals.length} SENSORS ONLINE
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
          {signals.map((sig) => {
            const isSelected = sig.id === selectedSigId;
            const isCongested = sig.congestionIndex > 70;

            return (
              <div
                key={sig.id}
                onClick={() => handleSelectSignal(sig)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Indicator circle with pulsing state */}
                  <div className="pt-0.5">
                    <span className="relative flex h-3 w-3">
                      {isCongested && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${
                        sig.status === 'GREEN' ? 'bg-emerald-500' :
                        sig.status === 'YELLOW' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}></span>
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800">{sig.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">• {sig.status} LIGHT STATE</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium font-sans mt-0.5">{sig.intersection}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Queue Stats */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Queue</div>
                    <div className="text-xs font-mono font-bold text-slate-800">{sig.queueLength} cars</div>
                  </div>

                  {/* Congestion Index */}
                  <div className="w-24">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      <span>Congestion</span>
                      <span className={isCongested ? 'text-rose-600 font-bold' : 'text-slate-600'}>{sig.congestionIndex}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${isCongested ? 'bg-rose-500' : 'bg-blue-600'}`}
                        style={{ width: `${sig.congestionIndex}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Settings Indicator */}
                  <div className={`hidden sm:flex w-7 h-7 rounded-full items-center justify-center border ${
                    isSelected ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Signal Timing Override Control Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col" id="traffic-timing-override-panel">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Wrench className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Timing Override Panel</h3>
        </div>

        {selectedSig ? (
          <div className="flex-1 flex flex-col justify-between" id="override-form">
            <div>
              {/* Signal ID Header info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Selected Station Sensor</div>
                <div className="text-xs font-bold text-slate-800 font-mono">{selectedSig.id}</div>
                <div className="text-xs text-slate-600 mt-1 font-sans">{selectedSig.intersection}</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50/55 p-2.5 rounded-lg border border-slate-100 text-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Current Cycle</div>
                  <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">{selectedSig.cycleTime}s</div>
                </div>
                <div className="bg-slate-50/55 p-2.5 rounded-lg border border-slate-100 text-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">AI Recommended</div>
                  <div className="text-sm font-mono font-bold text-blue-600 mt-0.5">{selectedSig.recommendedCycleTime}s</div>
                </div>
              </div>

              {/* Cycle Time Range Slider */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <label htmlFor="cycle-range">Override Cycle Duration</label>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-xs">{customCycle} seconds</span>
                </div>
                <input 
                  id="cycle-range"
                  type="range"
                  min="30"
                  max="180"
                  step="5"
                  value={customCycle}
                  onChange={(e) => setCustomCycle(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>30s (Min)</span>
                  <span>100s</span>
                  <span>180s (Max)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              {/* Apply AI timings button */}
              {selectedSig.cycleTime !== selectedSig.recommendedCycleTime && (
                <button
                  onClick={applyAISuggestion}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-blue-100 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  Apply Suggested timing ({selectedSig.recommendedCycleTime}s)
                </button>
              )}

              {/* Save manual timing override */}
              <button
                onClick={executeAdjustment}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
              >
                <span>Commit Cycle Override</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10">
            <AlertTriangle className="w-5 h-5 mb-2 text-slate-300" />
            Please select a traffic sensor intersection to manage.
          </div>
        )}
      </div>

    </div>
  );
}
