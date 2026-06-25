import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timeline } from '../types';
import { ShieldCheck, AlertTriangle, Zap, Hourglass, TrendingUp, Sparkles, AlertOctagon } from 'lucide-react';

interface TimelineSimulatorProps {
  timelines: Timeline[];
  isLoading: boolean;
  onLockIn: (type: 'A' | 'B' | 'C') => void;
  selectedTimelineType: 'A' | 'B' | 'C' | null;
}

export default function TimelineSimulator({ timelines, isLoading, onLockIn, selectedTimelineType }: TimelineSimulatorProps) {
  const [activeType, setActiveType] = useState<'A' | 'B' | 'C'>('C'); // Default to showing the disaster version for impact!

  const currentTimeline = timelines.find(t => t.type === activeType);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl h-[450px]">
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 border-4 border-t-amber-500 border-r-transparent border-b-rose-500 border-l-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          <Hourglass className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={24} />
        </div>
        <p className="mt-6 text-lg font-display text-slate-300 font-medium">Forecasting your timelines...</p>
        <p className="mt-2 text-sm text-slate-500 font-mono text-center max-w-sm">
          AI is mapping out your next few days based on how much you stay on track...
        </p>
      </div>
    );
  }

  if (timelines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl h-[400px]">
        <Hourglass className="text-slate-600 mb-4" size={40} />
        <p className="text-slate-400 font-medium font-display">No Timeline Forecast Active</p>
        <p className="text-xs text-slate-500 max-w-md text-center mt-1">
          Type your project or goal on the left to see exactly how your future looks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header with Selector Tabs */}
      <div className="border-b border-white/10 bg-white/[0.02] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="font-serif italic text-lg text-white flex items-center gap-2">
            <Zap className="text-orange-500" size={16} />
            Timeline Forecast
          </h3>
          <p className="text-[10px] text-white/40 font-mono">Forecasted paths based on your habits</p>
        </div>
 
        <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 w-full md:w-auto">
          {(['A', 'B', 'C'] as const).map((type) => {
            const isSelected = activeType === type;
            let label = "Locked-In Path";
            if (type === 'B') {
              label = "Mid-Way Path";
            } else if (type === 'C') {
              label = "Worst Timeline";
            }
 
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-md font-sans text-[11px] font-semibold transition-all border ${
                  isSelected
                    ? "bg-white text-black border-white shadow"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
 
      <AnimatePresence mode="wait">
        {currentTimeline && (
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-5"
          >
            {/* Meta Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Stat 1: Success Probability */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-3">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-11 h-11 transform -rotate-90">
                    <circle cx="22" cy="22" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                    <motion.circle
                      cx="22"
                      cy="22"
                      r="16"
                      stroke={activeType === 'A' ? '#10b981' : activeType === 'B' ? '#f59e0b' : '#f43f5e'}
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 16}
                      initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - currentTimeline.probability / 100) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-white">
                    {currentTimeline.probability}%
                  </span>
                </div>
                <div>
                  <h4 className="text-[9px] font-mono uppercase tracking-wider text-white/40">Success Rate</h4>
                  <p className="text-xs font-sans font-medium text-white/90">Completion Chance</p>
                </div>
              </div>
 
              {/* Stat 2: Stress level */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-3">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-11 h-11 transform -rotate-90">
                    <circle cx="22" cy="22" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                    <motion.circle
                      cx="22"
                      cy="22"
                      r="16"
                      stroke={activeType === 'A' ? '#3b82f6' : activeType === 'B' ? '#fb923c' : '#ef4444'}
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 16}
                      initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - currentTimeline.stressLevel / 100) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-white">
                    {currentTimeline.stressLevel}%
                  </span>
                </div>
                <div>
                  <h4 className="text-[9px] font-mono uppercase tracking-wider text-white/40">Stress Level</h4>
                  <p className="text-xs font-sans font-medium text-white/90">Avg Pressure</p>
                </div>
              </div>
 
              {/* Stat 3: Risk Level badge */}
              <div className={`border rounded-xl p-2.5 flex items-center gap-3 ${
                activeType === 'A' 
                  ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-400" 
                  : activeType === 'B' 
                  ? "bg-amber-950/10 border-amber-900/30 text-amber-400" 
                  : "bg-rose-950/20 border-rose-900/30 text-rose-400"
              }`}>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-white shrink-0">
                  {activeType === 'A' ? <ShieldCheck size={16} /> : activeType === 'B' ? <AlertTriangle size={16} /> : <AlertOctagon size={16} />}
                </div>
                <div>
                  <h4 className="text-[9px] font-mono uppercase tracking-wider opacity-60">Vibe Status</h4>
                  <p className="text-xs font-sans font-bold">
                    {activeType === 'A' ? "PERFECTLY ON TRACK" : activeType === 'B' ? "COULD BE BETTER" : "FUMBLING DISASTER"}
                  </p>
                </div>
              </div>
            </div>
 
            {/* Main Narrative Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <h4 className="font-serif italic text-base text-white mb-1.5 flex items-center gap-2">
                <Sparkles className="text-orange-500 animate-pulse" size={14} />
                {currentTimeline.name}
              </h4>
              <p className="text-xs text-white/80 leading-relaxed mb-3">{currentTimeline.description}</p>
              
              <div className="border-t border-white/10 pt-2.5">
                <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider block mb-0.5">Consequences of this timeline:</span>
                <p className="text-xs text-white/60 italic leading-relaxed">{currentTimeline.consequences}</p>
              </div>
            </div>
 
            {/* Chrono-Flow Progression (Milestones) */}
            <h4 className="font-mono text-[9px] uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-white/30" />
              Panic Trajectory
            </h4>
 
            <div className="space-y-2.5 mb-4 relative pl-3.5 border-l border-white/10">
              {currentTimeline.dayByDayPlan.map((step, idx) => {
                let nodeColor = "bg-emerald-500";
                let textHighlight = "text-emerald-400";
                if (step.stressLevel > 40 && step.stressLevel <= 70) {
                  nodeColor = "bg-amber-500";
                  textHighlight = "text-amber-400";
                } else if (step.stressLevel > 70) {
                  nodeColor = "bg-rose-500";
                  textHighlight = "text-rose-400";
                }
 
                return (
                  <div key={idx} className="relative py-0.5">
                    {/* Visual node bullet */}
                    <div className={`absolute -left-[19.5px] top-2 w-2 h-2 rounded-full ${nodeColor} ring-4 ring-[#050505]`} />
                    
                    <div className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 transition-all">
                      <div>
                        <span className="text-[8px] font-mono text-white/40 font-bold block">{step.day}</span>
                        <p className="text-xs text-white/85 font-medium">{step.action}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/5 shrink-0">
                        <span className="text-[8px] font-mono text-white/40 uppercase">Panic:</span>
                        <span className={`text-[9px] font-mono font-bold ${textHighlight}`}>{step.stressLevel}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
 
            {/* Lock In / Activation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedTimelineType === activeType ? 'bg-orange-500 shadow-[0_0_8px_#f27d26]' : 'bg-white/20'}`} />
                <span className="text-xs text-white/70 font-sans">
                  {selectedTimelineType === activeType 
                    ? "Vibe locked in. You are following this plan." 
                    : "Lock in this plan and show it on your dashboard."}
                </span>
              </div>
              <button
                onClick={() => onLockIn(activeType)}
                disabled={selectedTimelineType === activeType}
                className={`w-full sm:w-auto px-5 py-2 rounded-lg font-sans text-xs font-bold tracking-wide transition-all ${
                  selectedTimelineType === activeType
                    ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/10"
                    : "bg-white text-black hover:bg-white/90 cursor-pointer active:scale-95 shadow"
                }`}
              >
                {selectedTimelineType === activeType ? "LOCKED IN" : "LOCK IN THIS PLAN"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
