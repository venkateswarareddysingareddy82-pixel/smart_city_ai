import React, { useState } from 'react';
import { 
  FileText, 
  MapPin, 
  AlertTriangle, 
  Send, 
  Upload, 
  User, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Complaint } from '../types';

interface ComplaintModuleProps {
  complaints: Complaint[];
  onSubmitComplaint: (formData: any) => Promise<void>;
}

export default function ComplaintModule({ complaints, onSubmitComplaint }: ComplaintModuleProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Road & Pavement Damage');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [complainantName, setComplainantName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    'Road & Pavement Damage',
    'Environmental Hazard',
    'Public Facilities',
    'Traffic & Signals',
    'Power & Electrical',
    'Waste Management',
    'Public Health & Safety',
    'General Inquiry'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await onSubmitComplaint({
        title,
        category,
        description,
        location,
        complainantName: complainantName.trim() || 'Anonymous Citizen'
      });

      // Reset form on success
      setTitle('');
      setDescription('');
      setLocation('');
      setComplainantName('');
      setSubmitSuccess(true);
      
      // Auto-clear success message after 4 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to report complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="complaints-module-container">
      
      {/* 1. Citizen Complaint Submission Ticket */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col h-full" id="complaint-submission-form-card">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Citizen Ticket Desk</h3>
        </div>

        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2.5 shadow-xs" id="ticket-success-alert">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Operational Ticket Lodged!</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Our Gemini NLP Analyzer classified the urgency priority, matched appropriate municipal response guidelines, and updated responder logs.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between" id="complaint-form">
          <div className="space-y-3.5">
            {/* Ticket Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="ticket-title">
                Incident Title *
              </label>
              <input
                id="ticket-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Briefly state the municipal issue..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-800 font-sans"
              />
            </div>

            {/* Custom Category Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="ticket-category">
                Primary Category Selection
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-800 font-sans"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="ticket-description">
                Ticket Description & Evidence *
              </label>
              <textarea
                id="ticket-description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide location details, physical descriptions, and direct threat severity levels..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-800 font-sans resize-none"
              />
            </div>

            {/* Street Address / Geo Coordinates */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="ticket-location">
                Street Address Location *
              </label>
              <div className="relative">
                <input
                  id="ticket-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 5th Ave / Grand Plaza intersection"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-800 font-sans"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Submitter Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5" htmlFor="ticket-name">
                Submitter Name
              </label>
              <div className="relative">
                <input
                  id="ticket-name"
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="Leave blank for anonymous ticketing..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50/50 text-slate-800 font-sans"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim() || !location.trim()}
            className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Log Municipal Ticket</span>
          </button>
        </form>
      </div>

      {/* 2. Public Live Complaints Feed with AI analysis results */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 lg:col-span-2 flex flex-col" id="complaints-feed-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Citizen Escalation Feed</h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono">
            {complaints.length} REGISTERED TICKETS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 max-h-[480px] pr-1" id="complaints-tickets-list">
          {complaints.map((c) => {
            const isCritical = c.priority === 'Critical' || c.priority === 'High';
            
            // Priority styling
            const priorityBadge = 
              c.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' :
              c.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100 font-semibold' :
              c.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div 
                key={c.id} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 flex flex-col gap-3 hover:border-slate-300 transition-colors"
              >
                
                {/* Header detail */}
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">{c.id} • {c.category}</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{c.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${priorityBadge}`}>
                      {c.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                      c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      c.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Body details */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{c.description}</p>

                {/* Submitter Info and Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-2.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-slate-600 font-semibold font-sans">Reported by: {c.complainantName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.location}
                    </span>
                  </div>
                  <span>
                    {new Date(c.dateCreated).toLocaleDateString()} {new Date(c.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* AI / Inspector Notes (Aesthetic highlights) */}
                {c.officerNotes && (
                  <div className="bg-white border border-slate-150 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 font-sans">Municipal Action Plan: </span>
                      <span className="font-sans">{c.officerNotes}</span>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
