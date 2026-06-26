import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  TrafficSignal,
  PollutionStation,
  EmergencyUnit,
  EmergencyIncident,
  TransitVehicle,
  WeatherData,
  Complaint,
  CityAlert,
  DashboardKPIs,
  ChatMessage
} from "./src/types";

dotenv.config();

// Create the Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API to handle missing keys gracefully
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (e) {
        console.error("Failed to initialize Gemini API Client:", e);
      }
    }
  }
  return aiClient;
}

// ==========================================
// MOCK STATE FOR THE SMART CITY SIMULATOR
// ==========================================

let trafficSignals: TrafficSignal[] = [
  { id: 'SIG-001', intersection: 'Grand Ave & 5th St (Financial District)', status: 'RED', cycleTime: 60, recommendedCycleTime: 75, queueLength: 14, congestionIndex: 78, coordinates: { x: 35, y: 30 } },
  { id: 'SIG-002', intersection: 'Central Blvd & Pine St (Midtown Mall)', status: 'GREEN', cycleTime: 45, recommendedCycleTime: 45, queueLength: 5, congestionIndex: 32, coordinates: { x: 50, y: 45 } },
  { id: 'SIG-003', intersection: 'Industrial Pkwy & Expressway Ramp (East)', status: 'YELLOW', cycleTime: 90, recommendedCycleTime: 120, queueLength: 28, congestionIndex: 92, coordinates: { x: 75, y: 55 } },
  { id: 'SIG-004', intersection: 'Broadway & University Ave (West Campus)', status: 'GREEN', cycleTime: 60, recommendedCycleTime: 50, queueLength: 8, congestionIndex: 45, coordinates: { x: 20, y: 65 } },
  { id: 'SIG-005', intersection: 'Marina Dr & Coast Hwy (South Harbor)', status: 'RED', cycleTime: 50, recommendedCycleTime: 45, queueLength: 4, congestionIndex: 21, coordinates: { x: 45, y: 80 } },
];

let pollutionStations: PollutionStation[] = [
  { id: 'POL-001', zone: 'North Industrial Sector', aqi: 138, pm25: 49.5, no2: 52.1, co: 1.8, status: 'Moderate', coordinates: { x: 70, y: 20 }, trend: [110, 115, 122, 130, 135, 138] },
  { id: 'POL-002', zone: 'Downtown Financial Plaza', aqi: 82, pm25: 26.2, no2: 34.0, co: 0.9, status: 'Good', coordinates: { x: 38, y: 35 }, trend: [95, 90, 88, 85, 83, 82] },
  { id: 'POL-003', zone: 'Eastside Residential Suburb', aqi: 48, pm25: 11.4, no2: 12.5, co: 0.4, status: 'Excellent', coordinates: { x: 80, y: 40 }, trend: [45, 46, 47, 48, 48, 48] },
  { id: 'POL-004', zone: 'Southside Harbor & Logistics', aqi: 165, pm25: 82.3, no2: 74.5, co: 2.1, status: 'Poor', coordinates: { x: 48, y: 85 }, trend: [142, 148, 155, 158, 162, 165] },
  { id: 'POL-005', zone: 'Westside Parklands & University', aqi: 34, pm25: 8.1, no2: 9.2, co: 0.3, status: 'Excellent', coordinates: { x: 15, y: 55 }, trend: [30, 32, 33, 35, 34, 34] },
];

let emergencyUnits: EmergencyUnit[] = [
  { id: 'AMB-101', name: 'Rescue Ambulance 101', type: 'Ambulance', status: 'Idle', coordinates: { x: 32, y: 40 }, batteryLevel: 94, contactNumber: '+1 (555) 911-0101' },
  { id: 'AMB-102', name: 'Rescue Ambulance 102', type: 'Ambulance', status: 'Idle', coordinates: { x: 65, y: 70 }, batteryLevel: 89, contactNumber: '+1 (555) 911-0102' },
  { id: 'FIR-201', name: 'Engine Company 201', type: 'Fire Engine', status: 'Idle', coordinates: { x: 45, y: 25 }, batteryLevel: 100, contactNumber: '+1 (555) 911-0201' },
  { id: 'FIR-202', name: 'Ladder Truck 202', type: 'Fire Engine', status: 'Idle', coordinates: { x: 75, y: 60 }, batteryLevel: 82, contactNumber: '+1 (555) 911-0202' },
  { id: 'POL-301', name: 'Patrol Unit 301', type: 'Police Cruiser', status: 'Idle', coordinates: { x: 22, y: 50 }, batteryLevel: 91, contactNumber: '+1 (555) 911-0301' },
  { id: 'POL-302', name: 'Patrol Unit 302', type: 'Police Cruiser', status: 'Idle', coordinates: { x: 55, y: 35 }, batteryLevel: 78, contactNumber: '+1 (555) 911-0302' },
];

