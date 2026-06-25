import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { User, Shield, Compass, Sparkles, Check, Flame } from 'lucide-react';

interface UserProfileSettingsProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

// 6 beautiful self-contained animated SVG avatars
export function AnimatedAvatar({ id, size = 64, className = "" }: { id: string, size?: number, className?: string }) {
  const animations = `
    @keyframes orbit {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes vortex {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes matrix-fall {
      0% { stroke-dashoffset: 200; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 0.9; }
      100% { transform: scale(0.95); opacity: 0.5; }
    }
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    @keyframes soundwave-1 {
      0%, 100% { height: 20%; }
      50% { height: 80%; }
    }
    @keyframes soundwave-2 {
      0%, 100% { height: 40%; }
      50% { height: 95%; }
    }
    @keyframes soundwave-3 {
      0%, 100% { height: 15%; }
      50% { height: 70%; }
    }
  `;

  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-black/60 rounded-2xl border border-white/10 shadow-inner ${className}`} style={{ width: size, height: size }}>
      <style>{animations}</style>

      {/* 1. Temporal Core */}
      {id === 'temporal_core' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="absolute w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 blur-[2px]"
            style={{ animation: 'pulse-ring 2.5s infinite ease-in-out' }}
          />
          <div 
            className="absolute w-4/5 h-4/5 rounded-full border border-orange-500/30 border-t-orange-500 border-b-amber-500"
            style={{ animation: 'orbit 4s infinite linear' }}
          />
          <div className="z-10 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
        </div>
      )}

      {/* 2. Cyber Matrix Rain */}
      {id === 'matrix_rain' && (
        <svg className="w-full h-full p-1" viewBox="0 0 100 100">
          <g stroke="#10b981" strokeWidth="2" strokeLinecap="round">
            <line x1="20" y1="10" x2="20" y2="90" strokeDasharray="10, 30" style={{ animation: 'matrix-fall 3s infinite linear' }} />
            <line x1="40" y1="10" x2="40" y2="90" strokeDasharray="15, 25" style={{ animation: 'matrix-fall 2.2s infinite linear' }} />
            <line x1="60" y1="10" x2="60" y2="90" strokeDasharray="8, 35" style={{ animation: 'matrix-fall 4s infinite linear' }} />
            <line x1="80" y1="10" x2="80" y2="90" strokeDasharray="12, 20" style={{ animation: 'matrix-fall 2.6s infinite linear' }} />
          </g>
          <div className="absolute inset-0 bg-emerald-500/5 mix-blend-color-dodge" />
        </svg>
      )}

      {/* 3. Synthwave Sunset */}
      {id === 'synth_wave' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#180018]">
          <div className="absolute top-1 left-1 right-1 h-3/5 rounded-t-xl bg-gradient-to-b from-purple-950 to-pink-600 flex items-center justify-center overflow-hidden">
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-t from-pink-500 to-yellow-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
              style={{ animation: 'pulse-ring 3s infinite ease-in-out' }}
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.1)_1px,transparent_1px)] bg-[size:100%_6px]" />
          <div className="absolute top-1/2 bottom-0 left-0 right-0 border-t border-pink-500/40 bg-pink-950/10" />
          <div 
            className="absolute left-0 right-0 h-0.5 bg-pink-400/80 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
            style={{ animation: 'scanline 2s infinite linear' }}
          />
        </div>
      )}

      {/* 4. Cosmic Vortex */}
      {id === 'cosmic_vortex' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="absolute w-[85%] h-[85%] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.4)_10%,transparent_70%)]"
            style={{ animation: 'vortex 6s infinite linear' }}
          />
          <svg className="w-[90%] h-[90%] absolute" viewBox="0 0 100 100">
            <path 
              d="M 50,50 A 25,25 0 0,1 75,50 A 25,25 0 0,1 50,75 A 25,25 0 0,1 25,50 Z" 
              fill="none" 
              stroke="rgb(168, 85, 247)" 
              strokeWidth="2" 
              strokeDasharray="2, 6, 12, 4" 
              style={{ animation: 'vortex 8s infinite linear', transformOrigin: '50% 50%' }}
            />
            <path 
              d="M 50,50 A 35,35 0 0,1 85,50 A 35,35 0 0,1 50,85 A 35,35 0 0,1 15,50 Z" 
              fill="none" 
              stroke="rgb(236, 72, 153)" 
              strokeWidth="1.5" 
              strokeDasharray="4, 15, 6, 15" 
              style={{ animation: 'orbit 12s infinite linear', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div className="z-10 w-2 h-2 rounded-full bg-black border border-purple-500" />
        </div>
      )}

      {/* 5. Hyperdrive Compass */}
      {id === 'time_compass' && (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <div 
            className="absolute inset-2 rounded-full border border-sky-500/20"
          />
          <div 
            className="absolute inset-1 rounded-full border-2 border-dashed border-sky-400/40"
            style={{ animation: 'orbit 16s infinite linear' }}
          />
          <div 
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-sky-500/30"
            style={{ animation: 'orbit 6s infinite linear' }}
          />
          <div 
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-sky-500/30"
            style={{ animation: 'orbit 6s infinite linear' }}
          />
          <div className="w-4 h-4 rounded-full border border-sky-400 flex items-center justify-center bg-sky-950/40 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </div>
        </div>
      )}

      {/* 6. Cyber Equalizer */}
      {id === 'equalizer' && (
        <div className="w-full h-full flex items-end justify-center gap-1 p-2 bg-[#020d1a]">
          <div className="w-1.5 bg-cyan-400 rounded-t" style={{ animation: 'soundwave-1 0.8s infinite ease-in-out' }} />
          <div className="w-1.5 bg-cyan-300 rounded-t" style={{ animation: 'soundwave-2 0.6s infinite ease-in-out' }} />
          <div className="w-1.5 bg-teal-400 rounded-t" style={{ animation: 'soundwave-3 0.9s infinite ease-in-out' }} />
          <div className="w-1.5 bg-cyan-400 rounded-t" style={{ animation: 'soundwave-2 0.75s infinite ease-in-out' }} />
          <div className="w-1.5 bg-blue-500 rounded-t" style={{ animation: 'soundwave-1 0.5s infinite ease-in-out' }} />
        </div>
      )}
    </div>
  );
}

const AVATAR_OPTIONS = [
  { id: 'temporal_core', name: 'Temporal Core', description: 'Glowing dimensional bio-energy orb' },
  { id: 'matrix_rain', name: 'Matrix Rain', description: 'Emerald digital waterfall stream' },
  { id: 'synth_wave', name: 'Synthwave Sun', description: 'Retro hot-pink wireframe horizon' },
  { id: 'cosmic_vortex', name: 'Cosmic Vortex', description: 'Violet spinning black-hole cluster' },
  { id: 'time_compass', name: 'Hyper Compass', description: 'Tactical blue tracking chronometer' },
  { id: 'equalizer', name: 'Cyber Beats', description: 'Flickering audio pulse telemetry' }
];

const SUGGESTED_MOTTOS = [
  "Locked in, no cap. 🔒",
  "Let me cook the code. 🍳",
  "Defeating my worst timeline, one tick at a time. ⏳",
  "Slaying my academic deadlines with raw adrenaline. ⚡",
  "Snooze you lose, focus or fumbled. 🙅‍♂️",
  "Chrono stability is my highest priority. 🌐"
];

const SUGGESTED_ERAS = [
  "Graduation Class of 2027 🎓",
  "Vibe2Ship Hackathon 2026 🚢",
  "Quantum Era Year 2049 🌌",
  "Present Timeline Sector-A1 🛸",
  "Midterm Survival Sector 🏫"
];

export default function UserProfileSettings({ profile, onSave }: UserProfileSettingsProps) {
  const [name, setName] = useState(profile.name || '');
  const [codename, setCodename] = useState(profile.codename || '');
  const [motto, setMotto] = useState(profile.motto || '');
  const [era, setEra] = useState(profile.era || SUGGESTED_ERAS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId || 'temporal_core');
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      codename,
      motto,
      era,
      avatarId: selectedAvatar
    });
    setIsSavedBanner(true);
    setTimeout(() => {
      setIsSavedBanner(false);
    }, 3000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/[0.03] rounded-full filter blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="border-b border-white/10 pb-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[9px] font-mono text-orange-500 font-black uppercase tracking-[0.2em] block">// IDENTITY REGISTER</span>
          <h2 className="font-serif italic text-2xl text-white">Chrono Identity Profile</h2>
          <p className="text-xs text-white/40 font-mono mt-0.5">Customize your temporal locator tag and interactive cyber representation.</p>
        </div>
        
        {/* Save button floating */}
        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-white text-black hover:bg-neutral-100 rounded-xl font-sans font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Check size={14} />
          Save Identity
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Bio details */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Observer Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Khushi Lakhanpal"
                  className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Codename */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Agent Codename / Tag</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type="text"
                  required
                  value={codename}
                  onChange={(e) => setCodename(e.target.value)}
                  placeholder="e.g. Agent_Chrono_Alpha"
                  className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 outline-none transition-all font-mono text-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Era Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Temporal Era Sector</label>
            <div className="relative">
              <Compass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <select
                value={era}
                onChange={(e) => setEra(e.target.value)}
                className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none transition-all cursor-pointer appearance-none"
              >
                {SUGGESTED_ERAS.map((item) => (
                  <option key={item} value={item} className="bg-[#0f0f0f] text-white">
                    {item}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div>
            </div>
          </div>

          {/* Gen Z Motto / Focus Vibe */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">Gen-Z Focus Motto / Mindset</label>
            <input
              type="text"
              required
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="e.g. Locked in, no cap. 🔒"
              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 outline-none transition-all"
            />
            
            {/* Quick selectors for Mottos */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_MOTTOS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMotto(m)}
                  className={`text-[9px] px-2 py-1 rounded-full border transition-all cursor-pointer ${
                    motto === m
                      ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                      : "bg-white/5 border-white/5 hover:border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Avatar Selectors (The animated ones!) */}
        <div className="lg:col-span-5 space-y-4">
          <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="text-orange-500 animate-pulse" size={12} />
            Pick Animated Hologram Avatar
          </label>

          {/* Grid of options */}
          <div className="grid grid-cols-3 gap-3">
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = selectedAvatar === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.id)}
                  className={`relative p-2 border rounded-xl flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.04] border-orange-500 shadow-[0_0_15px_rgba(242,125,38,0.15)]"
                      : "bg-black/40 border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                  title={opt.description}
                >
                  <AnimatedAvatar id={opt.id} size={48} className="border border-white/10" />
                  <span className={`text-[9px] font-mono text-center truncate w-full ${isSelected ? "text-orange-400 font-bold" : "text-white/50"}`}>
                    {opt.name}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-orange-500 text-black rounded-full p-0.5">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick interactive card preview */}
          <div className="bg-black/60 border border-white/5 rounded-xl p-3 flex items-center gap-3 shadow-inner">
            <AnimatedAvatar id={selectedAvatar} size={44} className="border border-orange-500/20" />
            <div className="min-w-0">
              <span className="text-[8px] font-mono text-orange-500/80 uppercase font-black tracking-widest">// SECURED CODENAME</span>
              <p className="text-xs font-mono font-bold text-white truncate">{codename || 'Agent_Anonymous'}</p>
              <p className="text-[10px] text-white/50 italic truncate mt-0.5">"{motto || 'Standing by...'}"</p>
            </div>
          </div>

        </div>

      </form>

      {/* Save feedback banner */}
      {isSavedBanner && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl flex items-center gap-2"
        >
          <Flame size={14} className="animate-pulse text-white" />
          <span className="text-xs font-mono text-white">Chrono Identity profile written to local memory core! Trajectory tags updated. ✨</span>
        </motion.div>
      )}

    </div>
  );
}
