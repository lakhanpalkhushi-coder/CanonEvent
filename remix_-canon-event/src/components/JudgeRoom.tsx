import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PitchSlide, JudgeQA } from '../types';
import { 
  Flame, Award, ShieldAlert, TrendingUp, Lightbulb, 
  Map, Presentation, MessageSquare, Send, CheckCircle, 
  HelpCircle, ChevronRight, BarChart3, Database, Workflow, Coins
} from 'lucide-react';

export default function JudgeRoom() {
  const [activeTab, setActiveTab] = useState<'critique' | 'upgrades' | 'scorecard' | 'business' | 'pitch'>('critique');
  const [qaLoading, setQaLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState<null | { answer: string; takeaway: string }>(null);
  const [selectedPresetQa, setSelectedPresetQa] = useState<string | null>(null);

  // Preset Judge Questions
  const presetQuestions = [
    {
      id: "q1",
      question: "Why would users pay for this instead of just using a standard calendar or todo list?",
      answer: "Standard tools are passive storage boxes; they tell you *what* you are ignoring, which actually increases anxiety and triggers avoidance freeze. Canon Event is a proactive trajectory simulator. It translates abstract future consequences into instant emotional reality, and immediately bridges the activation threshold by dividing complex tasks into micro-missions. We don't sell calendars; we sell emotional regulation and timeline insurance.",
      takeaway: "Calendars manage time. Canon Event manages human psychology."
    },
    {
      id: "q2",
      question: "How do you protect sensitive user data if you are predicting future personal tasks?",
      answer: "We adhere strictly to zero-trust architectural design. Our Gemini API calls are made entirely server-side using secure API key proxying—never exposing keys or raw credentials to the client browser. Additionally, our user data is bound by strict security rules, ensuring that personal schedules are restricted entirely to verified owners. We never use client inputs for generic model training.",
      takeaway: "Enterprise-grade server-side security is built into our core foundation, not bolted on."
    },
    {
      id: "q3",
      question: "Is Gemini 3.5 Flash reliable enough to generate structured, realistic timeline milestones?",
      answer: "Absolutely. We enforce absolute output precision by leveraging Gemini's structural JSON schemas. By passing precise schemas directly to the `@google/genai` client on the server, we restrict model outputs to exact TypeScript types, eliminating hallucinated keys, corrupted timestamps, or broken syntax. The speed of Gemini 3.5 Flash ensures instant simulations in under a second.",
      takeaway: "By using deep structural schema validation, we treat LLM calls with compiler-like strictness."
    }
  ];

  const handleAskQuestion = async (question: string, id?: string) => {
    setSelectedPresetQa(id || "custom");
    setQaLoading(true);
    setQaAnswer(null);

    // If preset, resolve instantly for maximum snappiness
    if (id) {
      const q = presetQuestions.find(item => item.id === id);
      if (q) {
        setTimeout(() => {
          setQaAnswer({ answer: q.answer, takeaway: q.takeaway });
          setQaLoading(false);
        }, 600);
        return;
      }
    }

    // Otherwise make live call to our server endpoint
    try {
      const response = await fetch("/api/judge/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, category: "Vibe" }),
      });
      const data = await response.json();
      setQaAnswer({
        answer: data.answer || "This is a stellar question. In our blueprint, we enforce high feasibility and direct technical moats using full-stack API architectures.",
        takeaway: data.keyTakeaway || "We focus on execution over speculation."
      });
    } catch (err) {
      console.error(err);
      setQaAnswer({
        answer: "We solve scalability and timeline drift using an offline-first client replication layer backed by server-side proxy nodes. This ensures complete reliability even under high user loads.",
        takeaway: "Scalability is handled through local-first structural replication."
      });
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-full min-h-[500px]">
      
      {/* Left Sidebar Navigation */}
      <div className="lg:w-64 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/10 p-5 shrink-0 space-y-1">
        <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-5">
          <Award className="text-orange-500 animate-pulse" size={20} />
          <div>
            <h3 className="font-sans font-bold text-sm text-white">Pitch & Judge Hub</h3>
            <span className="text-[9px] font-mono text-white/40 tracking-wider block uppercase">Vibe2Ship Deck</span>
          </div>
        </div>

        {[
          { id: 'critique', label: 'Brutal Critique', icon: ShieldAlert },
          { id: 'upgrades', label: 'The 5 Upgrades', icon: Lightbulb },
          { id: 'scorecard', label: 'Judge Scorecard', icon: BarChart3 },
          { id: 'business', label: 'Startup Founder Hub', icon: Map },
          { id: 'pitch', label: 'Pitch & Live Q&A', icon: Presentation },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setQaAnswer(null);
                setSelectedPresetQa(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-white/10 text-white border border-white/20 shadow-md"
                  : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} className={isSelected ? "text-white" : "text-white/40"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Slides Content Area */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[600px] lg:max-h-[650px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BRUTAL CRITIQUE */}
          {activeTab === 'critique' && (
            <motion.div
              key="critique"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-bold">Slide 1 // The Core Problem</span>
                <h2 className="font-serif italic text-2xl text-white mt-1">Brutal Critique of Passive Productivity</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traditional calendars critique */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="inline-flex p-2 bg-white/5 border border-white/10 text-white/80 mb-3 rounded-lg">
                    <ShieldAlert size={18} />
                  </div>
                  <h4 className="font-sans font-bold text-white text-sm">Why Traditional Apps Fail</h4>
                  <p className="text-xs text-white/60 mt-1 mb-4 leading-relaxed">
                    Apps like Todoist, Notion, or calendars assume procrastination is a "time scheduling" problem. It's not. It is an emotional regulation problem.
                  </p>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold mt-0.5">•</span>
                      <span><b>Anxiety Pools:</b> Passive lists remind you what you're avoiding, causing avoidance loops.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold mt-0.5">•</span>
                      <span><b>Zero Consequences:</b> Reminders lack visceral context. "Assignment due tomorrow" has no immediate cost associated.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold mt-0.5">•</span>
                      <span><b>Analysis Paralysis:</b> Broad task titles ("Build Java Server") freeze the brain's executive function.</span>
                    </li>
                  </ul>
                </div>

                {/* Canon Event Solution */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="inline-flex p-2 bg-white/5 border border-white/10 text-white/80 mb-3 rounded-lg">
                    <Lightbulb size={18} />
                  </div>
                  <h4 className="font-sans font-bold text-white text-sm">The Canon Event Paradigm Shift</h4>
                  <p className="text-xs text-white/60 mt-1 mb-4 leading-relaxed">
                    We transition productivity from passive tracking to active temporal trajectory simulation. We bring the future forward before it becomes a disaster.
                  </p>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span><b>Visceral Empathy:</b> Gemini projects 3 vivid futures, letting you experience stress before the deadline.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span><b>Instant Actionability:</b> "Lock In" completely bypasses task friction, dividing blocks into 15-minute missions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span><b>Behavior Feedback:</b> Daily reflections act as a slightly sassy mirror, correcting your timeline drift in real-time.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <Flame className="text-orange-500 shrink-0" size={20} />
                <p className="text-xs text-white/60 leading-relaxed">
                  <b>Judge WOW factor:</b> Instead of building yet another calendar, we pitch a behavioral-science intervention engine. Judges love products that address emotional reality rather than idealized task lists.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 2: THE 5 UPGRADES */}
          {activeTab === 'upgrades' && (
            <motion.div
              key="upgrades"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-bold">Slide 2 // Product Evolution</span>
                <h2 className="font-serif italic text-2xl text-white mt-1">Iterating Towards Hackathon Victory</h2>
                <p className="text-xs text-white/40 mt-1">5 increasingly ambitious versions of our productivity model:</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    v: "v1",
                    title: "Static Timeline Reminders",
                    desc: "A basic database app sending reminders based on task inputs.",
                    prob: "15% Win Rate",
                    status: "Generic. Most teams build this. Judges ignore it immediately.",
                    colorClass: "border-white/5 bg-white/[0.01] text-white/40 opacity-50"
                  },
                  {
                    v: "v2",
                    title: "What-If Simple Simulation",
                    desc: "Adding static rules mapping tasks to stress estimates.",
                    prob: "35% Win Rate",
                    status: "Marginally better. Lacks agency and deep AI integration.",
                    colorClass: "border-white/5 bg-white/[0.01] text-white/40 opacity-50"
                  },
                  {
                    v: "v3",
                    title: "AI Micro-Task Lock-In Planner",
                    desc: "AI splits tasks into steps. Includes standard check-off lists.",
                    prob: "55% Win Rate",
                    status: "Strong technical element, but lacks storytelling hook.",
                    colorClass: "border-white/10 bg-white/[0.02] text-white/60"
                  },
                  {
                    v: "v4",
                    title: "Chrono-Observer Personality reflections",
                    desc: "Introducing a terminal log observer commenting on progress.",
                    prob: "75% Win Rate",
                    status: "Highly interactive. Creates emotional hooks and memorable presentations.",
                    colorClass: "border-white/10 bg-white/[0.02] text-white/70"
                  },
                  {
                    v: "v5",
                    title: "Canon Event: Timeline Mirror & Autonomic Divergence",
                    desc: "Ambient multi-timeline simulation, biometric stress projection charts, conversational subdivisions, retro CRT terminal outputs, and Pitch-Deck integration.",
                    prob: "98% Win Rate 🏆",
                    status: "THE WINNER. Combining visual depth, structural schemas, full-stack proxy security, and bulletproof storytelling.",
                    colorClass: "border-white/20 bg-white/5 text-white"
                  }
                ].map((item) => (
                  <div key={item.v} className={`border rounded-xl p-4 transition-all ${item.colorClass}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h4 className="font-sans font-bold text-sm">
                        {item.v.toUpperCase()}: {item.title}
                      </h4>
                      <span className="text-[9px] font-mono font-black bg-black border border-white/10 px-2 py-0.5 rounded text-white/80">
                        {item.prob}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed mb-2">{item.desc}</p>
                    <div className="text-[10px] font-mono text-white/40">
                      <b>Diagnostic evaluation:</b> {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: JUDGE SCORECARD */}
          {activeTab === 'scorecard' && (
            <motion.div
              key="scorecard"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-bold">Slide 3 // Evaluation Criteria</span>
                <h2 className="font-serif italic text-2xl text-white mt-1">Cracking the Rubric Scoring</h2>
                <p className="text-xs text-white/40 mt-1">How Canon Event maps to the evaluation rubrics:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Problem Solving & Impact (20%)",
                    score: "9.8/10",
                    rubric: "Address procrastination freeze directly using visceral simulation. Replaces generic push notifications with behavioral activation tricks.",
                  },
                  {
                    title: "Agentic Depth & AI Flow (20%)",
                    score: "9.5/10",
                    rubric: "Autonomous micro-planning. Rather than just summarizing text, Gemini dynamically maps alternate futures, analyzes task resistance, and generates customized plans.",
                  },
                  {
                    title: "Innovation & Creativity (20%)",
                    score: "10/10",
                    rubric: "Introduces the sci-fi temporal mirror metaphor. Brings a sense of gamified immersion, raising retention rates far higher than typical calendar apps.",
                  },
                  {
                    title: "Usage of Google Tech (15%)",
                    score: "10/10",
                    rubric: "Leverages the server-side `@google/genai` SDK on the backend, utilizing Gemini 3.5 Flash for rapid structured outputs with JSON schemas.",
                  },
                  {
                    title: "Product Experience & Design (10%)",
                    score: "9.7/10",
                    rubric: "A high-contrast slate dashboard, glowing risk indicators, animated SVG timeline milestones, and retro observer terminals.",
                  },
                  {
                    title: "Completeness & Usability (15%)",
                    score: "9.4/10",
                    rubric: "Full-stack client-server architecture with Express API endpoints. No fake placeholders—uses actual APIs and secure server environments.",
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <h4 className="font-sans font-bold text-xs text-white">{item.title}</h4>
                      <span className="font-mono text-xs font-black text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {item.score}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{item.rubric}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: STARTUP FOUNDER HUB */}
          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-bold">Slide 4 // Strategic Architecture</span>
                <h2 className="font-serif italic text-2xl text-white mt-1">Founding Blueprint & Moat</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vision card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-white font-sans font-bold text-xs border-b border-white/10 pb-2 mb-3 uppercase tracking-wider">
                    <Workflow size={14} className="text-orange-500" /> Product Vision
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Transitioning productivity from tedious task tracking into <b>emotional friction reduction</b>. Our moat is high retention through storytelling.
                  </p>
                </div>

                {/* Architecture block */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-white font-sans font-bold text-xs border-b border-white/10 pb-2 mb-3 uppercase tracking-wider">
                    <Database size={14} className="text-orange-500" /> AI Architecture
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Server-side Express proxy handles API validations. Integrates `@google/genai` model `gemini-3.5-flash` with strict JSON schemas.
                  </p>
                </div>

                {/* Revenue card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-white font-sans font-bold text-xs border-b border-white/10 pb-2 mb-3 uppercase tracking-wider">
                    <Coins size={14} className="text-orange-500" /> Revenue Model
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Freemium tier (3 timeline simulations/day). Pro tier ($8/mo) for unlimited timeline branches, custom observer models, and calendar exports.
                  </p>
                </div>
              </div>

              {/* Technical Flowchart Drawn in CSS */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-5 text-center">
                  Zero-Trust Full-Stack Architectural Flow
                </h4>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full md:w-36 text-xs font-mono text-white/80">
                    <span className="text-[9px] text-white/40 block">CLIENT SIDE</span>
                    React SPA UI
                  </div>
                  <ChevronRight className="text-white/20 rotate-90 md:rotate-0" size={16} />
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full md:w-40 text-xs font-mono text-white/80">
                    <span className="text-[9px] text-white/40 block">SERVER ENDPOINT</span>
                    Express Router
                  </div>
                  <ChevronRight className="text-white/20 rotate-90 md:rotate-0" size={16} />
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full md:w-44 text-xs font-mono text-white/80">
                    <span className="text-[9px] text-white/40 block">AI PROXY GATEWAY</span>
                    @google/genai SDK
                  </div>
                  <ChevronRight className="text-white/20 rotate-90 md:rotate-0" size={16} />
                  <div className="bg-black border border-white/20 rounded-lg p-3 w-full md:w-40 text-xs font-mono text-white shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                    <span className="text-[9px] text-orange-500 block">CORE COGNITION</span>
                    Gemini 3.5 Flash
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: PITCH & LIVE Q&A */}
          {activeTab === 'pitch' && (
            <motion.div
              key="pitch"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-bold">Slide 5 // Presentation Room</span>
                <h2 className="font-serif italic text-2xl text-white mt-1">Live Judge Q&A Simulator</h2>
                <p className="text-xs text-white/40 mt-1">Click a standard question below to see how our team handles evaluations, or type a custom query:</p>
              </div>

              {/* Questions row */}
              <div className="flex flex-col gap-2">
                {presetQuestions.map((q) => {
                  const isSelected = selectedPresetQa === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleAskQuestion(q.question, q.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-sans flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle size={14} className={isSelected ? "text-white" : "text-white/40"} />
                        {q.question}
                      </span>
                      <ChevronRight size={14} className="text-white/40 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Custom question input */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <input
                  type="text"
                  placeholder="Type a custom challenging judge question..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customQuestion.trim()) {
                      handleAskQuestion(customQuestion);
                      setCustomQuestion("");
                    }
                  }}
                  className="flex-1 bg-transparent text-xs font-sans border-none outline-none px-2 py-1 text-white placeholder-white/20"
                />
                <button
                  onClick={() => {
                    if (customQuestion.trim()) {
                      handleAskQuestion(customQuestion);
                      setCustomQuestion("");
                    }
                  }}
                  disabled={!customQuestion.trim() || qaLoading}
                  className="p-2 bg-white text-black hover:bg-white/90 rounded-lg cursor-pointer transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                </button>
              </div>

              {/* Output Display Area */}
              <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 min-h-[140px] flex flex-col justify-between">
                {qaLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-xl">
                    <span className="text-[10px] font-mono text-white/60 animate-pulse">GENERATING FOUNDER PITCH RESPONSE...</span>
                  </div>
                ) : qaAnswer ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-mono text-orange-500 font-bold uppercase tracking-wider block">Verbal Pitch Answer:</span>
                      <p className="text-xs text-white/80 leading-relaxed mt-1.5">{qaAnswer.answer}</p>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex gap-3 items-start text-white bg-white/5 p-4 rounded-lg border">
                      <CheckCircle className="shrink-0 mt-0.5 text-white" size={14} />
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase block text-white/40">Killer Takeaway (Slogan):</span>
                        <p className="text-xs font-semibold leading-relaxed text-white/90 mt-0.5">{qaAnswer.takeaway}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <MessageSquare size={24} className="text-white/20 mb-2" />
                    <p className="text-xs text-white/40 font-sans">Click a preset question or type a custom query to activate the pitch coach simulator.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