let emergencyIncidents: EmergencyIncident[] = [
  { id: 'INC-901', type: 'Traffic Collision', severity: 'High', status: 'Resolved', location: 'Grand Ave Underpass', coordinates: { x: 34, y: 31 }, reportedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'INC-902', type: 'Medical Emergency', severity: 'Medium', status: 'Resolved', location: 'Marina Boardwalk Cafes', coordinates: { x: 47, y: 81 }, reportedAt: new Date(Date.now() - 7200000).toISOString() },
];

let transitVehicles: TransitVehicle[] = [
  { id: 'BUS-01', routeId: 'R-101', routeName: 'Route 101: Downtown Loop', type: 'Bus', occupancy: 72, delayMinutes: 4, status: 'Delayed', coordinates: { x: 35, y: 38 }, speed: 18 },
  { id: 'BUS-02', routeId: 'R-101', routeName: 'Route 101: Downtown Loop', type: 'Bus', occupancy: 35, delayMinutes: 0, status: 'On Time', coordinates: { x: 45, y: 45 }, speed: 42 },
  { id: 'BUS-03', routeId: 'R-205', routeName: 'Route 205: Harbor - Express', type: 'Bus', occupancy: 85, delayMinutes: 12, status: 'Heavy Congestion', coordinates: { x: 48, y: 72 }, speed: 5 },
  { id: 'BUS-04', routeId: 'R-302', routeName: 'Route 302: Industrial Shuttle', type: 'Bus', occupancy: 15, delayMinutes: -1, status: 'On Time', coordinates: { x: 72, y: 35 }, speed: 50 },
  { id: 'MET-01', routeId: 'M-RED', routeName: 'Metro Red Line (Express)', type: 'Metro', occupancy: 92, delayMinutes: 2, status: 'On Time', coordinates: { x: 50, y: 50 }, speed: 75 },
];

let weatherData: WeatherData = {
  temp: 29.5,
  humidity: 62,
  windSpeed: 14.5,
  condition: 'Partly Cloudy',
  aqiAvg: 93,
  floodRisk: 'Low',
  heatwaveWarning: false,
  stormAlert: false,
};

let complaints: Complaint[] = [
  {
    id: 'CMP-201',
    title: 'Severe Pothole on Broadway Boulevard',
    category: 'Road & Pavement Damage',
    description: 'A major deep pothole has opened up in the middle lane of Broadway Blvd, just before the University Ave intersection. Several cars had to swerve dangerously to avoid it.',
    status: 'In Progress',
    priority: 'High',
    location: 'Broadway & University Ave',
    coordinates: { x: 21, y: 64 },
    dateCreated: new Date(Date.now() - 86400000).toISOString(),
    complainantName: 'Sarah Jenkins',
    officerNotes: 'Assigned to Street Maintenance Crew B. Repair scheduled for tomorrow morning.',
  },
  {
    id: 'CMP-202',
    title: 'Illegal Chemical Dumping in South Canal',
    category: 'Environmental Hazard',
    description: 'Observed a commercial truck dumping plastic containers with a strong chemical smell near the industrial harbor canal bank. Liquid is leaking into the water.',
    status: 'Pending',
    priority: 'Critical',
    location: 'Southside Harbor Canal Gate 4',
    coordinates: { x: 52, y: 88 },
    dateCreated: new Date(Date.now() - 10800000).toISOString(),
    complainantName: 'Michael Chang',
    officerNotes: 'Awaiting urgent pollution control dispatch inspection.'
  },
  {
    id: 'CMP-203',
    title: 'Damaged Bus Shelter Glass',
    category: 'Public Facilities',
    description: 'The glass panel on the rear side of the bus stop shelter at 5th St is completely shattered. Glass shards are on the ground, creating a hazard for waiting passengers.',
    status: 'Resolved',
    priority: 'Low',
    location: 'Grand Ave & 5th St stop',
    coordinates: { x: 34, y: 29 },
    dateCreated: new Date(Date.now() - 172800000).toISOString(),
    complainantName: 'Dina Rogers',
    officerNotes: 'Debris cleared and glass panel replaced by public transit facilities team.'
  }
];

