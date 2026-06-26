import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck, Cpu } from 'lucide-react';
import { ChatMessage } from '../types';

interface AICopilotProps {
  onTriggerCommand: (command: string) => void;
}

export default function AICopilot({ onTriggerCommand }: AICopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: "Metro City Operational AI Co-Pilot Online. I have synchronized with all active signaling grids, pollution sensor telemetry, municipal transport streams, and active emergency responder coordinates.\n\nHow can I assist you with urban optimization or responder dispatching today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  
  // Advanced predictive forecasts
  const [forecasts, setForecasts] = useState<{
    trafficForecast: string;
    pollutionForecast: string;
    emergencyDemandForecast: string;
    rawAiAnalysis: string;
  } | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Predictive Forecasting Trigger
  const triggerPredictiveForecasting = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setForecasts(data);
        
        // Add a system notice message to the chat
        setMessages(prev => [
          ...prev,
          {
            id: 'predict-notice-' + Date.now(),
            sender: 'system',
            text: "🔍 AI Predictive Forecasting Simulation Executed: Refreshed multi-variable deep learning predictions for traffic queue propagation, particulate matter flow, and emergency risk sectors.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to compile forecasts:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Fetch initial prediction
  useEffect(() => {
    triggerPredictiveForecasting();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const promptToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          chatHistory: messages.filter(m => m.sender !== 'system')
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [
          ...prev,
          {
            id: 'reply-' + Date.now(),
            sender: 'assistant',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error("Endpoint returned non-ok status");
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'system',
          text: "⚠️ Core API Link Interrupted. The AI is operating on localized telemetry heuristics.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="ai-copilot-card">
      
      {/* Tab controls */}
      <div className="flex border-b border-slate-200 bg-slate-50/50" id="copilot-tabs">
        <div className="flex-1 py-3 px-4 border-r border-slate-200 flex items-center justify-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 font-sans tracking-wide">Live Operations Co-Pilot</span>
        </div>
        <button 
          onClick={triggerPredictiveForecasting}
          disabled={isPredicting}
          className="px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer border-none"
          title="Run Predictive Simulation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPredicting ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Predictive Forecasts</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden min-h-[450px]">
        
        {/* Left Side: Live Conversational Agent */}
        <div className="flex-1 flex flex-col h-full overflow-hidden" id="copilot-chat-pane">
          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-h-[250px] bg-slate-50/20" id="copilot-messages-list">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender !== 'user' && (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.sender === 'system' ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white shadow-sm'
                  }`}>
                    {msg.sender === 'system' ? <Cpu className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm font-medium' 
                    : msg.sender === 'system'
                    ? 'bg-slate-100 border border-slate-200 text-slate-700 font-mono rounded-tl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>
                  <div className={`text-[9px] mt-1.5 text-right font-mono ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2" id="copilot-input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              placeholder="Ask for traffic adjustments, responder dispatch, or pollution reports..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-sans bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer border-none"
            >
              {isSending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Predictive Insights & Optimization Center */}
        <div className="w-full md:w-80 p-4 bg-slate-50/55 flex flex-col gap-4 overflow-y-auto" id="copilot-forecasting-pane">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Predictive Intelligence</h3>
          </div>

          {isPredicting ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-[11px] font-mono">Running city-wide optimization algorithms...</p>
            </div>
          ) : forecasts ? (
            <div className="space-y-4" id="copilot-forecast-cards">
              
              {/* Traffic Prediction */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Traffic Queue Propagation</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{forecasts.trafficForecast}</p>
                <div className="mt-2.5 flex justify-end">
                  <button 
                    onClick={() => onTriggerCommand('PROACTIVE_LIGHTS_OPTIMIZE')}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer border-none bg-transparent"
                  >
                    Apply AI Timing Suggestions →
                  </button>
                </div>
              </div>

              {/* Pollution Prediction */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Environmental AQI Dispatch</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{forecasts.pollutionForecast}</p>
              </div>

              {/* Emergency Demand Alert */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Services Demand Risk</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{forecasts.emergencyDemandForecast}</p>
              </div>

              {/* Raw Analytical Summary */}
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Executive Advisor Note</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{forecasts.rawAiAnalysis}"</p>
              </div>

            </div>
          ) : (
            <div className="p-4 text-center text-slate-400 text-xs">
              <AlertCircle className="w-5 h-5 mx-auto mb-1.5 text-slate-300" />
              No predictive modeling cached.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
