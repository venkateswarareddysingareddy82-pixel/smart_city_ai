export type UserRole =
  | 'Super Admin'
  | 'City Administrator'
  | 'Traffic Department Officer'
  | 'Emergency Response Officer'
  | 'Pollution Control Officer'
  | 'Public Transport Officer'
  | 'Citizen'
  | 'Data Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

export interface TrafficSignal {
  id: string;
  intersection: string;
  status: 'RED' | 'YELLOW' | 'GREEN';
  cycleTime: number; // in seconds
  recommendedCycleTime: number; // suggested by AI
  queueLength: number; // number of vehicles waiting
  congestionIndex: number; // 0 to 100
  coordinates: { x: number; y: number };
}

export interface PollutionStation {
  id: string;
  zone: string;
  aqi: number; // Air Quality Index
  pm25: number; // PM 2.5 particulate matter
  no2: number; // Nitrogen Dioxide
  co: number; // Carbon Monoxide
  status: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Hazardous';
  coordinates: { x: number; y: number };
  trend: number[]; // Last 6 hours AQI
}

export interface EmergencyUnit {
  id: string;
  name: string;
  type: 'Ambulance' | 'Fire Engine' | 'Police Cruiser';
  status: 'Idle' | 'Dispatched' | 'On Scene';
  coordinates: { x: number; y: number };
  assignedIncidentId?: string;
  batteryLevel: number;
  contactNumber: string;
}

export interface EmergencyIncident {
  id: string;
  type: 'Medical Emergency' | 'Structural Fire' | 'Traffic Collision' | 'Public Disturbance';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Dispatched' | 'Active' | 'Resolved';
  location: string;
  coordinates: { x: number; y: number };
  reportedAt: string;
  assignedUnitId?: string;
  responderNote?: string;
}

export interface TransitRoute {
  id: string;
  name: string;
  stops: string[];
  scheduleFrequency: number; // minutes
}

export interface TransitVehicle {
  id: string;
  routeId: string;
  routeName: string;
  type: 'Bus' | 'Metro';
  occupancy: number; // percentage
  delayMinutes: number; // positive is late, negative is early
  status: 'On Time' | 'Delayed' | 'Heavy Congestion';
  coordinates: { x: number; y: number };
  speed: number; // km/h
}

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  aqiAvg: number;
  floodRisk: 'None' | 'Low' | 'Moderate' | 'High';
  heatwaveWarning: boolean;
  stormAlert: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  coordinates: { x: number; y: number };
  dateCreated: string;
  complainantName: string;
  image?: string; // base64 or placeholder
  officerNotes?: string;
}

export interface CityAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  department: 'Traffic' | 'Environment' | 'Emergency' | 'Transit' | 'Weather' | 'System';
  acknowledged: boolean;
}

export interface DashboardKPIs {
  averageResponseTime: number; // minutes
  activeCongestionPoints: number;
  averageAQI: number;
  totalActiveEmergencyUnits: number;
  citizenSatisfactionRate: number; // percentage
  resolvedComplaintsRate: number; // percentage
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}