let cityAlerts: CityAlert[] = [
  {
    id: 'ALT-001',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    title: 'AQI Level Spike: Southside Harbor',
    message: 'Air Quality Index has exceeded 160 (Unhealthy) due to cargo vessel emissions combined with low winds. Sensitive individuals are advised to stay indoors.',
    severity: 'Warning',
    department: 'Environment',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    title: 'Severe Congestion at Industrial Expressway Ramp',
    message: 'Queue lengths are exceeding 450 meters. Smart traffic recommendations suggest increasing the Green cycle to 120s.',
    severity: 'Warning',
    department: 'Traffic',
    acknowledged: false,
  }
];

// Helper to calculate smart KPI metrics based on live city data
function calculateKPIs(): DashboardKPIs {
  const activeCongestion = trafficSignals.filter(s => s.congestionIndex > 70).length;
  const activeStations = pollutionStations.filter(s => s.aqi > 0);
  const avgAQI = activeStations.length > 0
    ? Math.round(activeStations.reduce((acc, s) => acc + s.aqi, 0) / activeStations.length)
    : 0;
  const activeEmergency = emergencyUnits.filter(u => u.status !== 'Idle').length;
  
  // Calculate resolved complaints percentage
  const totalComplaintsCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolvedRate = totalComplaintsCount > 0 ? Math.round((resolvedCount / totalComplaintsCount) * 100) : 100;

  return {
    averageResponseTime: 8.4, // Simulated average dispatch-to-scene in minutes
    activeCongestionPoints: activeCongestion,
    averageAQI: avgAQI,
    totalActiveEmergencyUnits: activeEmergency,
    citizenSatisfactionRate: 88, // Constant baseline satisfaction metric
    resolvedComplaintsRate: resolvedRate,
  };
}

// ==========================================
// REAL-TIME SIMULATOR LOOP
// ==========================================
// Every 4 seconds, we slightly update coordinates and statistics to simulate live traffic flows,
// public transport, pollution variations, and active emergency operations!

