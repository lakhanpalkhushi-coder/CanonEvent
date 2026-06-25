import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Timeline, MicroMission, DailyReflection, UserProfile } from './types';
import TimelineSimulator from './components/TimelineSimulator';
import LockInPlanner from './components/LockInPlanner';
import DailyReplay from './components/DailyReplay';
import JudgeRoom from './components/JudgeRoom';
import ChronoDiagnosticsRoom from './components/ChronoDiagnosticsRoom';
import ChronoAuth from './components/ChronoAuth';
import UserProfileSettings, { AnimatedAvatar } from './components/UserProfileSettings';
import { 
  Plus, ListTodo, Activity, Clock, Award, ShieldAlert, 
  HelpCircle, Trash2, Calendar, FileText, CheckSquare, Sparkles, AlertOctagon, Radio, ArrowRight, User
} from 'lucide-react';

export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebratedTaskTitle, setCelebratedTaskTitle] = useState<string>('');

  // Always force logout on initial mount/open
  useEffect(() => {
    sessionStorage.removeItem('chrono_authenticated');
    localStorage.removeItem('chrono_authenticated');
  }, []);

  // Auto dismiss temporal celebration
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'pitch' | 'diagnostics' | 'profile'>('dashboard');

  
  // Tasks list state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('canon_tasks');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Selected task state
  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    return tasks[0]?.id || '';
  });

  // Timelines list state
  const [timelines, setTimelines] = useState<Timeline[]>(() => {
    const saved = localStorage.getItem('canon_timelines');
    return saved ? JSON.parse(saved) : [];
  });

  // Micro missions state
  const [missions, setMissions] = useState<MicroMission[]>(() => {
    const saved = localStorage.getItem('canon_missions');
    return saved ? JSON.parse(saved) : [];
  });

  // Daily reflections history
  const [reflections, setReflections] = useState<DailyReflection[]>(() => {
    const saved = localStorage.getItem('canon_reflections');
    return saved ? JSON.parse(saved) : [];
  });

  // Form input states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskProgress, setNewTaskProgress] = useState(0);

  // Loader states
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLockingIn, setIsLockingIn] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);

  // Selected locked timeline tracker
  const [lockedTimelineType, setLockedTimelineType] = useState<'A' | 'B' | 'C' | null>(() => {
    const saved = localStorage.getItem('canon_locked_timeline_type');
    return saved ? (saved as 'A' | 'B' | 'C') : null;
  });

  // User Profile state
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('chrono_user_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Khushi Lakhanpal',
      codename: 'Agent_Chrono_Alpha',
      motto: 'Locked in, no cap. 🔒',
      era: 'Graduation Class of 2027 🎓',
      avatarId: 'temporal_core'
    };
  });

  // Save profile to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('chrono_user_profile', JSON.stringify(profile));
  }, [profile]);

  // Save states to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('canon_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('canon_timelines', JSON.stringify(timelines));
  }, [timelines]);

  useEffect(() => {
    localStorage.setItem('canon_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('canon_reflections', JSON.stringify(reflections));
  }, [reflections]);

  useEffect(() => {
    if (lockedTimelineType) {
      localStorage.setItem('canon_locked_timeline_type', lockedTimelineType);
    } else {
      localStorage.removeItem('canon_locked_timeline_type');
    }
  }, [lockedTimelineType]);

  const activeTask = tasks.find(t => t.id === selectedTaskId);
  const activeTimelines = timelines.filter(tl => tl.taskId === selectedTaskId);
  const activeMissions = missions.filter(m => m.taskId === selectedTaskId);
  const activeReflection = reflections.find(r => r.date === new Date().toISOString().split('T')[0]);

  // Overall risk evaluation for current active state
  let headerRiskLevel: 'Low' | 'Medium' | 'High' | 'Catastrophic' = 'Low';
  if (activeTask) {
    const daysLeft = Math.ceil((new Date(activeTask.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1 && activeTask.progress < 40) {
      headerRiskLevel = 'Catastrophic';
    } else if (daysLeft <= 3 && activeTask.progress < 60) {
      headerRiskLevel = 'High';
    } else if (daysLeft <= 5 && activeTask.progress < 80) {
      headerRiskLevel = 'Medium';
    }
  }

  // Create Task and trigger simulation
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const deadlineStr = newTaskDeadline || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: newTaskTitle,
      description: newTaskDesc,
      deadline: deadlineStr,
      progress: newTaskProgress,
      originalRisk: 'Medium',
      currentRisk: 'Medium',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDeadline('');
    setNewTaskProgress(0);

    // Trigger simulation automatically
    setIsSimulating(true);
    try {
      const response = await fetch('/api/timeline/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          deadline: newTask.deadline,
          progress: newTask.progress
        })
      });
      const data = await response.json();
      
      const newTimelines = data.map((t: any, idx: number) => ({
        ...t,
        id: `tl-${newTask.id}-${idx}`,
        taskId: newTask.id
      }));

      setTimelines(prev => [...newTimelines, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Trigger Subdivide ("Lock In")
  const handleLockIn = async (type: 'A' | 'B' | 'C') => {
    if (!activeTask) return;
    setLockedTimelineType(type);
    setIsLockingIn(true);

    try {
      const response = await fetch('/api/task/subdivide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeTask.title,
          description: activeTask.description,
          timelineType: type
        })
      });
      const data = await response.json();

      const newMissions = data.map((m: any, idx: number) => ({
        ...m,
        id: `mission-${activeTask.id}-${idx}`,
        taskId: activeTask.id,
        completed: false
      }));

      // Filter out old missions for this task first, then add new ones
      setMissions(prev => [...prev.filter(m => m.taskId !== activeTask.id), ...newMissions]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLockingIn(false);
    }
  };

  // Complete a Micro-Mission
  const handleToggleMission = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        const nextCompleted = !m.completed;
        
        // Update active task progress accordingly based on remaining items
        setTimeout(() => {
          setMissions(updated => {
            const currentMissions = updated.filter(x => x.taskId === selectedTaskId);
            const completed = currentMissions.filter(x => x.completed).length;
            const progressRatio = currentMissions.length > 0 ? Math.round((completed / currentMissions.length) * 100) : 0;
            
            setTasks(prevTasks => prevTasks.map(t => {
              if (t.id === selectedTaskId) {
                if (nextCompleted && progressRatio === 100) {
                  setCelebratedTaskTitle(t.title);
                  setShowCelebration(true);
                }
                return { ...t, progress: progressRatio };
              }
              return t;
            }));
            return updated;
          });
        }, 50);

        return { ...m, completed: nextCompleted };
      }
      return m;
    }));
  };

  // Generate Reflection
  const handleTriggerReflection = async () => {
    if (!activeTask) return;
    setIsReflecting(true);

    const completed = activeMissions.filter(m => m.completed).length;
    const total = activeMissions.length;

    try {
      const response = await fetch('/api/reflection/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedCount: completed,
          totalCount: total,
          activeTasks: [{ title: activeTask.title, progress: activeTask.progress, deadline: activeTask.deadline }]
        })
      });
      const data = await response.json();

      const newReflection: DailyReflection = {
        id: 'ref-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        completedCount: completed,
        totalCount: total,
        procrastinationIndex: data.procrastinationIndex || 50,
        futureSelfLog: data.futureSelfLog || "SYSTEM ONLINE.",
        actionableTip: data.actionableTip || "Complete just one mission."
      };

      setReflections(prev => [newReflection, ...prev.filter(r => r.date !== newReflection.date)]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReflecting(false);
    }
  };

  // Delete task helper
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTimelines(prev => prev.filter(tl => tl.taskId !== id));
    setMissions(prev => prev.filter(m => m.taskId !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(tasks.find(t => t.id !== id)?.id || '');
    }
  };

  // Inject preventative micro-missions from Chrono Diagnostics Room
  const handleAddMissions = (newMissions: Omit<MicroMission, 'id' | 'taskId'>[]) => {
    if (!activeTask) return;
    const mapped: MicroMission[] = newMissions.map((m, idx) => ({
      ...m,
      id: `mission-${activeTask.id}-recovery-${Date.now()}-${idx}`,
      taskId: activeTask.id,
      completed: false
    }));

    // Append to existing missions
    setMissions(prev => [...prev, ...mapped]);
    
    // Auto reset task progress representation so they start at correct completed ratio
    setTimeout(() => {
      setMissions(updated => {
        const currentMissions = updated.filter(x => x.taskId === selectedTaskId);
        const completed = currentMissions.filter(x => x.completed).length;
        const progressRatio = currentMissions.length > 0 ? Math.round((completed / currentMissions.length) * 100) : 0;
        
        setTasks(prevTasks => prevTasks.map(t => {
          if (t.id === selectedTaskId) {
            return { ...t, progress: progressRatio };
          }
          return t;
        }));
        return updated;
      });
    }, 50);
  };

  // Populate extremely relatable, pre-made demo data instantly
  const handleLoadDemoData = () => {
    const demoTaskId = 'demo-task-genz';
    const demoTask: Task = {
      id: demoTaskId,
      title: 'Ethical Dilemma of AI Term Paper 🧠',
      description: 'Finish a critical 8-page final paper. Need 5 academic sources, a clean citation page, and a PDF submission before the Portal locks at midnight.',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      progress: 25,
      originalRisk: 'High',
      currentRisk: 'High',
      createdAt: new Date().toISOString()
    };

    const demoTimelines: Timeline[] = [
      {
        id: `tl-${demoTaskId}-0`,
        taskId: demoTaskId,
        type: 'A',
        name: 'Locked-In Path (A+ GPA Winner)',
        probability: 90,
        stressLevel: 15,
        description: 'You start writing 2 pages a day with a warm matcha latte playing lo-fi beats in the background. You cite high-quality PDFs, draft an outline early, and submit peacefully 12 hours ahead.',
        consequences: 'Absolute maximum grade, professor is impressed by your references, zero panic attacks, and a full 8-hour sleep before submission day.',
        dayByDayPlan: [
          { day: 'Day 1', action: 'Draft introduction and download 3 scholarly sources', stressLevel: 10 },
          { day: 'Day 2', action: 'Write 4 body pages and format citation notes', stressLevel: 20 },
          { day: 'Day 3', action: 'Submit early on the portal and reward yourself', stressLevel: 15 }
        ]
      },
      {
        id: `tl-${demoTaskId}-1`,
        taskId: demoTaskId,
        type: 'B',
        name: 'Adrenaline Sized Speedrun Path',
        probability: 60,
        stressLevel: 60,
        description: 'You play games and scroll TikTok for 2 days telling yourself "I work better under pressure." You down 2 monster energy drinks and speedrun the entire draft in a 12-hour session.',
        consequences: 'A passing grade but full of typos and rushed sentences. Your brain feels absolute mush and your hand has permanent cramps.',
        dayByDayPlan: [
          { day: 'Day 1', action: 'Watch "just one more video" on phone for hours', stressLevel: 12 },
          { day: 'Day 2', action: 'Start feeling the weight of doom, write 1 page', stressLevel: 45 },
          { day: 'Day 3', action: 'Drink energy drinks, type wildly under heavy fatigue', stressLevel: 80 }
        ]
      },
      {
        id: `tl-${demoTaskId}-2`,
        taskId: demoTaskId,
        type: 'C',
        name: 'The Ultimate Fumble Timeline (Worst Case)',
        probability: 35,
        stressLevel: 99,
        description: 'You ignore the project completely. At 11:45 PM on submission night, your home Wi-Fi crashes, your laptop launches an unpreventable Windows update, and the online submit portal closes.',
        consequences: 'System locks you out. Failed course grade, awkward email begging your professor for a break, and an uncomfortable family vibe check.',
        dayByDayPlan: [
          { day: 'Day 1', action: 'Pretend the essay doesnt exist', stressLevel: 25 },
          { day: 'Day 2', action: 'Dread paralysis kicks in. You organize your wardrobe instead', stressLevel: 65 },
          { day: 'Day 3', action: 'Wi-Fi goes down at 11:51 PM, total emotional breakdown', stressLevel: 100 }
        ]
      }
    ];

    const demoMissions: MicroMission[] = [
      { id: `mission-${demoTaskId}-0`, taskId: demoTaskId, title: 'Find 3 Google Scholar links on AI bias', completed: true, difficulty: 'Easy', estimatedMinutes: 15 },
      { id: `mission-${demoTaskId}-1`, taskId: demoTaskId, title: 'Write down a simple 4-step outline', completed: false, difficulty: 'Easy', estimatedMinutes: 10 },
      { id: `mission-${demoTaskId}-2`, taskId: demoTaskId, title: 'Draft the intro paragraph (just 200 words!)', completed: false, difficulty: 'Medium', estimatedMinutes: 30 },
      { id: `mission-${demoTaskId}-3`, taskId: demoTaskId, title: 'Collect citations and format bibliography', completed: false, difficulty: 'Easy', estimatedMinutes: 15 }
    ];

    const demoReflection: DailyReflection = {
      id: `ref-demo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      completedCount: 1,
      totalCount: 4,
      procrastinationIndex: 75,
      futureSelfLog: "🚨 CHRONO ADVICE:\nFuture self is crying at the university library right now. You spent 4 hours today scrolling through funny videos instead of opening your Google Docs. Matcha didn't save you from the deadline. Go lock in right now!",
      actionableTip: "Put your phone on 'Do Not Disturb' and place it across the room. Write just 5 sentences. The hardest part is starting.",
      coachingAdvice: {
        procrastinationTriggers: ['Short-form media dopamine', 'Task anxiety freeze', 'False sense of unlimited days'],
        personalizedAdvice: 'Your future self is begging you to take a 15 minute action. Action cures fear.',
        actionableTips: ['Start writing with terrible quality first, you can edit later', 'Phone in another room'],
        motivationalMessage: 'You are capable of doing hard things. Protect your GPA!'
      }
    };

    setTasks(prev => [demoTask, ...prev.filter(t => t.id !== demoTaskId)]);
    setSelectedTaskId(demoTaskId);
    setTimelines(prev => [...demoTimelines, ...prev.filter(tl => tl.taskId !== demoTaskId)]);
    setMissions(prev => [...demoMissions, ...prev.filter(m => m.taskId !== demoTaskId)]);
    setReflections(prev => [demoReflection, ...prev.filter(r => r.date !== demoReflection.date)]);
    setLockedTimelineType('A');
    setActiveTab('dashboard');
    setIsAuthenticated(true);
    sessionStorage.setItem('chrono_authenticated', 'true');
    setHasEntered(true);
  };

  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center font-sans p-6 relative overflow-hidden selection:bg-orange-500/30 selection:text-orange-200">
        {/* Ambient Cosmic Orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,125,38,0.06),transparent_65%)] pointer-events-none" />
        
        {/* Technical Vector Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-25" />

        {/* Vintage Sci-Fi Border Highlights */}
        <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-white/10 pointer-events-none" />
        <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-white/10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-white/10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-white/10 pointer-events-none" />

        {/* Interactive Temporal Dial & Title Shield */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 flex flex-col items-center justify-center mb-6">
          
          {/* External Pulsing Atmospheric Ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-orange-500/10"
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />

          {/* Dotted Temporal Calibration Ring */}
          <motion.div 
            className="absolute inset-4 rounded-full border border-dotted border-white/5"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          />

          {/* Intermediate Dashed Tracking Dial */}
          <motion.div 
            className="absolute inset-10 rounded-full border border-dashed border-orange-500/20"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />

          {/* Inner solid mechanical spacer */}
          <div className="absolute inset-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-inner" />

          {/* Center glowing emitter */}
          <div className="absolute w-24 h-24 rounded-full bg-orange-500/[0.03] filter blur-xl animate-pulse" />

          {/* Text/Logo Anchor */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-3 flex flex-col items-center justify-center w-full"
            >
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] font-mono tracking-[0.35em] text-orange-500 font-extrabold uppercase">
                  Chrono Unit
                </span>
              </div>
              <h1 className="font-serif italic text-6xl md:text-7xl lg:text-8xl text-white tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap">
                Canon Event
              </h1>
              <div className="h-px w-16 bg-white/20 mx-auto" />
              <p className="text-[9px] font-mono tracking-[0.25em] text-white/40 uppercase">
                Temporal Decoupler // v1.0.8
              </p>
            </motion.div>
          </div>
        </div>

        {/* Primary Interactive Action Button (moved higher up) */}
        <motion.div 
          className="z-10 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setHasEntered(true)}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(242,125,38,0.25)" }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-white hover:bg-neutral-100 text-black font-sans font-bold text-xs uppercase tracking-[0.18em] rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-white"
          >
            <span>Get Started</span>
            <ArrowRight size={12} className="text-orange-500 animate-pulse" />
          </motion.button>
        </motion.div>

        {/* Narrative Tagline & Immersive Intro below the button */}
        <motion.div 
          className="max-w-md text-center space-y-4 z-10 px-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-white/70 text-xs md:text-sm font-serif italic leading-relaxed max-w-sm mx-auto">
            "An AI-powered productivity companion that predicts future consequences of procrastination and helps users take action before deadlines become disasters."
          </p>

          <p className="text-[9px] font-mono tracking-[0.2em] text-orange-500/40 uppercase">
            // Pathways calculated //
          </p>
        </motion.div>

        {/* Cinematic Status Footer */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row gap-2 justify-between items-center text-[9px] font-mono text-white/35 select-none uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Unit O-17 Timeline Observatory Active</span>
          </div>
          <span>GEMINI 3.5 FLASH COGNITIVE CORE // MULTIVERSE SECURE</span>
        </div>
      </div>
    );
  }

  if (hasEntered && !isAuthenticated) {
    return (
      <ChronoAuth 
        onSuccess={() => {
          setIsAuthenticated(true);
          sessionStorage.setItem('chrono_authenticated', 'true');
        }}
        onBack={() => setHasEntered(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Absolute warning banner for active Canon Event risk */}
      <AnimatePresence>
        {headerRiskLevel === 'Catastrophic' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-orange-950/20 border-b border-orange-500/30 text-orange-200 px-4 py-2 text-center text-xs font-mono flex items-center justify-center gap-2 relative overflow-hidden shrink-0 shadow-lg"
          >
            {/* Pulsing warning aura */}
            <motion.div 
              className="absolute inset-0 bg-orange-500/5"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
            <AlertOctagon className="text-orange-500 animate-bounce shrink-0" size={14} />
            <span className="font-bold uppercase tracking-wider">CRITICAL TEMPORAL DRIFT DETECTED:</span>
            <span>Your timeline risk is high. Complete your micro-missions instantly to correct the trajectory.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Header */}
      <header className="border-b border-white/10 bg-[#050505]/95 backdrop-blur px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 w-full sm:w-auto">
          <div>
            <h1 className="font-serif italic text-3xl text-white tracking-tighter">Canon Event</h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 mt-0.5">AI Future Simulation & Timeline Correction</p>
          </div>
          
          {/* Risk assessment status indicator */}
          {activeTask && (
            <div className="text-left border-l border-white/10 pl-4 sm:pl-5">
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-mono">Current Trajectory</p>
              <p className={`text-xs font-mono font-bold uppercase mt-0.5 ${
                headerRiskLevel === 'Catastrophic' ? 'text-red-500' :
                headerRiskLevel === 'High' ? 'text-orange-500' :
                headerRiskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {headerRiskLevel === 'Catastrophic' ? 'CRITICAL / DEADLINE BREACH' : `${headerRiskLevel} RISK PATH`}
              </p>
            </div>
          )}
        </div>

        {/* Global Nav Toggles & AI active badge */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* User profile mini status indicator */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full shrink-0 cursor-pointer transition-all"
            title="View/Edit your Chrono Identity Profile"
          >
            <AnimatedAvatar id={profile.avatarId} size={24} className="border border-white/15" />
            <span className="text-[11px] font-mono font-bold text-orange-400 uppercase tracking-wider">Profile</span>
          </div>

          {/* Active indicator */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full shrink-0">
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f27d26]"></div>
            <span className="text-[11px] font-mono tracking-wider text-white/80">ONLINE</span>
            <span className="h-3 w-px bg-white/10" />
            <button 
              onClick={() => {
                sessionStorage.removeItem('chrono_authenticated');
                localStorage.removeItem('chrono_authenticated');
                setIsAuthenticated(false);
                setHasEntered(false);
              }}
              className="text-[10px] font-mono text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
              title="Securely Logout and Disconnect Session"
            >
              Logout
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity size={13} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio size={13} />
              Vibe Check
            </button>
            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'pitch'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award size={13} />
              Pitch Deck
            </button>
          </div>
        </div>
      </header>

      {/* Primary Application body */}
      <main className="flex-1 p-3 md:p-4 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CORE CHRONO-DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 w-full"
            >
              {/* Dynamic Shiny Multiverse Demo Loading Banner */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-amber-500/[0.05] to-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(242,125,38,0.08)]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 shrink-0 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif italic text-sm text-white font-semibold flex items-center gap-1.5">
                      Temporal Simulation Standby
                      <span className="text-[8px] font-mono bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Level 3 Demo</span>
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed max-w-xl mt-1">
                      Welcome to the workspace! Skip writing things from scratch—click below to instantly populate the dashboard with a highly relatable 
                      <span className="text-orange-400 font-semibold font-mono"> Class Paper Speedrun demo scenario </span> with alternate timelines and full diagnostics check!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLoadDemoData}
                  className="px-6 py-2.5 bg-white hover:bg-neutral-100 text-black rounded-xl font-sans font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5 border border-white"
                >
                  <span>✨ Load Demo Vibes</span>
                </button>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* LEFT COLUMN: ACTIVE TASKS & NEW TASK FORM (4 spans) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 1. Add Task Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-xl">
                  <h3 className="font-serif italic text-base text-white flex items-center gap-2 border-b border-white/10 pb-2.5 mb-2.5">
                    <Plus className="text-orange-500" size={14} />
                    Project Timeline Input
                  </h3>

                  <form onSubmit={handleCreateTask} className="space-y-3">
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider block mb-0.5">Project / Goal Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vibe2Ship Hackathon Project"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider block mb-0.5">Trajectory Context (Description)</label>
                      <textarea
                        placeholder="What specific tasks are remaining? Any friction points?"
                        rows={2}
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider block mb-0.5">Absolute Deadline</label>
                        <input
                          type="date"
                          value={newTaskDeadline}
                          onChange={(e) => setNewTaskDeadline(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-lg px-2 py-1.5 text-xs font-mono text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider block mb-0.5">Starting Progress</label>
                        <div className="flex items-center gap-2 h-[34px] bg-white/5 border border-white/10 rounded-lg px-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={newTaskProgress}
                            onChange={(e) => setNewTaskProgress(Number(e.target.value))}
                            className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-[9px] font-mono text-white/60 font-bold w-5 text-right">
                            {newTaskProgress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSimulating}
                      className="w-full py-2 bg-white text-black hover:bg-white/90 font-sans font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles size={12} />
                      CALCULATE ALTERNATE FUTURES
                    </button>
                  </form>
                </div>

                {/* 2. Tasks List Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                    <h3 className="font-serif italic text-base text-white flex items-center gap-2">
                      <ListTodo className="text-orange-500" size={14} />
                      Active Timelines
                    </h3>
                    <span className="text-[8px] font-mono text-white/40">
                      {tasks.length} Tracked
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {tasks.map((task) => {
                      const isSelected = task.id === selectedTaskId;
                      const daysLeft = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            // Clear locked timeline state when swapping tasks to avoid mix-ups
                            setLockedTimelineType(null);
                          }}
                          className={`p-2 border rounded-lg flex items-center justify-between gap-2.5 cursor-pointer select-none transition-all ${
                            isSelected
                              ? 'bg-white/10 border-white/25 shadow'
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="min-w-0">
                            <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-white/70'}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-white/40">
                              <span className="flex items-center gap-1">
                                <Calendar size={8} />
                                {daysLeft <= 0 ? 'Due Today' : `${daysLeft}d left`}
                              </span>
                              <span>•</span>
                              <span>{task.progress}% done</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {tasks.length === 0 && (
                      <div className="text-center py-4 text-white/30 font-serif italic text-xs">
                        No active timelines. Add a project above.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: TIMELINE SIMULATION & ACTIVE LOCK-IN CHECKLIST (8 spans) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* 1. Alternate Future Simulator */}
                <TimelineSimulator
                  timelines={activeTimelines}
                  isLoading={isSimulating}
                  onLockIn={handleLockIn}
                  selectedTimelineType={lockedTimelineType}
                />

                {/* 2. Grid split for checklist and observer terminal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Micro task planner */}
                  <LockInPlanner
                    missions={activeMissions}
                    isLoading={isLockingIn}
                    onToggleMission={handleToggleMission}
                    activeTaskTitle={activeTask?.title || ''}
                  />

                  {/* Observer reflection */}
                  <DailyReplay
                    reflection={activeReflection || null}
                    isLoading={isReflecting}
                    onTriggerReflection={handleTriggerReflection}
                    canReflect={activeMissions.length > 0}
                  />
                </div>

              </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: PITCH SLIDE DECK & LIVE JUDGE Q&A */}
          {activeTab === 'pitch' && (
            <motion.div
              key="pitch"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <JudgeRoom />
            </motion.div>
          )}

          {/* TAB 3: CHRONO DIAGNOSTICS ROOM */}
          {activeTab === 'diagnostics' && (
            <motion.div
              key="diagnostics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {activeTask ? (
                <ChronoDiagnosticsRoom
                  taskId={activeTask.id}
                  taskTitle={activeTask.title}
                  taskDescription={activeTask.description || ''}
                  taskDeadline={activeTask.deadline}
                  taskProgress={activeTask.progress}
                  onAddMissions={handleAddMissions}
                />
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                  <Radio className="text-white/20 mb-4 animate-pulse" size={36} />
                  <p className="text-white/60 font-medium font-serif italic text-base">Choose a project first!</p>
                  <p className="text-xs text-white/30 max-w-xs mx-auto mt-2 leading-relaxed">
                    Once you start tracking a project on the dashboard, you can open Vibe Check to see exactly how your future looks.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: CHRONO IDENTITY PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfileSettings
                profile={profile}
                onSave={(updated) => setProfile(updated)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 5. Temporal Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            {/* Pulsing deep emerald glow in background */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Glowing timeline ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <motion.div
                className="w-[300px] h-[300px] rounded-full border border-emerald-500/20 flex items-center justify-center relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                {/* Rotating nodes */}
                <span className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                <span className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                <span className="absolute -bottom-1 left-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              </motion.div>
              
              <motion.div
                className="w-[450px] h-[450px] rounded-full border border-dashed border-emerald-500/10 absolute"
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Main content card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative max-w-md w-full bg-[#0a0a0a]/90 border border-emerald-500/30 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden"
            >
              {/* Top ambient lights */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              
              {/* Celebration icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <Sparkles className="text-emerald-400 relative z-10" size={28} />
              </div>

              {/* Title & Badge */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
                  Timeline Calibrated
                </span>
                <h3 className="font-serif italic text-3xl text-white pt-2">
                  Canon Event Averted!
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-white/70 leading-relaxed mb-6 max-w-sm mx-auto">
                All micro-missions have been locked in and completed successfully. You have broken the procrastination feedback loop and actively shifted your trajectory away from failure.
              </p>

              {/* Stabilized task section */}
              {celebratedTaskTitle && (
                <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-4 mb-6 text-left">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    STABILIZED ANOMALY
                  </span>
                  <span className="text-sm font-sans font-semibold text-white/95 line-clamp-1">
                    {celebratedTaskTitle}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-white/40 uppercase">
                      Timeline stability: 100% (Absolute Safe)
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCelebration(false)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
                >
                  Confirm Stability
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle diagnostic status footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-6 px-6 text-center text-[10px] font-mono text-white/20 tracking-[0.2em] uppercase shrink-0 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-6">
            <span>Node: <span className="text-white/50">Vibe2Ship_Final_Demo</span></span>
            <span>ID: <span className="text-white/50">C-412.9</span></span>
            <span>Status: <span className="text-white/50">Correcting Trajectory...</span></span>
          </div>
          <p>© 2026 Canon Event Corp / Powered by Google AI Studio</p>
        </div>
      </footer>

    </div>
  );
}
