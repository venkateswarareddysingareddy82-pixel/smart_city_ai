import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TelemetryMap from './components/TelemetryMap';
import AICopilot from './components/AICopilot';
import TrafficModule from './components/TrafficModule';
import PollutionModule from './components/PollutionModule';
import EmergencyModule from './components/EmergencyModule';
import TransitModule from './components/TransitModule';
import ComplaintModule from './components/ComplaintModule';
import AnalyticsModule from './components/AnalyticsModule';
import AlertsSidebar from './components/AlertsSidebar';

import { 
  UserRole, 
  TrafficSignal, 
  PollutionStation, 
  EmergencyUnit, 
  EmergencyIncident, 
  TransitVehicle, 
  WeatherData, 
  Complaint, 
  CityAlert, 
  DashboardKPIs 
} from './types';

import { 
  Activity, 
  Cpu, 
  Wind, 
  TrendingUp, 
  FileText, 
  Map, 
  Bell, 
  Settings, 
  CheckCircle,
  Database,
  Radio,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('City Administrator');
  const [activeTab, setActiveTab] = useState<'map' | 'copilot' | 'traffic' | 'pollution' | 'emergency' | 'transit' | 'complaints' | 'analytics'>('map');
  const [showAlertsSidebar, setShowAlertsSidebar] = useState(false);
  const [systemSyncTime, setSystemSyncTime] = useState<string>('');

  // Operational State representing entire Metro City Telemetry
  const [trafficSignals, setTrafficSignals] = useState<TrafficSignal[]>([]);
  const [pollutionStations, setPollutionStations] = useState<PollutionStation[]>([]);
  const [emergencyUnits, setEmergencyUnits] = useState<EmergencyUnit[]>([]);
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([]);
  const [transitVehicles, setTransitVehicles] = useState<TransitVehicle[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: 24,
    humidity: 50,
    windSpeed: 10,
    condition: 'Sunny',
    aqiAvg: 32,
    floodRisk: 'None',
    heatwaveWarning: false,
    stormAlert: false
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [cityAlerts, setCityAlerts] = useState<CityAlert[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs>({
    averageResponseTime: 8.4,
    activeCongestionPoints: 1,
    averageAQI: 93,
    totalActiveEmergencyUnits: 0,
    citizenSatisfactionRate: 88,
    resolvedComplaintsRate: 80
  });

  const [isLoading, setIsLoading] = useState(true);

  // Synchronize city telemetry state from backend simulator
  const syncCityState = async () => {
    try {
      const response = await fetch('/api/city-state');
      if (response.ok) {
        const data = await response.json();
        setTrafficSignals(data.trafficSignals);
        setPollutionStations(data.pollutionStations);
        setEmergencyUnits(data.emergencyUnits);
        setEmergencyIncidents(data.emergencyIncidents);
        setTransitVehicles(data.transitVehicles);
        setWeatherData(data.weatherData);
        setComplaints(data.complaints);
        setCityAlerts(data.cityAlerts);
        setKpis(data.kpis);
        
        setSystemSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to sync smart city live state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll state every 4 seconds to simulate real-time sensor streams
  useEffect(() => {
    syncCityState();
    const interval = setInterval(syncCityState, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1. Post citizen complaint
  const handleRegisterComplaint = async (formData: any) => {
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints);
        syncCityState();
      }
    } catch (err) {
      console.error('Failed to log citizen complaint ticket:', err);
    }
  };

  // 2. Post Emergency Dispatch assignment
  const handleDispatchUnit = async (unitId: string, incidentId: string) => {
    try {
      const response = await fetch('/api/emergency/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, incidentId })
      });
      if (response.ok) {
        const data = await response.json();
        setEmergencyUnits(data.emergencyUnits);
        setEmergencyIncidents(data.emergencyIncidents);
        syncCityState();
      }
    } catch (err) {
      console.error('Failed to assign dispatch responder:', err);
    }
  };

  // 3. Post Signal Timing adjustments
  const handleAdjustSignalTiming = async (id: string, cycleTime: number) => {
    try {
      const response = await fetch('/api/traffic/signal-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cycleTime })
      });
      if (response.ok) {
        const data = await response.json();
        setTrafficSignals(data.trafficSignals);
        syncCityState();
      }
    } catch (err) {
      console.error('Failed to adjust signaling lights:', err);
    }
  };

  // 4. Acknowledge warning alert
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const response = await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        const data = await response.json();
        setCityAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to acknowledge warning alert:', err);
    }
  };

  // 5. Acknowledge all alerts
  const handleAcknowledgeAllAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/acknowledge-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setCityAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to clear alerts ledger:', err);
    }
  };

  // Sidebar triggers on map clicks
  const handleSelectSignalFromMap = (sig: TrafficSignal) => {
    setActiveTab('traffic');
  };

  const handleSelectIncidentFromMap = (inc: EmergencyIncident) => {
    setActiveTab('emergency');
  };

  const handleSelectUnitFromMap = (unit: EmergencyUnit) => {
    setActiveTab('emergency');
  };

  const handleTriggerAICommand = async (command: string) => {
    if (command === 'PROACTIVE_LIGHTS_OPTIMIZE') {
      // Proactively align congestion signals with AI optimized timings
      for (const sig of trafficSignals) {
        if (sig.cycleTime !== sig.recommendedCycleTime) {
          await handleAdjustSignalTiming(sig.id, sig.recommendedCycleTime);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-mono gap-3.5">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider">Synchronizing Municipal Telemetry...</p>
      </div>
    );
  }

  // Active navigation styles
  const getTabClass = (tab: typeof activeTab) => {
    return `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all border cursor-pointer ${
      activeTab === tab
        ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-xs'
        : 'text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-100'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-x-hidden">
      
      {/* 1. Header Component */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        weather={weatherData}
        alerts={cityAlerts}
        onShowAlerts={() => setShowAlertsSidebar(!showAlertsSidebar)}
      />

      {/* 2. Main Page Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Modular Navigation */}
        <aside className="w-full lg:w-64 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-6 self-start shadow-xs" id="sidebar-nav-card">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Control Operations</div>
            <nav className="flex flex-col gap-1.5" id="operations-navigation">
              <button onClick={() => setActiveTab('map')} className={getTabClass('map')}>
                <span className="flex items-center gap-2.5">
                  <Map className="w-4 h-4 text-slate-500" />
                  <span>Real-time Operational Map</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button onClick={() => setActiveTab('copilot')} className={getTabClass('copilot')}>
                <span className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span>Autonomous AI Co-Pilot</span>
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">LIVE</span>
              </button>

              <button onClick={() => setActiveTab('traffic')} className={getTabClass('traffic')}>
                <span className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Traffic Signal Override</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button onClick={() => setActiveTab('pollution')} className={getTabClass('pollution')}>
                <span className="flex items-center gap-2.5">
                  <Wind className="w-4 h-4 text-slate-500" />
                  <span>Pollution Control Sensors</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button onClick={() => setActiveTab('emergency')} className={getTabClass('emergency')}>
                <span className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-slate-500" />
                  <span>Emergency Dispatch Desk</span>
                </span>
                {emergencyIncidents.filter(i => i.status !== 'Resolved').length > 0 && (
                  <span className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
                    {emergencyIncidents.filter(i => i.status !== 'Resolved').length}
                  </span>
                )}
              </button>

              <button onClick={() => setActiveTab('transit')} className={getTabClass('transit')}>
                <span className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span>Transit Stream Telemetry</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Analytics & Citizen Portal</div>
            <nav className="flex flex-col gap-1.5" id="analytics-navigation">
              <button onClick={() => setActiveTab('complaints')} className={getTabClass('complaints')}>
                <span className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Citizen Complaint Portal</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button onClick={() => setActiveTab('analytics')} className={getTabClass('analytics')}>
                <span className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span>Enterprise KPIs & Reports</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </nav>
          </div>

          {/* Sidebar Footer indicating operational state sync */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <span className="font-semibold text-slate-500">SYNC: {systemSyncTime}</span>
          </div>
        </aside>

        {/* Right Side: Tab View Render Stage */}
        <main className="flex-1 min-w-0 flex flex-col gap-6" id="dashboard-main-view">
          
          {/* Headline Banner based on current active tab */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3" id="tab-header-banner">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                {activeTab === 'map' && 'Real-Time Operational Mapping'}
                {activeTab === 'copilot' && 'Autonomous AI Co-Pilot'}
                {activeTab === 'traffic' && 'Autonomous Signal Timing override'}
                {activeTab === 'pollution' && 'Atmospheric AQI Sensory Streams'}
                {activeTab === 'emergency' && 'Emergency Dispatch Command Desk'}
                {activeTab === 'transit' && 'Live Transport Telemetry Streams'}
                {activeTab === 'complaints' && 'Citizen Complaint Tickets'}
                {activeTab === 'analytics' && 'Executive Performance KPIs'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {activeTab === 'map' && 'Interactive spatial telemetry grid tracking active responders, traffic sensors, and city transports.'}
                {activeTab === 'copilot' && 'Enterprise-grade neural copilot reasoning on multi-variable telemetry and providing signaling commands.'}
                {activeTab === 'traffic' && 'Manual cycle length overrides and AI queue disperse signaling optimization.'}
                {activeTab === 'pollution' && 'Real-time pm2.5, no2, co indices and 6-hour sparkline tracking trends.'}
                {activeTab === 'emergency' && 'Coordinate active police, fire, or medical alerts and dispatcher unit recommendations.'}
                {activeTab === 'transit' && 'Active tracking of metro lines, occupancy levels, and delay schedule indicators.'}
                {activeTab === 'complaints' && 'Automated ticket logging with immediate Gemini NLP categorization and priority grading.'}
                {activeTab === 'analytics' && ' Tabular operational reports with secure CSV downloads and SLA tracking stats.'}
              </p>
            </div>
            
            {/* Operator Role Indicator Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono font-bold text-slate-700 tracking-wide uppercase">{currentRole}</span>
            </div>
          </div>

          {/* Module Tab Content Switcher */}
          <div className="flex-1" id="tab-content-render-box">
            {activeTab === 'map' && (
              <TelemetryMap
                trafficSignals={trafficSignals}
                pollutionStations={pollutionStations}
                emergencyUnits={emergencyUnits}
                emergencyIncidents={emergencyIncidents}
                transitVehicles={transitVehicles}
                onSelectSignal={handleSelectSignalFromMap}
                onSelectIncident={handleSelectIncidentFromMap}
                onSelectUnit={handleSelectUnitFromMap}
              />
            )}

            {activeTab === 'copilot' && (
              <AICopilot onTriggerCommand={handleTriggerAICommand} />
            )}

            {activeTab === 'traffic' && (
              <TrafficModule
                signals={trafficSignals}
                onAdjustSignal={handleAdjustSignalTiming}
              />
            )}

            {activeTab === 'pollution' && (
              <PollutionModule stations={pollutionStations} />
            )}

            {activeTab === 'emergency' && (
              <EmergencyModule
                units={emergencyUnits}
                incidents={emergencyIncidents}
                onDispatchUnit={handleDispatchUnit}
              />
            )}

            {activeTab === 'transit' && (
              <TransitModule vehicles={transitVehicles} />
            )}

            {activeTab === 'complaints' && (
              <ComplaintModule
                complaints={complaints}
                onSubmitComplaint={handleRegisterComplaint}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsModule kpis={kpis} />
            )}
          </div>

        </main>

      </div>

      {/* 3. Alerts Sliding Drawer Component */}
      {showAlertsSidebar && (
        <AlertsSidebar
          alerts={cityAlerts}
          onClose={() => setShowAlertsSidebar(false)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onAcknowledgeAll={handleAcknowledgeAllAlerts}
        />
      )}

    </div>
  );
}
