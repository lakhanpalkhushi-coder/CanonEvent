import { motion, AnimatePresence } from 'motion/react';
import { MicroMission } from '../types';
import { ShieldCheck, Crosshair, Plus, CheckCircle2, Circle, Clock, Flame } from 'lucide-react';

interface LockInPlannerProps {
  missions: MicroMission[];
  isLoading: boolean;
  onToggleMission: (id: string) => void;
  activeTaskTitle: string;
}

export default function LockInPlanner({ missions, isLoading, onToggleMission, activeTaskTitle }: LockInPlannerProps) {
  const completedCount = missions.filter(m => m.completed).length;
  const progressPercent = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated laser scan line */}
        <motion.div 
          className="absolute left-0 right-0 h-0.5 bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
        />
        <div className="relative p-3 bg-white/5 border border-white/10 rounded-xl mb-3">
          <Crosshair className="text-white animate-spin" size={20} />
        </div>
        <p className="font-serif italic text-base text-white">Breaking tasks down...</p>
        <p className="text-[11px] text-white/40 font-mono mt-1 text-center max-w-xs">
          Cooking up easy steps to get you focused and keep you moving.
        </p>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-[300px] flex flex-col items-center justify-center text-center">
        <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl mb-3 text-white/40 shrink-0">
          <Flame size={20} />
        </div>
        <h3 className="font-serif italic text-base text-white">Plan is empty</h3>
        <p className="text-xs text-white/40 max-w-xs mt-1.5 leading-relaxed">
          Ready to lock in? Select a path forecast above and click <span className="text-white font-bold">Lock In This Plan</span> to turn your project into small, easy steps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col shadow-2xl">
      {/* Header with Title and Overall Progress */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2.5 mb-2.5">
        <div>
          <span className="text-[8px] font-mono text-orange-500 font-bold uppercase tracking-wider block">Target Locked</span>
          <h3 className="font-serif italic text-base text-white line-clamp-1">{activeTaskTitle}</h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[9px] font-mono text-white/40">Progress:</span>
          <span className="font-mono text-sm font-bold text-white">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-3 border border-white/10">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Sub-header instruction */}
      <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2 mb-3">
        <Flame className="text-orange-500 animate-pulse" size={12} />
        <p className="text-[9px] font-mono text-white/60">
          One step at a time, you've got this.
        </p>
      </div>

      {/* Missions list */}
      <div className="space-y-2 overflow-y-auto flex-1 max-h-[180px] pr-1">
        <AnimatePresence initial={false}>
          {missions.map((mission, index) => {
            let difficultyColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            if (mission.difficulty === "Medium") {
              difficultyColor = "bg-orange-500/10 text-orange-400 border-orange-500/20";
            } else if (mission.difficulty === "Hard") {
              difficultyColor = "bg-red-500/10 text-red-400 border-red-500/20";
            }

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onToggleMission(mission.id)}
                className={`group flex items-start gap-3 p-2 border rounded-lg cursor-pointer select-none transition-all ${
                  mission.completed
                    ? "bg-white/[0.01] border-white/5 text-white/40 opacity-60"
                    : "bg-white/[0.03] border-white/10 hover:bg-white/5 hover:border-white/20 text-white/90"
                }`}
              >
                {/* Custom Checkbox */}
                <button className="mt-0.5 shrink-0 transition-transform active:scale-90">
                  {mission.completed ? (
                    <CheckCircle2 className="text-emerald-500" size={14} />
                  ) : (
                    <Circle className="text-white/30 group-hover:text-white/60 transition-colors" size={14} />
                  )}
                </button>

                {/* Mission info */}
                <div className="flex-1">
                  <p className={`text-xs font-medium leading-normal transition-all ${mission.completed ? "line-through text-white/30" : ""}`}>
                    {mission.title}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {/* Difficulty tag */}
                    <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded border uppercase ${difficultyColor}`}>
                      {mission.difficulty || "Easy"}
                    </span>

                    {/* Time estimate */}
                    <span className="flex items-center gap-1 text-[8px] font-mono text-white/40">
                      <Clock size={8} />
                      {mission.estimatedMinutes || 15}m
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Completion footer banner */}
      {progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl flex items-center gap-2.5"
        >
          <ShieldCheck className="shrink-0 text-white" size={16} />
          <div className="text-xs">
            <span className="font-serif italic font-bold block text-white">Fully Locked In! 🎉</span>
            <span className="opacity-60 text-[10px]">You beat the procrastination freeze. Keep up the high energy!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
