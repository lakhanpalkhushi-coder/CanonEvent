import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChronoDiagnostics, MicroMission } from '../types';
import { 
  Radio, ShieldAlert, Skull, Play, Pause, Calendar, 
  ListTodo, CheckCircle, TrendingUp, Compass, Volume2, 
  Terminal, Search, Download, AlertTriangle, Cpu, HelpCircle, Sparkles,
  ExternalLink, Copy, Check, Flame, ArrowRight
} from 'lucide-react';

interface ChronoDiagnosticsRoomProps {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  taskDeadline: string;
  taskProgress: number;
  onAddMissions: (newMissions: Omit<MicroMission, 'id' | 'taskId'>[]) => void;
}

export default function ChronoDiagnosticsRoom({
  taskId,
  taskTitle,
  taskDescription,
  taskDeadline,
  taskProgress,
  onAddMissions
}: ChronoDiagnosticsRoomProps) {
  const [activeEngine, setActiveEngine] = useState<
    'transmission' | 'prediction' | 'multiverse' | 'observer' | 'replay' | 'recovery' | 'audio' | 'stage' | 'coaching'
  >('transmission');

  const [diagnostics, setDiagnostics] = useState<ChronoDiagnostics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduledSessions, setScheduledSessions] = useState<{ date: string; time: string }[]>([]);
  const [subdividing, setSubdividing] = useState(false);
  const [subdivisionSuccess, setSubdivisionSuccess] = useState(false);

  // Auto-dismiss subdivision toast
  useEffect(() => {
    if (subdivisionSuccess) {
      const timer = setTimeout(() => setSubdivisionSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [subdivisionSuccess]);

  // Fetch diagnostics whenever active task details change or on manual load
  const loadDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    setDiagnostics(null);
    try {
      const response = await fetch('/api/temporal/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          deadline: taskDeadline,
          progress: taskProgress
        })
      });
      if (!response.ok) {
        throw new Error(`Server responded with HTTP status ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setDiagnostics(data);
    } catch (err: any) {
      console.error("Error loading diagnostics:", err);
      setError(err.message || "Failed to establish temporal contact with your future timeline.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadDiagnostics();
    }
    // Reset audio state when task changes
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, [taskId]);

  // Audio link controls
  const handlePlayAudio = () => {
    if (!diagnostics?.spokenMessage?.text) return;

    if (isPlayingAudio) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(diagnostics.spokenMessage.text);
      utterance.rate = 0.95; // Slightly slower, more emotional
      utterance.pitch = 0.85; // Slightly deeper, tense future self voice
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };
      setSpeechUtterance(utterance);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback visual simulation for unsupported browsers
      setIsPlayingAudio(true);
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 6000);
    }
  };

  // Generate and download standard .ics calendar file
  const handleDownloadICS = () => {
    if (!scheduleDate) return;

    const eventDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
    const startStr = eventDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDateTime = new Date(eventDateTime.getTime() + 60 * 60 * 1000); // 1 hour focus
    const endStr = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Lock In: ${taskTitle}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `DESCRIPTION:Proactive preventative work session scheduled by Canon Event Timeline Recovery AI to prevent trajectory collapse.`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chrono_lock_session.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setScheduledSessions(prev => [...prev, { date: scheduleDate, time: scheduleTime }]);
    setIsScheduling(false);
  };

  // Subdivide the immediate next step into new micro-missions
  const handleSubdivideIntervention = async () => {
    if (!diagnostics?.recoveryPlan?.next15Minutes) return;
    setSubdividing(true);
    try {
      // We parse the recovery recommendations into ready-to-use micro-tasks
      const newMissions = [
        ...diagnostics.recoveryPlan.next15Minutes.map(title => ({
          title: `[Emergency 15m] ${title}`,
          difficulty: 'Easy' as const,
          estimatedMinutes: 15
        })),
        ...diagnostics.recoveryPlan.next60Minutes.map(title => ({
          title: `[Focus 60m] ${title}`,
          difficulty: 'Medium' as const,
          estimatedMinutes: 60
        }))
      ];
      onAddMissions(newMissions);
      setSubdivisionSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubdividing(false);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[480px]">
        <div className="relative w-20 h-20">
          {/* Pulsing temporal rings */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-orange-500/20"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/30"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-4 rounded-full border-t-2 border-orange-500 flex items-center justify-center bg-black/60"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <Radio className="text-orange-500 animate-pulse" size={20} />
          </motion.div>
        </div>
        <p className="mt-8 text-lg font-serif italic text-white text-center">Checking your future vibes...</p>
        <p className="text-xs text-white/40 font-mono text-center mt-2 max-w-sm leading-relaxed">
          Predicting where you might get stuck, reading your habits, and cooking up alternate pathways...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 border border-red-500/20 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-rose-400 mb-2 animate-pulse" size={36} />
        <p className="text-white/80 font-medium font-serif italic text-base">Temporal Link Disrupted</p>
        <p className="text-xs text-white/40 max-w-md mx-auto mt-1 leading-relaxed">
          {error}. The diagnostic system failed to bridge communications with your future self. Click calibration to retry.
        </p>
        <button
          onClick={loadDiagnostics}
          className="mt-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer"
        >
          Retry Neural Sync
        </button>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <Cpu className="text-white/20 mb-4" size={36} />
        <p className="text-white/60 font-medium font-serif italic text-base">Select an Active Project timeline</p>
        <p className="text-xs text-white/30 max-w-xs mx-auto mt-2 leading-relaxed">
          Once a goal is tracked, the temporal diagnostic array is launched to analyze decision chain sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* 1. Left Nav list of the 9 diagnostic models (4 spans) */}
      <div className="xl:col-span-4 bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-fit gap-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-4">
            <Cpu className="text-orange-500 animate-pulse" size={18} />
            <div>
              <h3 className="font-sans font-bold text-sm text-white">Vibe Analyzer</h3>
              <span className="text-[9px] font-mono text-white/40 block">9 Future Forecasts</span>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { id: 'transmission', label: 'Future Self DM', desc: 'Direct message from future you', icon: Radio },
              { id: 'prediction', label: 'Where I Fumble', desc: "The exact moment you'll panic", icon: Skull },
              { id: 'multiverse', label: 'Timeline Side-by-Side', desc: 'Comparing three alternate paths', icon: Compass },
              { id: 'observer', label: 'Reality Check', desc: 'Outside view of what holds you back', icon: Search },
              { id: 'replay', label: 'Procrastination Log', desc: 'How tiny delays add up fast', icon: ListTodo },
              { id: 'recovery', label: 'Emergency Plan', desc: 'Immediate steps to get back on track', icon: TrendingUp },
              { id: 'audio', label: 'Voice Note From Me', desc: 'Audio warning from future self', icon: Volume2 },
              { id: 'stage', label: 'Timeline Progress', desc: 'Success probability tracker', icon: Terminal },
              { id: 'coaching', label: 'Vibe Coach Advice', desc: 'Real advice on coping with stress', icon: Sparkles },
            ].map((engine) => {
              const Icon = engine.icon;
              const isSelected = activeEngine === engine.id;
              return (
                <button
                  key={engine.id}
                  onClick={() => setActiveEngine(engine.id as any)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl font-sans text-left transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-white text-black border-white shadow-lg"
                      : "border-transparent text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} className={`mt-0.5 shrink-0 ${isSelected ? "text-black" : "text-orange-500"}`} />
                  <div>
                    <h4 className="text-xs font-bold leading-none">{engine.label}</h4>
                    <span className={`text-[10px] block mt-1 leading-tight ${isSelected ? "text-black/60" : "text-white/40"}`}>
                      {engine.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preventative Action Quick Trigger Panel */}
        <div className="border-t border-white/10 pt-4 mt-2">
          <span className="text-[9px] font-mono text-orange-500 uppercase font-black block tracking-wider mb-2">
            Action Panel
          </span>
          <div className="space-y-2">
            <button
              onClick={() => setIsScheduling(true)}
              className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl font-sans text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Calendar size={13} />
              Put It On My Calendar
            </button>
            <button
              onClick={handleSubdivideIntervention}
              disabled={subdividing}
              className="w-full py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/30 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Flame size={13} className="animate-pulse" />
              Break Into Mini Steps
            </button>
          </div>
        </div>
      </div>

      {/* 2. Right Workspace displaying active diagnostic outcome (8 spans) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Dynamic Display Board */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
          
          <AnimatePresence>
            {subdivisionSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-4 left-4 right-4 z-10 bg-emerald-950 border border-emerald-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-3"
              >
                <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-snug">Trajectories Calibrated! 🙌</p>
                  <p className="text-[10px] text-emerald-400/85 leading-snug">Emergency micro-missions have been injected into your lock-in checklist.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEngine}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 flex-1"
            >
              
              {/* PERSPECTIVE 1: FUTURE SELF TRANSMISSION */}
              {activeEngine === 'transmission' && (
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-black">
                        ID: {diagnostics.futureSelfTransmission.timelineId}
                      </span>
                      <h3 className="font-serif italic text-2xl text-white mt-1">Transmission from Alternate Coordinates</h3>
                    </div>
                    <span className="text-[9px] font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded border border-white/10 uppercase font-bold">
                      Date: {diagnostics.futureSelfTransmission.currentDate}
                    </span>
                  </div>

                  {/* Retro Letter Container */}
                  <div className="bg-black/40 border-l-2 border-orange-500 p-5 rounded-r-xl italic text-xs leading-relaxed text-white/80 whitespace-pre-line relative">
                    <span className="absolute -top-3 left-4 bg-[#050505] px-2 text-[9px] text-white/40 font-mono uppercase">
                      Incoming Quantum Feed
                    </span>
                    "{diagnostics.futureSelfTransmission.transmission}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">The Catalyst Mistake</span>
                      <p className="text-xs font-semibold text-white/90 mt-1">{diagnostics.futureSelfTransmission.mistake}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Chrono-Emotional Residue</span>
                      <p className="text-xs text-white/70 mt-1">{diagnostics.futureSelfTransmission.feeling}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 text-emerald-400">
                    <span className="text-[9px] font-mono uppercase tracking-wider block font-bold">What Can Still Be Changed Today:</span>
                    <p className="text-xs mt-1 leading-relaxed text-white/80">{diagnostics.futureSelfTransmission.changeable}</p>
                  </div>

                  <p className="text-xs font-mono font-black text-red-500 bg-red-950/10 border border-red-900/20 p-3 rounded-lg text-center">
                    ⚠️ CRITICAL: {diagnostics.futureSelfTransmission.warning}
                  </p>
                </div>
              )}

              {/* PERSPECTIVE 2: TEMPORAL FAILURE PREDICTION */}
              {activeEngine === 'prediction' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest font-black">
                      TRAJECTORY DECAY EVALUATION
                    </span>
                    <h3 className="font-serif italic text-2xl text-white mt-1">The Projected Canon Event</h3>
                  </div>

                  {/* High level info block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-5">
                      <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider block font-bold">Inescapable Node Name:</span>
                      <p className="font-serif italic text-lg text-white mt-1">{diagnostics.failurePrediction.canonEventName}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">Point of No Return:</span>
                      <p className="font-mono text-sm font-bold text-white mt-1">{diagnostics.failurePrediction.pointOfNoReturn}</p>
                    </div>
                  </div>

                  {/* Decision Chain sequence */}
                  <div>
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-3">Predicted Chain of Decisions:</h4>
                    <div className="space-y-2 pl-4 border-l border-rose-500/30">
                      {diagnostics.failurePrediction.chainOfDecisions.map((decision, idx) => (
                        <div key={idx} className="relative py-0.5">
                          <div className="absolute -left-[21px] top-2 w-2 h-2 rounded-full bg-rose-500" />
                          <p className="text-xs text-white/80 leading-relaxed font-medium">
                            <span className="font-mono text-rose-400 mr-2">[{idx + 1}]</span>
                            {decision}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consequences grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Temporal Decenteredness</span>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">{diagnostics.failurePrediction.temporalConsequences}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Emotional Degradation</span>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">{diagnostics.failurePrediction.emotionalConsequences}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Project Deliverable Fate</span>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">{diagnostics.failurePrediction.projectConsequences}</p>
                    </div>
                  </div>

                  {/* Probability Meter */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-xs text-white/60">Survival Rate Post-Canon Event:</span>
                    <span className="font-mono text-base font-black text-rose-400">
                      {diagnostics.failurePrediction.successProbabilityAfterEvent}%
                    </span>
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 3: MULTIVERSE PROJECTION */}
              {activeEngine === 'multiverse' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-black">
                      QUANTUM DIVERGENT VIEWS
                    </span>
                    <h3 className="font-serif italic text-2xl text-white mt-1">Three Compounding Futures</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Sacred Path */}
                    <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-900/20 pb-2">
                        <span className="text-xs font-bold text-emerald-400">Timeline A: The Sacred Path</span>
                        <span className="text-[10px] font-mono bg-emerald-950/40 px-2 py-0.5 rounded text-emerald-300 border border-emerald-900/30">
                          95% Success Chance
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        <b>Key Behavior:</b> Structured increments. Commencing development immediately, testing modular blocks as they are written.
                      </p>
                      <div className="text-[11px] italic text-emerald-300">
                        Future Self: "We slept 8 hours, submitted the deck early, and won the jury's heart."
                      </div>
                    </div>

                    {/* Nexus Shift */}
                    <div className="bg-amber-950/10 border border-amber-900/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                        <span className="text-xs font-bold text-amber-400">Timeline B: Nexus Shift</span>
                        <span className="text-[10px] font-mono bg-amber-950/40 px-2 py-0.5 rounded text-amber-300 border border-amber-900/30">
                          60% Success Chance
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        <b>Key Behavior:</b> Stalling on social channels for 48 hours. Coding in a single massive caffeine sitting midway.
                      </p>
                      <div className="text-[11px] italic text-amber-300">
                        Future Self: "The app works, but we couldn't align the icons or test the edge-case inputs."
                      </div>
                    </div>

                    {/* Canon Event */}
                    <div className="bg-rose-950/15 border border-rose-900/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-rose-900/20 pb-2">
                        <span className="text-xs font-bold text-rose-400">Timeline C: Absolute Canon Event</span>
                        <span className="text-[10px] font-mono bg-rose-950/40 px-2 py-0.5 rounded text-rose-300 border border-rose-900/30">
                          15% Success Chance
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        <b>Key Behavior:</b> Deadline paralysis. Re-organizing folders and bookmarks instead of shipping server endpoints until the final 12 hours.
                      </p>
                      <div className="text-[11px] italic text-rose-300">
                        Future Self: "The submission page closed while Vite was still throwing missing-import errors."
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 4: OBSERVER REPORT UNIT O-17 */}
              {activeEngine === 'observer' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                        CLASSIFIED REPORT // UNIT O-17
                      </span>
                      <h3 className="font-serif italic text-2xl text-white mt-1">Temporal Stability Observation</h3>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/20 px-2.5 py-0.5 rounded border border-rose-900/30 uppercase font-black animate-pulse">
                      Cold Diagnostic
                    </span>
                  </div>

                  <div className="bg-black border border-white/10 rounded-xl p-5 font-mono text-[11px] text-emerald-400 space-y-3 shadow-inner h-[280px] overflow-y-auto">
                    <div>
                      <span className="text-white/40 block border-b border-white/10 pb-0.5 mb-1">[OBSERVED BEHAVIOR]</span>
                      <p className="text-emerald-300 leading-relaxed">{diagnostics.observerReport.observedBehavior}</p>
                    </div>

                    <div>
                      <span className="text-white/40 block border-b border-white/10 pb-0.5 mb-1">[TIMELINE DRIFT MATRIX]</span>
                      <p className="text-yellow-400 leading-relaxed">{diagnostics.observerReport.timelineDrift}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-white/40 block border-b border-white/10 pb-0.5 mb-1">[RISK INDICATORS]</span>
                        <ul className="list-disc pl-4 space-y-1 text-rose-400">
                          {diagnostics.observerReport.riskIndicators.map((ri, i) => <li key={i}>{ri}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="text-white/40 block border-b border-white/10 pb-0.5 mb-1">[FAILURE MODES]</span>
                        <ul className="list-disc pl-4 space-y-1 text-orange-400">
                          {diagnostics.observerReport.predictedFailureModes.map((fm, i) => <li key={i}>{fm}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/40 block border-b border-white/10 pb-0.5 mb-1">[BEHAVIORAL ANOMALIES]</span>
                      <ul className="list-disc pl-4 space-y-1 text-emerald-300">
                        {diagnostics.observerReport.anomalies.map((an, i) => <li key={i}>{an}</li>)}
                      </ul>
                    </div>

                    <div className="border-t border-emerald-950 pt-2 text-white font-sans mt-3">
                      <span className="text-[10px] font-mono text-emerald-500 block">[RECOMMENDED STRATEGIC INTERVENTION]</span>
                      <p className="text-xs text-white/80 mt-1 italic">{diagnostics.observerReport.recommendedIntervention}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 5: CHRONO REPLAY LOG */}
              {activeEngine === 'replay' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-black">
                      TEMPORAL FLOW SEQUENCER
                    </span>
                    <h3 className="font-serif italic text-2xl text-white mt-1">Replay of Compounding Decisions</h3>
                    <p className="text-xs text-white/40 mt-1">How seemingly harmless choices snowball into project disaster:</p>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {diagnostics.replayLog.map((log, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                          <span className="font-mono text-xs text-orange-400 font-bold">{log.day}</span>
                          <span className="text-[9px] font-mono text-white/30 uppercase">Sequence #{idx + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/90">
                            <span className="text-white/40 font-mono">Decision:</span> {log.decisionTaken}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                            <div className="text-yellow-400">
                              <span className="text-white/30 font-mono block">Immediate Effect:</span>
                              {log.immediateEffect}
                            </div>
                            <div className="text-rose-400">
                              <span className="text-white/30 font-mono block">Hidden Threat:</span>
                              {log.hiddenConsequence}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 6: RECOVERY MISSION PLAN */}
              {activeEngine === 'recovery' && (
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-black">
                        EMERGENCY MISSION CONTROL
                      </span>
                      <h3 className="font-serif italic text-2xl text-white mt-1">Timeline Recovery Critical Path</h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-mono text-white/40">Recovery Vector:</span>
                      <span className="font-mono text-base font-black text-emerald-400">
                        +{diagnostics.recoveryPlan.successProbabilityAfterIntervention}%
                      </span>
                    </div>
                  </div>

                  {/* Critical Path Header */}
                  <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block tracking-wider mb-2">
                      Core Strategic Directive:
                    </span>
                    <ul className="space-y-1.5">
                      {diagnostics.recoveryPlan.criticalPath.map((path, i) => (
                        <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                          <span>{path}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Staggered Immediate Action Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    
                    {/* Next 15 mins */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-rose-400">
                        <Flame size={12} className="animate-bounce" />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Next 15 Minutes</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {diagnostics.recoveryPlan.next15Minutes.map((act, i) => (
                          <li key={i} className="text-white/80 leading-relaxed flex gap-1.5">
                            <span className="text-rose-500 font-mono">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next 60 mins */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-amber-400">
                        <Cpu size={12} />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Next 60 Minutes</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {diagnostics.recoveryPlan.next60Minutes.map((act, i) => (
                          <li key={i} className="text-white/80 leading-relaxed flex gap-1.5">
                            <span className="text-amber-500 font-mono">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next 24 Hours */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-emerald-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Next 24 Hours</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {diagnostics.recoveryPlan.next24Hours.map((act, i) => (
                          <li key={i} className="text-white/80 leading-relaxed flex gap-1.5">
                            <span className="text-emerald-500 font-mono">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Tasks to eliminate */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider font-black block mb-2">
                      ❌ DE-PRIORITIZE IMMEDIATELY (Do not touch these):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {diagnostics.recoveryPlan.nonEssentialTasks.map((task, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white/5 text-white/50 border border-white/10 px-2 py-1 rounded">
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 7: SPOKEN MESSAGE INTERACTIVE */}
              {activeEngine === 'audio' && (
                <div className="space-y-6 flex flex-col justify-between h-full">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-black">
                      QUANTUM AUDIO LINK // ENCRYPTED FEED
                    </span>
                    <h3 className="font-serif italic text-2xl text-white mt-1">Direct spoken message warning</h3>
                  </div>

                  {/* Transceiver animation wave */}
                  <div className="flex flex-col items-center justify-center py-6 bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden min-h-[160px]">
                    
                    {/* Glowing circular waves */}
                    <AnimatePresence>
                      {isPlayingAudio && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <motion.div 
                            className="absolute w-32 h-32 rounded-full border border-orange-500/20"
                            animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                          <motion.div 
                            className="absolute w-32 h-32 rounded-full border border-orange-500/10 animate-ping"
                          />
                        </div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handlePlayAudio}
                      className="relative p-6 bg-white text-black hover:bg-white/90 rounded-full cursor-pointer transition-all active:scale-95 shadow-xl z-10"
                    >
                      {isPlayingAudio ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    <p className="text-[10px] font-mono text-white/40 mt-4 uppercase tracking-widest">
                      {isPlayingAudio ? "TUNING quantum audio links..." : "Click to establish audio link transceiver"}
                    </p>
                  </div>

                  {/* Text representation */}
                  <div className="text-center italic font-serif text-white/90 text-sm max-w-lg mx-auto leading-relaxed border-t border-white/10 pt-4">
                    "{diagnostics.spokenMessage.text}"
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 8: CANON CORE STAGE DEMONSTRATION */}
              {activeEngine === 'stage' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-black">
                        CANON CORE MODULE
                      </span>
                      <h3 className="font-serif italic text-2xl text-white mt-1">Cinematic Trajectory Assessment</h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2.5 py-0.5 rounded border border-emerald-900/30">
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Current Trajectory:</span>
                      <p className="text-xs font-semibold text-white/90 mt-1 leading-relaxed">{diagnostics.canonCore.currentTrajectory}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-white/40 uppercase block">Timeline Stability:</span>
                        <p className="text-sm font-bold text-white mt-0.5">Barrier Factor</p>
                      </div>
                      <span className="font-mono text-2xl font-black text-white bg-white/5 px-3 py-1 rounded border border-white/10">
                        {diagnostics.canonCore.timelineStability}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-5">
                    <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">Primary Timeline Threat:</span>
                    <p className="text-xs font-semibold text-white/90 mt-1">{diagnostics.canonCore.primaryThreat}</p>
                  </div>

                  <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-5">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">Projected Absolute Canon Event:</span>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">{diagnostics.canonCore.projectedCanonEvent}</p>
                  </div>

                  {/* Warning overlay box */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs italic text-center text-white/70">
                    "Warning: {diagnostics.canonCore.futureSelfWarning}"
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                    <span className="text-white/60">Quantum Alignment Recovery Probability:</span>
                    <span className="font-mono font-black text-emerald-400">{diagnostics.canonCore.recoveryProbability}%</span>
                  </div>
                </div>
              )}

              {/* PERSPECTIVE 9: EMPATHETIC COACH PANEL */}
              {activeEngine === 'coaching' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-black">
                      AI BEHAVIORAL COALITION
                    </span>
                    <h3 className="font-serif italic text-2xl text-white mt-1">Quantum Coaching Terminal</h3>
                    <p className="text-xs text-white/40 mt-1">A mindful mirror exploring cognitive blocks and triggers:</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider block">
                      Identified Procrastination Triggers:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {diagnostics.coachingAdvice.procrastinationTriggers.map((trig, i) => (
                        <span key={i} className="text-xs font-sans bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
                          {trig}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <span className="text-[9px] font-mono text-white/40 uppercase block">Empathetic Cognitive Mirror</span>
                    <p className="text-xs text-white/80 leading-relaxed mt-1 whitespace-pre-line">
                      {diagnostics.coachingAdvice.personalizedAdvice}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Actionable Tips</span>
                      <ul className="list-disc pl-4 space-y-1.5 mt-2 text-xs text-white/70">
                        {diagnostics.coachingAdvice.actionableTips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                    <div className="bg-emerald-950/15 border border-emerald-900/30 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-emerald-400 uppercase font-black block">Quantum Support Link</span>
                        <p className="text-xs text-white/80 leading-relaxed mt-2 italic">
                          "{diagnostics.coachingAdvice.motivationalMessage}"
                        </p>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-500 block text-right mt-3">COACH DISPATCH // ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Quick Refetch Button */}
          <div className="border-t border-white/10 pt-4 mt-6 flex justify-between items-center text-xs text-white/40 font-mono">
            <span>COGNITION RATIO: SECURE (100%)</span>
            <button
              onClick={loadDiagnostics}
              className="text-orange-500 hover:text-orange-400 transition-colors font-bold uppercase cursor-pointer"
            >
              🔄 Re-calibrate Probe
            </button>
          </div>
        </div>

        {/* 3. Proactive Intervention & Salvaged Resources Station */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Preventative Action Station: Focus Block Scheduler */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Calendar className="text-orange-500" size={16} />
                <h4 className="font-serif italic text-base text-white">Chrono-Lock Focus Planner</h4>
              </div>

              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Schedule an immediate focused session in your standard calendar. We generate and export a custom standard <span className="font-bold text-white">.ics file</span> containing instructions and cognitive cues to conquer procrastination freeze.
              </p>

              {isScheduling ? (
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase block mb-1">Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setIsScheduling(false)}
                      className="px-3 py-1.5 bg-white/5 text-white/60 hover:bg-white/10 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDownloadICS}
                      disabled={!scheduleDate}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50"
                    >
                      Download .ICS
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setScheduleDate(new Date().toISOString().split('T')[0]);
                    setIsScheduling(true);
                  }}
                  className="w-full py-2.5 bg-white text-black font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Download size={13} />
                  BOOK BLOCK & DOWNLOAD ICS
                </button>
              )}
            </div>

            {/* List of scheduled sessions */}
            {scheduledSessions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Active Chrono-Locks:</span>
                <div className="space-y-1.5 mt-2">
                  {scheduledSessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between bg-emerald-950/15 border border-emerald-900/40 rounded-lg p-2 text-xs text-emerald-400">
                      <span className="font-mono">Lock #{i + 1}: {session.date} @ {session.time}</span>
                      <span className="text-[10px] uppercase font-bold">Scheduled</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Salvaged Technical Resources */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Compass className="text-orange-500" size={16} />
                <h4 className="font-serif italic text-base text-white">Salvaged Learning Resources</h4>
              </div>

              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Gemini evaluated your task constraints and harvested these standard references to bypass procrastination friction:
              </p>

              <div className="space-y-3">
                {diagnostics.salvagedResources.map((res, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 hover:border-white/10 p-3 rounded-xl transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans font-bold text-xs text-white line-clamp-1">{res.title}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyText(res.url, idx)}
                          className="p-1 text-white/40 hover:text-white transition-colors"
                          title="Copy Link URL"
                        >
                          {copiedIndex === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <a
                          href={res.url}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="p-1 text-white/40 hover:text-white transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed mt-1">{res.description}</p>
                    <span className="text-[9px] font-mono text-orange-400/80 block mt-1">Value: {res.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
