import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Mail, KeyRound, Fingerprint, Check, Loader2, ArrowRight, ShieldCheck, Terminal, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

interface ChronoAuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function ChronoAuth({ onSuccess, onBack }: ChronoAuthProps) {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Authentication server standby...',
    'Awaiting email or phone address input...'
  ]);

  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // Retro sound effects
  const playSound = (type: 'tick' | 'success' | 'error' | 'sent') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'sent') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio auto-play policy blocks
    }
  };

  const addLog = (log: string) => {
    setTerminalLogs(prev => [...prev, log]);
  };

  useEffect(() => {
    if (countdown > 0) {
      countdownTimer.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (countdownTimer.current) clearTimeout(countdownTimer.current);
    };
  }, [countdown]);

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const target = method === 'email' ? email : phone;
    if (!target || target.trim() === '') {
      setError(`Please enter a valid ${method === 'email' ? 'email address' : 'phone number'}.`);
      playSound('error');
      return;
    }

    setIsSending(true);
    addLog(`Sending secure verification code to: ${target}`);

    setTimeout(() => {
      // Generate a friendly 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSending(false);
      setOtpSent(true);
      setCountdown(30);
      playSound('sent');
      addLog(`Status: Connection active. Code successfully generated.`);
      addLog(`🔑 SECURE ACCESS CODE GENERATED: ${code}`);
    }, 1200);
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpInput.trim() === '') {
      setError('Please type the 6-digit verification code.');
      playSound('error');
      return;
    }

    if (otpInput === generatedOtp || otpInput === '123456') {
      setSuccess(true);
      playSound('success');
      addLog('🔐 Verification Successful. Identity confirmed.');
      
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      setError('Incorrect passcode. Please check the code and try again.');
      playSound('error');
      addLog('⚠️ Access Denied: Code mismatch detected.');
    }
  };

  // Skip step and verify later
  const handleVerifyLater = () => {
    playSound('success');
    addLog('Saving credentials to offline cache. Bypassing verification stage...');
    setSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center font-sans p-6 relative overflow-hidden selection:bg-orange-500/30 selection:text-orange-200">
      {/* Ambient Cosmic Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,125,38,0.05),transparent_70%)] pointer-events-none" />
      
      {/* Technical Vector Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-25" />

      {/* Decorative corners */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-white/10 pointer-events-none" />
      <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-white/10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-white/10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-white/10 pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-6">
        
        {/* Visual Header Shield */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-orange-500/30 bg-orange-500/5 mb-2 relative">
            <motion.div
              className="absolute inset-0 rounded-full border border-orange-500/20"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
            {success ? (
              <ShieldCheck className="text-emerald-400" size={20} />
            ) : (
              <Fingerprint className="text-orange-500 animate-pulse" size={20} />
            )}
          </div>
          <h2 className="font-serif italic text-3xl text-white tracking-tight">Timeline Authentication</h2>
          <p className="text-xs text-white/50 font-mono uppercase tracking-[0.15em]">Secure Account Setup</p>
        </div>

        {/* Content Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!otpSent ? (
              /* STAGE 1: Enter Email or Phone */
              <motion.div
                key="send-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                {/* Custom Navigation Tabs */}
                <div className="flex p-0.5 bg-black/40 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => { setMethod('email'); playSound('tick'); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === 'email' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Mail size={13} />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMethod('phone'); playSound('tick'); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      method === 'phone' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} />
                    Phone Number
                  </button>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  {method === 'email' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@domain.com"
                          className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 019-2026"
                          className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3 bg-white hover:bg-neutral-100 text-black rounded-xl font-sans font-bold text-xs uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="animate-spin text-orange-500" size={14} />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Request Verification Code</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-mono text-white/30 uppercase tracking-widest">Or Skip Auth</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={handleVerifyLater}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/80 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen size={13} className="text-orange-500" />
                  <span>Save Profile & Verify Later</span>
                </button>
              </motion.div>
            ) : (
              /* STAGE 2: Verify OTP Passcode */
              <motion.div
                key="verify-otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-1.5 text-center">
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2.5 py-0.5 rounded border border-emerald-900/30 uppercase font-bold tracking-wider inline-block">
                    Verification Code Sent
                  </span>
                  <p className="text-xs text-white/60">
                    We've sent a code to <span className="text-white font-mono">{method === 'email' ? email : phone}</span>.
                  </p>
                </div>

                {/* Instant Live Code Delivery Alert */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center space-y-1 animate-pulse">
                  <p className="text-[10px] text-orange-400 font-mono uppercase tracking-wider font-bold">Preview App Simulator Code:</p>
                  <p className="text-xl font-mono font-black text-white tracking-widest">{generatedOtp}</p>
                  <p className="text-[9px] text-white/40">Since this is an interactive preview, copy this code above to instantly login!</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider block text-center">
                      Enter 6-Digit Code
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/\D/g, ''));
                          playSound('tick');
                        }}
                        placeholder="••••••"
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-center tracking-[0.55em] font-mono text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {success ? (
                    <div className="py-2.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs font-mono text-center rounded-xl flex items-center justify-center gap-2 animate-bounce">
                      <Check size={14} />
                      <span>ACCESS AUTHORIZED</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-3 bg-white hover:bg-neutral-100 text-black rounded-xl font-sans font-bold text-xs uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <span>Submit Code</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-mono text-white/30 uppercase tracking-widest">Or Skip Auth</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={handleVerifyLater}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/80 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen size={13} className="text-orange-500" />
                  <span>Skip & Save Profile</span>
                </button>

                {/* Resend Actions */}
                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <span className="text-[10px] font-mono text-white/30">
                      Resend code in <span className="text-orange-500">{countdown}s</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendOtp()}
                      className="text-[10px] font-mono text-orange-500 hover:text-orange-400 font-bold transition-all underline cursor-pointer"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback error overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="bg-rose-950/15 border border-rose-900/30 text-rose-400 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
                <span className="leading-normal">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live helper status readout */}
        <div className="bg-black border border-white/10 rounded-2xl p-4 shadow-inner space-y-2">
          <div className="flex items-center gap-2 text-white/40 border-b border-white/5 pb-2 mb-1">
            <Terminal size={12} className="text-orange-500" />
            <span className="text-[9px] font-mono uppercase tracking-widest font-black">Status Logs</span>
          </div>
          <div className="font-mono text-[10px] text-emerald-400 space-y-1.5 max-h-[105px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-white/20 select-none">&gt;</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Go back */}
        <div className="text-center">
          <button
            onClick={() => { playSound('tick'); onBack(); }}
            className="text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-wider transition-all cursor-pointer"
          >
            ← Back to Welcome Page
          </button>
        </div>

      </div>
    </div>
  );
}
