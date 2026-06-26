import React from 'react';
import { Shield, CloudRain, Sun, Wind, Users, Radio } from 'lucide-react';
import { UserRole, WeatherData, CityAlert } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  weather: WeatherData;
  alerts: CityAlert[];
  onShowAlerts: () => void;
}

export default function Header({
  currentRole,
  setCurrentRole,
  weather,
  alerts,
  onShowAlerts
}: HeaderProps) {
  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const roles: UserRole[] = [
    'Super Admin',
    'City Administrator',
    'Traffic Department Officer',
    'Emergency Response Officer',
    'Pollution Control Officer',
    'Public Transport Officer',
    'Citizen',
    'Data Analyst'
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm" id="header-container">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3" id="header-brand">
          <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-900 flex items-center gap-2">
              S-CITY AI PLATFORM
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider bg-blue-50 text-blue-700 rounded border border-blue-100">
                Live OS v4.8
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Autonomous Urban Intelligence Control Center
            </p>
          </div>
        </div>

        {/* Telemetry & Quick Weather */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4" id="header-telemetry">
          
          {/* Weather Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-3 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5 text-blue-600">
              {weather.stormAlert || weather.floodRisk === 'High' ? (
                <CloudRain className="w-4 h-4 text-blue-500 animate-bounce" />
              ) : weather.temp > 32 ? (
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Sun className="w-4 h-4 text-slate-500" />
              )}
              <span className="font-semibold font-mono">{weather.temp}°C</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1 text-slate-500 font-mono">
              <Wind className="w-3.5 h-3.5" />
              <span>{weather.windSpeed} km/h</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1 font-mono">
              <span className="text-slate-400">AQI:</span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                weather.aqiAvg <= 50 ? 'bg-emerald-100 text-emerald-800' :
                weather.aqiAvg <= 100 ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>{weather.aqiAvg}</span>
            </div>
          </div>

          {/* Active Alerts Pill */}
          <button 
            id="alerts-notification-btn"
            onClick={onShowAlerts}
            className={`relative border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-mono transition-all duration-250 cursor-pointer ${
              activeAlertsCount > 0 
                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 font-bold' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            <span>ALERTS: {activeAlertsCount}</span>
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Role Switcher Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-none cursor-pointer border-none p-0 pr-5"
            >
              {roles.map(r => (
                <option key={r} value={r} className="bg-white text-slate-800">
                  {r}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </header>
  );
}