setInterval(() => {
  // 1. Simulating Traffic Signals & Congestion
  trafficSignals.forEach(sig => {
    // Random walk for queue length and congestion index
    const queueDiff = Math.floor(Math.random() * 5) - 2;
    sig.queueLength = Math.max(0, Math.min(60, sig.queueLength + queueDiff));
    
    // Congestion is directly proportional to queue length with minor noise
    sig.congestionIndex = Math.max(10, Math.min(100, Math.round((sig.queueLength / 40) * 100 + (Math.random() * 10 - 5))));
    
    // Flip signal status periodically (simulating simple lights cycle)
    if (Math.random() < 0.25) {
      if (sig.status === 'GREEN') sig.status = 'YELLOW';
      else if (sig.status === 'YELLOW') sig.status = 'RED';
      else sig.status = 'GREEN';
    }
  });

  // 2. Simulating AQI slightly moving
  pollutionStations.forEach(station => {
    const aqiDiff = Math.floor(Math.random() * 7) - 3; // Shift by -3 to +3
    station.aqi = Math.max(20, Math.min(250, station.aqi + aqiDiff));
    
    // Update pm2.5, no2, co as scaled AQI variants
    station.pm25 = parseFloat((station.aqi * 0.45 + (Math.random() * 5 - 2.5)).toFixed(1));
    station.no2 = parseFloat((station.aqi * 0.38 + (Math.random() * 4 - 2)).toFixed(1));
    station.co = parseFloat((station.aqi * 0.012 + (Math.random() * 0.2 - 0.1)).toFixed(2));

    // Update status string
    if (station.aqi <= 50) station.status = 'Excellent';
    else if (station.aqi <= 100) station.status = 'Good';
    else if (station.aqi <= 150) station.status = 'Moderate';
    else if (station.aqi <= 200) station.status = 'Poor';
    else station.status = 'Hazardous';

    // Shift trend array
    station.trend.push(station.aqi);
    if (station.trend.length > 6) station.trend.shift();
  });

  // 3. Simulating Transit Vehicle Positions & Delays
  transitVehicles.forEach(vehicle => {
    // Slowly move transit vehicles. If they go out of bounds, restart them.
    // X and Y values are percentage of map layout.
    let moveX = (Math.random() * 2 - 1) * 0.8;
    let moveY = (Math.random() * 2 - 1) * 0.8;
    
    // Red Metro travels in a predictable straight diagonal path (NW to SE)
    if (vehicle.type === 'Metro') {
      moveX = 1.2;
      moveY = 1.2;
    }

    vehicle.coordinates.x = parseFloat((vehicle.coordinates.x + moveX).toFixed(2));
    vehicle.coordinates.y = parseFloat((vehicle.coordinates.y + moveY).toFixed(2));

    if (vehicle.coordinates.x < 5 || vehicle.coordinates.x > 95 || vehicle.coordinates.y < 5 || vehicle.coordinates.y > 95) {
      // Re-center vehicle at random core spawn coordinates
      vehicle.coordinates.x = Math.round(30 + Math.random() * 40);
      vehicle.coordinates.y = Math.round(30 + Math.random() * 40);
    }

    // Delay updates occasionally
    if (Math.random() < 0.1) {
      const delayDiff = Math.floor(Math.random() * 3) - 1; // -1 to +1 min delay
      vehicle.delayMinutes = Math.max(-2, Math.min(25, vehicle.delayMinutes + delayDiff));
      
      if (vehicle.delayMinutes === 0) vehicle.status = 'On Time';
      else if (vehicle.delayMinutes > 10) vehicle.status = 'Heavy Congestion';
      else vehicle.status = 'Delayed';
    }
  });

  // 4. Emergency Unit Route Movement to Active Incidents!
  emergencyUnits.forEach(unit => {
    if (unit.status === 'Dispatched' && unit.assignedIncidentId) {
      const incident = emergencyIncidents.find(inc => inc.id === unit.assignedIncidentId);
      if (incident) {
        // Calculate difference vector
        const dx = incident.coordinates.x - unit.coordinates.x;
        const dy = incident.coordinates.y - unit.coordinates.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
          // Unit arrived at scene!
          unit.status = 'On Scene';
          unit.coordinates.x = incident.coordinates.x;
          unit.coordinates.y = incident.coordinates.y;
          incident.status = 'Active';
          
          // Add system Alert
          cityAlerts.unshift({
            id: 'ALT-' + Math.floor(Math.random() * 1000000),
            timestamp: new Date().toISOString(),
            title: `${unit.name} On Scene`,
            message: `${unit.name} has arrived at ${incident.location} for the reported ${incident.type}. Managing incident operations.`,
            severity: 'Info',
            department: 'Emergency',
            acknowledged: false
          });
        } else {
          // Step closer
          const speedFactor = 2.5; // Moves 2.5% of grid width per tick
          unit.coordinates.x = parseFloat((unit.coordinates.x + (dx / distance) * speedFactor).toFixed(2));
          unit.coordinates.y = parseFloat((unit.coordinates.y + (dy / distance) * speedFactor).toFixed(2));
          // Consume minor battery
          unit.batteryLevel = Math.max(10, unit.batteryLevel - 0.2);
        }
      }
    } else if (unit.status === 'On Scene' && unit.assignedIncidentId) {
      const incident = emergencyIncidents.find(inc => inc.id === unit.assignedIncidentId);
      // Simulate resolver loop (10% chance incident gets resolved per tick)
      if (Math.random() < 0.12 && incident) {
        incident.status = 'Resolved';
        unit.status = 'Idle';
        unit.assignedIncidentId = undefined;

        cityAlerts.unshift({
          id: 'ALT-' + Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString(),
          title: `Incident Resolved: ${incident.type}`,
          message: `${incident.type} at ${incident.location} has been successfully resolved and cleared by first responders. All units returning to standby.`,
          severity: 'Info',
          department: 'Emergency',
          acknowledged: false
        });
      }
    } else {
      // Idle unit - slowly recharge electric grid battery
      unit.batteryLevel = Math.min(100, unit.batteryLevel + 0.1);
    }
  });

  // 5. Occasionally spawn an automatic high-severity incident to keep the map dynamic (10% chance)
  if (Math.random() < 0.08 && emergencyIncidents.filter(i => i.status !== 'Resolved').length === 0) {
    const incidentTypes: Array<EmergencyIncident['type']> = ['Medical Emergency', 'Structural Fire', 'Traffic Collision', 'Public Disturbance'];
    const chosenType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    
    let location = 'Central Square';
    let x = 50, y = 50;
    
    if (chosenType === 'Structural Fire') {
      location = 'North Industrial Compound B';
      x = 78; y = 22;
    } else if (chosenType === 'Traffic Collision') {
      location = 'Expressway Overpass Gate 2';
      x = 71; y = 52;
    } else if (chosenType === 'Medical Emergency') {
      location = 'Marina Public Beach';
      x = 42; y = 84;
    } else {
      location = 'West Campus Plaza';
      x = 18; y = 66;
    }

    const newIncident: EmergencyIncident = {
      id: 'INC-' + Math.floor(Math.random() * 100 + 900),
      type: chosenType,
      severity: chosenType === 'Structural Fire' ? 'High' : (Math.random() < 0.3 ? 'Critical' : 'Medium'),
      status: 'Reported',
      location: location,
      coordinates: { x, y },
      reportedAt: new Date().toISOString()
    };

    emergencyIncidents.unshift(newIncident);

    cityAlerts.unshift({
      id: 'ALT-' + Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
      title: `URGENT INCIDENT: ${newIncident.type}`,
      message: `A new ${newIncident.severity} severity ${newIncident.type} was reported at ${newIncident.location}. Dispatch recommended immediately.`,
      severity: newIncident.severity === 'Critical' || newIncident.severity === 'High' ? 'Critical' : 'Warning',
      department: 'Emergency',
      acknowledged: false
    });
  }

  // Update average AQI in weatherData
  const activeStations = pollutionStations.filter(s => s.aqi > 0);
  weatherData.aqiAvg = activeStations.length > 0
    ? Math.round(activeStations.reduce((acc, s) => acc + s.aqi, 0) / activeStations.length)
    : 93;

}, 4000);

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Get complete city state
app.get("/api/city-state", (req, res) => {
  res.json({
    trafficSignals,
    pollutionStations,
    emergencyUnits,
    emergencyIncidents,
    transitVehicles,
    weatherData,
    complaints,
    cityAlerts,
    kpis: calculateKPIs()
  });
});

