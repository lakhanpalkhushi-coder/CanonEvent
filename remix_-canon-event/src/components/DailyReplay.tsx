import { motion } from 'motion/react';
import { DailyReflection } from '../types';
import { Terminal, Shield, AlertTriangle, Play, RefreshCw, Cpu, BrainCircuit } from 'lucide-react';

interface DailyReplayProps {
  reflection: DailyReflection | null;
  isLoading: boolean;
  onTriggerReflection: () => void;
  canReflect: boolean;
}

export default function DailyReplay({ reflection, isLoading, onTriggerReflection, canReflect }: DailyReplayProps) {
  let indexColor = "text-emerald-400 border-emerald-500/20";
  let ringColor = "#10b981";
  let driftStatus = "PERFECT (VIBE IN CHECK)";

  if (reflection) {
    if (reflection.procrastinationIndex > 30 && reflection.procrastinationIndex <= 70) {
      indexColor = "text-amber-400 border-amber-500/20";
      ringColor = "#f59e0b";
      driftStatus = "WARNING (SLIPPING AWAY)";
    } else if (reflection.procrastinationIndex > 70) {
      indexColor = "text-rose-400 border-rose-500/20";
      ringColor = "#f43f5e";
      driftStatus = "CRITICAL (FUMBLING HARD)";
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col justify-between">
      <div>
        {/* Title and Icon */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Terminal className="text-white" size={16} />
            <h3 className="font-serif italic text-base text-white">Habit Replay Mirror</h3>
          </div>
          <span className="text-[8px] font-mono text-white/60 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
            COACH FEED ONLINE
          </span>
        </div>

        {/* Not loaded state */}
        {!reflection && !isLoading && (
          <div className="text-center py-4">
            <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 mb-3 animate-pulse">
              <BrainCircuit size={22} />
            </div>
            <h4 className="font-serif italic text-base text-white">Run Procrastination Replay</h4>
            <p className="text-xs text-white/40 max-w-sm mx-auto mt-1 leading-relaxed">
              Analyze your current checklist progress and get a personalized, honest habit feedback report.
            </p>
            <button
              onClick={onTriggerReflection}
              disabled={!canReflect}
              className={`mt-4 px-4 py-2 rounded-lg font-sans text-xs font-bold tracking-wide flex items-center gap-1.5 mx-auto transition-all ${
                canReflect
                  ? "bg-white text-black hover:bg-white/90 cursor-pointer shadow active:scale-95"
                  : "bg-white/5 text-white/40 cursor-not-allowed border border-white/10"
              }`}
            >
              <Play size={10} />
              SCORE MY DAY
            </button>
            {!canReflect && (
              <p className="text-[8px] font-mono text-white/30 mt-1.5">
                Add a task or step to get started.
              </p>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="text-white animate-spin mb-3" size={20} />
            <p className="text-xs font-mono text-white/60 animate-pulse">CALCULATING VIBES...</p>
            <div className="w-full max-w-[200px] bg-white/10 h-1 rounded-full overflow-hidden mt-2">
              <motion.div 
                className="h-full bg-white"
                animate={{ width: ['0%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* Loaded Reflection Log */}
        {reflection && !isLoading && (
          <div className="space-y-3">
            {/* Index Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 md:p-2.5">
                <span className="text-[8px] font-mono text-white/40 uppercase block">Procrastination Level</span>
                <span className={`text-base font-mono font-black ${indexColor}`}>{reflection.procrastinationIndex}%</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 md:p-2.5">
                <span className="text-[8px] font-mono text-white/40 uppercase block">Focus Vibe Status</span>
                <span className="text-[9px] font-mono font-bold text-white/80 block leading-tight mt-0.5 truncate">
                  {driftStatus}
                </span>
              </div>
            </div>

            {/* Retro terminal output */}
            <div className="relative bg-black border border-white/10 rounded-xl p-2.5 font-mono text-xs text-emerald-400 overflow-hidden shadow-inner h-[110px] flex flex-col justify-between">
              {/* Scanline CRT overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40" />
              
              <div className="overflow-y-auto flex-1 pr-1 space-y-1">
                <div className="flex items-center gap-1 border-b border-emerald-950 pb-0.5 text-[9px] text-emerald-500/80 font-bold">
                  <Cpu size={10} />
                  HONEST HABIT FEEDBACK
                </div>
                <p className="leading-relaxed text-emerald-300/90 whitespace-pre-line text-[10.5px]">{reflection.futureSelfLog}</p>
              </div>
            </div>

            {/* Actionable psychological hack tip */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-white/90 flex gap-2">
              <Shield className="shrink-0 text-white mt-0.5" size={14} />
              <div>
                <span className="text-[8px] font-mono text-white/40 font-bold block uppercase tracking-wider">Actionable Hack to Fix This</span>
                <p className="text-xs mt-0.5 leading-snug text-white/80">{reflection.actionableTip}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls if reflection loaded */}
      {reflection && !isLoading && (
        <button
          onClick={onTriggerReflection}
          className="mt-2.5 w-full py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-sans text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <RefreshCw size={10} />
          REFRESH MY SCORECARD
        </button>
      )}
    </div>
  );
}