// Post a citizen complaint and invoke Gemini AI classification and NLP check
app.post("/api/complaints", async (req, res) => {
  try {
    const { title, category, description, location, complainantName, coordinates } = req.body;
    
    if (!title || !description || !location) {
      res.status(400).json({ error: "Missing required complaint fields." });
      return;
    }

    const newComplaintId = 'CMP-' + Math.floor(Math.random() * 900 + 100);
    const coords = coordinates || { x: Math.round(20 + Math.random() * 60), y: Math.round(20 + Math.random() * 60) };
    
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    let suggestedCategory = category || 'General Inquiry';
    let aiReason = 'Categorized by Smart City Rule-Engine.';

    const ai = getGeminiClient();
    if (ai) {
      // Analyze with AI
      try {
        const prompt = `Analyze this citizen complaint for a smart city administration portal. 
Title: "${title}"
Description: "${description}"

We require classification output in JSON format with exactly:
1. "category": Choose from ["Road & Pavement Damage", "Environmental Hazard", "Public Facilities", "Traffic & Signals", "Power & Electrical", "Waste Management", "Public Health & Safety"]
2. "priority": Choose from ["Low", "Medium", "High", "Critical"]
3. "priorityScore": A number from 0 to 100 reflecting severity
4. "reason": A brief 1-sentence analytical justification for the priority and recommended action.

Strictly return JSON format only. Do not wrap in markdown code blocks.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                priority: { type: Type.STRING },
                priorityScore: { type: Type.INTEGER },
                reason: { type: Type.STRING }
              },
              required: ["category", "priority", "priorityScore", "reason"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.category) suggestedCategory = parsed.category;
          if (parsed.priority) priority = parsed.priority as any;
          if (parsed.reason) aiReason = parsed.reason;
        }
      } catch (aiError) {
        console.error("Gemini complaint classification failed, falling back to heuristics:", aiError);
        // Fallback checks
        const descLower = description.toLowerCase();
        if (descLower.includes("toxic") || descLower.includes("dumping") || descLower.includes("chemical") || descLower.includes("leak")) {
          priority = 'Critical';
          suggestedCategory = 'Environmental Hazard';
          aiReason = 'Heuristic detect: Environmental contamination keyword detected.';
        } else if (descLower.includes("accident") || descLower.includes("crash") || descLower.includes("collision")) {
          priority = 'High';
          suggestedCategory = 'Traffic & Signals';
        }
      }
    }

    const newComplaint: Complaint = {
      id: newComplaintId,
      title,
      category: suggestedCategory,
      description,
      status: 'Pending',
      priority,
      location,
      coordinates: coords,
      dateCreated: new Date().toISOString(),
      complainantName: complainantName || 'Anonymous Citizen',
      officerNotes: `AI analysis: Priority assigned based on safety threat assessment. Reason: ${aiReason}`
    };

    complaints.unshift(newComplaint);

    // Create a system alert for new critical/high complaints
    if (priority === 'Critical' || priority === 'High') {
      cityAlerts.unshift({
        id: 'ALT-' + Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
        title: `Citizen Escalation: ${newComplaint.title}`,
        message: `High priority complaint submitted by ${newComplaint.complainantName} at ${newComplaint.location}. NLP Analyzer rated urgency: ${priority}.`,
        severity: priority === 'Critical' ? 'Critical' : 'Warning',
        department: 'System',
        acknowledged: false
      });
    }

    res.json({ success: true, complaint: newComplaint, complaints });
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ error: error.message });
  }
});

// Dispatch Emergency Unit to active Emergency Incident
app.post("/api/emergency/dispatch", (req, res) => {
  const { unitId, incidentId } = req.body;
  if (!unitId || !incidentId) {
    res.status(400).json({ error: "Missing unitId or incidentId parameters." });
    return;
  }

  const unit = emergencyUnits.find(u => u.id === unitId);
  const incident = emergencyIncidents.find(i => i.id === incidentId);

  if (!unit || !incident) {
    res.status(404).json({ error: "Emergency unit or incident not found." });
    return;
  }

  if (unit.status !== 'Idle') {
    res.status(400).json({ error: "Selected rescue unit is currently active on another dispatch." });
    return;
  }

  // Update state
  unit.status = 'Dispatched';
  unit.assignedIncidentId = incidentId;
  incident.status = 'Dispatched';
  incident.assignedUnitId = unitId;

  // Add dispatch alert
  cityAlerts.unshift({
    id: 'ALT-' + Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    title: `Unit Dispatched: ${unit.name}`,
    message: `${unit.name} dispatched to address ${incident.type} at ${incident.location} (Severity: ${incident.severity}). Tracking coordinates live.`,
    severity: 'Info',
    department: 'Emergency',
    acknowledged: false
  });

  res.json({ success: true, unit, incident, emergencyUnits, emergencyIncidents });
});

// Adjust Traffic Signal cycle times
app.post("/api/traffic/signal-adjust", (req, res) => {
  const { id, cycleTime } = req.body;
  if (!id || !cycleTime) {
    res.status(400).json({ error: "Missing signal id or custom cycleTime value." });
    return;
  }

  const sig = trafficSignals.find(s => s.id === id);
  if (!sig) {
    res.status(404).json({ error: "Traffic signal intersection sensor not found." });
    return;
  }

  sig.cycleTime = Number(cycleTime);
  sig.queueLength = Math.max(0, sig.queueLength - 5); // Simulating traffic dispersing on signal timing update!
  sig.congestionIndex = Math.max(10, Math.round((sig.queueLength / 40) * 100));

  cityAlerts.unshift({
    id: 'ALT-' + Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    title: `Signal Adjusted: ${sig.id}`,
    message: `Manual timing override executed for ${sig.intersection}. Set cycle time to ${sig.cycleTime}s. Live queue cleared to ${sig.queueLength} vehicles.`,
    severity: 'Info',
    department: 'Traffic',
    acknowledged: false
  });

  res.json({ success: true, signal: sig, trafficSignals });
});

// Acknowledge city alerts
app.post("/api/alerts/acknowledge", (req, res) => {
  const { id } = req.body;
  const alert = cityAlerts.find(a => a.id === id);
  if (alert) {
    alert.acknowledged = true;
  }
  res.json({ success: true, alerts: cityAlerts });
});

// Acknowledge all alerts at once
app.post("/api/alerts/acknowledge-all", (req, res) => {
  cityAlerts.forEach(a => a.acknowledged = true);
  res.json({ success: true, alerts: cityAlerts });
});

// ==========================================
// GEMINI SMART CO-PILOT ASSISTANT & CHAT
// ==========================================

// Chat endpoint (with contextual knowledge of the full smart city live state!)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      res.status(400).json({ error: "No user message provided." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return highly smart simulated fallback responses if API key is not present
      const fallbackReplies = [
        "I am operating on stand-by simulation mode. Currently, AQI downtown is within standard safety levels. Grand Ave signal SIG-001 timing is recommended to be adjusted due to high queue volumes of vehicles.",
        "Regarding your query about public transit: Route 205 (Harbor Express) is experiencing heavy delay of approximately 12 minutes. The Red Metro is operating on schedule.",
        "Emergency services status: We have Rescue units AMB-101 and AMB-102 stationed at standby coordinates. No pending critical incidents are unassigned at this time.",
        "To optimize traffic congestion, I recommend increasing Grand Ave and 5th St signal cycle to 75 seconds to disperse the active queue."
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      res.json({ text: `[Simulation Engine Standby] ${randomReply}\n\n*(Connect your Gemini API Key in the Secrets menu to activate full real-time operational reasoning)*` });
      return;
    }

    // Prepare city status snapshot to ground the AI model with real live numbers!
    const activeIncidents = emergencyIncidents.filter(i => i.status !== 'Resolved');
    const signalStatusStr = trafficSignals.map(s => `${s.id} (${s.intersection}): Queue=${s.queueLength}, Congestion=${s.congestionIndex}%, RecommendedCycle=${s.recommendedCycleTime}s, CurrentCycle=${s.cycleTime}s`).join('\n');
    const pollutionStatusStr = pollutionStations.map(p => `${p.id} (${p.zone}): AQI=${p.aqi} (${p.status}), PM2.5=${p.pm25}, NO2=${p.no2}`).join('\n');
    const emergencyStatusStr = emergencyUnits.map(u => `${u.id} (${u.name}): Status=${u.status}, AssignedIncident=${u.assignedIncidentId || 'None'}, Battery=${u.batteryLevel}%`).join('\n');
    const activeIncidentsStr = activeIncidents.length > 0
      ? activeIncidents.map(i => `${i.id}: Type=${i.type}, Location=${i.location}, Severity=${i.severity}, Status=${i.status}, AssignedUnit=${i.assignedUnitId || 'Unassigned'}`).join('\n')
      : 'None';
    const transitStatusStr = transitVehicles.map(v => `${v.id} (${v.routeName}): Status=${v.status}, Occupancy=${v.occupancy}%, Delay=${v.delayMinutes} mins`).join('\n');

    const systemPrompt = `You are "Smart City AI - Autonomous Urban Intelligence Co-Pilot".
You are an advanced enterprise-grade AI operating system built for smart city municipal authorities, traffic command centers, and emergency response dispatchers.
You have real-time programmatic access to all city telemetry, sensors, and deployment grids.

Here is the CURRENT LIVE telemetry of Metro City:

--- TRAFFIC SIGNAL CONTROL SYSTEMS ---
${signalStatusStr}

--- ENVIRONMENT & AIR QUALITY (AQI) MONITORING ---
${pollutionStatusStr}

--- EMERGENCY SERVICES DISPATCH SENSORS ---
${emergencyStatusStr}
Active/Unresolved Emergency Incidents:
${activeIncidentsStr}

--- PUBLIC TRANSPORTATION TELEMETRY ---
${transitStatusStr}

--- CURRENT METEOROLOGICAL STATE ---
Temperature: ${weatherData.temp}°C, Humidity: ${weatherData.humidity}%, Wind Speed: ${weatherData.windSpeed} km/h
Flood Risk Level: ${weatherData.floodRisk}, Warnings: Heatwave=${weatherData.heatwaveWarning}, Storm=${weatherData.stormAlert}

You are speaking with a city administrator, municipal manager, or operations officer. 
Provide objective, crisp, and analytical answers. When the operator asks you to diagnose, recommend, or summarize:
- Provide actual data-backed conclusions using the metrics above.
- Point out potential hazards (e.g. if AQI is poor, if a congestion point is backed up, if an incident is unassigned).
- Recommend specific, highly actionable operational commands (e.g., "Dispatch Patrol Unit POL-301 to INC-903", "Acknowledge environmental warning ALT-001", "Increase industrial cycle time SIG-003 to 120s").
Keep your responses highly executive, formal, and informative. Use structured markdown formatting. Avoid any conversational fluff.`;

    // Map chat history format to content format
    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Ensure we append the latest user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini AI Chat copilot error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Platform Predictive Analytics & Optimization recommendation engine
app.post("/api/ai/predict", async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        trafficForecast: "Simulation Prediction: Heavy grid congestion expected at North Sector and Expressway Ramp during the afternoon shift (16:00 - 18:30). Recommend proactively setting SIG-003 cycle times to 110 seconds.",
        pollutionForecast: "Environmental Forecast: AQI in Southside Harbor is predicted to peak at 178 (Hazardous/Poor) within the next 4 hours due to maritime diesel emissions and stagnant air conditions. Consider triggering slow-steaming shipping rules.",
        emergencyDemandForecast: "Emergency Risk Analysis: Medium elevated risk of minor traffic incidents along grand avenue due to intersection gridlock queue spikes. High priority: Assign emergency patrol POL-301 to standby in Central Plaza.",
        rawAiAnalysis: "Simulated Model Response: Establish standard green-wave signaling. Connect Gemini API to fetch dynamic multi-variable forecasting graphs."
      });
      return;
    }

    const stateSummary = {
      signals: trafficSignals.map(s => ({ id: s.id, loc: s.intersection, queue: s.queueLength, index: s.congestionIndex })),
      pollution: pollutionStations.map(p => ({ id: p.id, zone: p.zone, aqi: p.aqi })),
      emergency: {
        totalUnits: emergencyUnits.length,
        idleCount: emergencyUnits.filter(u => u.status === 'Idle').length,
        activeIncidents: emergencyIncidents.filter(i => i.status !== 'Resolved').length
      },
      weather: weatherData
    };

    const prompt = `Perform advanced city operations predictive analysis and optimization modeling for Metro City administration.
Analyze current state metadata:
${JSON.stringify(stateSummary, null, 2)}

Provide your output in valid JSON format ONLY with these exact string attributes:
- "trafficForecast": Predicted congestion spots over the next 4 hours, bottleneck locations, and signaling recommendations.
- "pollutionForecast": AQI forecasts, particulate matter dispersion warnings, and environmental advisories.
- "emergencyDemandForecast": Risk mapping of emergency service demands, recommended patrol unit placements, and proactive safety measures.
- "rawAiAnalysis": A concise strategic executive summary of smart urban optimization recommendations.

Strictly return JSON format only. Do not wrap in markdown blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trafficForecast: { type: Type.STRING },
            pollutionForecast: { type: Type.STRING },
            emergencyDemandForecast: { type: Type.STRING },
            rawAiAnalysis: { type: Type.STRING }
          },
          required: ["trafficForecast", "pollutionForecast", "emergencyDemandForecast", "rawAiAnalysis"]
        }
      }
    });

    if (response.text) {
      res.json(JSON.parse(response.text.trim()));
    } else {
      throw new Error("Empty model response received.");
    }
  } catch (error: any) {
    console.error("Gemini predictive analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// EXCEL / CSV REPORT DOWNLOADS & MOCK FILE EXPORTS
// ==========================================
app.get("/api/reports/download", (req, res) => {
  const type = req.query.type || 'city-kpi';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=smartcity-${type}-report.csv`);
  
  if (type === 'traffic') {
    let csv = "SignalID,Intersection,CurrentQueue,CongestionIndex,CycleTime,AI_RecommendedCycle\n";
    trafficSignals.forEach(s => {
      csv += `${s.id},"${s.intersection.replace(/"/g, '""')}",${s.queueLength},${s.congestionIndex},${s.cycleTime},${s.recommendedCycleTime}\n`;
    });
    res.send(csv);
  } else if (type === 'pollution') {
    let csv = "SensorID,ZoneName,AQI_Index,PM25_Particulates,NO2_Index,CO_Level,StatusCategory\n";
    pollutionStations.forEach(p => {
      csv += `${p.id},"${p.zone.replace(/"/g, '""')}",${p.aqi},${p.pm25},${p.no2},${p.co},${p.status}\n`;
    });
    res.send(csv);
  } else {
    // General city operations report
    let csv = "OperationalMetric,CurrentValue,StatusThreshold\n";
    const kpi = calculateKPIs();
    csv += `AverageResponseTime,${kpi.averageResponseTime} mins,SLA < 10 mins\n`;
    csv += `ActiveCongestionPoints,${kpi.activeCongestionPoints},Critical > 3\n`;
    csv += `AverageCityAQI,${kpi.averageAQI},Warning > 100\n`;
    csv += `TotalActiveEmergencyUnits,${kpi.totalActiveEmergencyUnits},Standby Capacity: ${emergencyUnits.length}\n`;
    csv += `CitizenSatisfactionRate,${kpi.citizenSatisfactionRate}%,Target > 85%\n`;
    csv += `ResolvedComplaintsRate,${kpi.resolvedComplaintsRate}%,Total Submitted: ${complaints.length}\n`;
    res.send(csv);
  }
});


// ==========================================
// VITE CLIENT INTEGRATION & PRODUCTION ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart City AI Server listening at http://localhost:${PORT}`);
  });
}

startServer();
