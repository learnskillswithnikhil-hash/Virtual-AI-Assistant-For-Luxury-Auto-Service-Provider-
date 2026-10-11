import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, PhoneOff, Sparkles, Volume2, ShieldCheck, 
  Car, Calendar, AlertCircle, CheckCircle2, MessageSquare, Radio,
  Send, RefreshCw, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { floatTo16BitPCM, arrayBufferToBase64, LiveAudioPlayer } from '../utils/audioLive';
import { LeadState, LeadRecord } from '../types';
import { SHOP_DATA, POPULAR_VEHICLES } from '../data/shopData';

interface ApexLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCaptured: (lead: LeadRecord) => void;
  initialVehicle?: string;
  initialService?: string;
}

export const ApexLiveVoiceModal: React.FC<ApexLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onLeadCaptured,
  initialVehicle,
  initialService,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'mic_denied' | 'error'
  >('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [textInputInVoice, setTextInputInVoice] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');
  const [leadState, setLeadState] = useState<LeadState>({
    vehicle: initialVehicle || '',
    service: initialService || '',
    estimatedPrice: '',
    name: '',
    phone: '',
    preferredDay: '',
    isConfirmed: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const isMicMutedRef = useRef(false);

  // Sync muted ref
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  // Lead qualification heuristic from transcripts
  const checkLeadUpdates = (text: string) => {
    const lower = text.toLowerCase();
    setLeadState((prev) => {
      const updated = { ...prev };

      // Service checks
      if (lower.includes('interior')) {
        updated.service = 'Interior Detail';
        updated.estimatedPrice = '$150 – $250';
      } else if (lower.includes('paint correction') || lower.includes('correction')) {
        updated.service = 'Paint Correction';
        updated.estimatedPrice = '$400 – $700';
      } else if (lower.includes('ceramic') || lower.includes('coating')) {
        updated.service = 'Ceramic Coating';
        updated.estimatedPrice = '$900 – $1,500';
      }

      // Phone check
      const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
      if (phoneMatch) {
        updated.phone = phoneMatch[0];
      }

      // Check if confirmation summary is spoken
      if (lower.includes('will text your confirmation') || lower.includes('within 30 minutes to lock in')) {
        updated.isConfirmed = true;

        const nameMatch = text.match(/Thanks\s+([^!,\n]+)/i);
        if (nameMatch && nameMatch[1]) {
          updated.name = nameMatch[1].trim();
        }

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff'],
        });

        const newLead: LeadRecord = {
          id: `CD-${Math.floor(1000 + Math.random() * 9000)}`,
          name: updated.name || 'Valued Client',
          phone: updated.phone || '(949) 555-0100',
          vehicle: updated.vehicle || 'Live Qualified Vehicle',
          service: updated.service || 'Ceramic / Paint Detail',
          preferredDay: updated.preferredDay || 'Upcoming Saturday',
          estimatedPrice: updated.estimatedPrice || '$400 – $700',
          timestamp: 'Just now',
          status: 'Confirmed',
          notes: 'Captured via Gemini 3.8 Live Voice Session',
        };

        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.lead) onLeadCaptured(d.lead);
          })
          .catch(() => {});
      }

      return updated;
    });
  };

  const setupMicrophone = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setConnectionStatus('mic_denied');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMicMutedRef.current) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64Audio = arrayBufferToBase64(pcmBuffer);

        wsRef.current.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
      setConnectionStatus('connected');
      return true;
    } catch (err: unknown) {
      // Gracefully handle denied permissions without throwing unhandled exceptions
      console.warn('[Live Voice] Microphone access not granted or unavailable:', err);
      setConnectionStatus('mic_denied');
      return false;
    }
  };

  const startVoiceSession = async () => {
    try {
      setConnectionStatus('connecting');

      // 1. Initialize Player for 24kHz Live Model Audio
      playerRef.current = new LiveAudioPlayer();

      // 2. Connect WebSocket to server Live API endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('[Live Voice] Connected to WebSocket bridge');
        playerRef.current?.resume();

        // 3. Attempt microphone acquisition
        await setupMicrophone();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.audio) {
            setIsModelSpeaking(true);
            playerRef.current?.playChunk(msg.audio);
          }

          if (msg.interrupted) {
            playerRef.current?.stopAndClear();
            setIsModelSpeaking(false);
          }

          if (msg.text) {
            setModelTranscript(msg.text);
            checkLeadUpdates(msg.text);
          }

          if (msg.error) {
            console.warn('[Live Voice] Server message:', msg.error);
          }
        } catch (e) {
          console.error('[Live Voice] Message parse error:', e);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        setConnectionStatus('idle');
      };
    } catch (err) {
      console.error('[Live Voice] Session startup failed:', err);
      setConnectionStatus('error');
    }
  };

  const stopVoiceSession = () => {
    // Stop recording
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close().catch(() => {});
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    // Stop playback
    if (playerRef.current) {
      try {
        playerRef.current.close();
      } catch (e) {}
      playerRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    setConnectionStatus('idle');
    setIsModelSpeaking(false);
  };

  // Send typed prompt into Live API session (Apex will speak the response!)
  const handleSendTextPromptToLive = (customText?: string) => {
    const text = customText || textInputInVoice;
    if (!text.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: text.trim() }));
      checkLeadUpdates(text.trim());
      setTextInputInVoice('');
    } else {
      // Re-trigger start session if disconnected
      startVoiceSession();
    }
  };

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      stopVoiceSession();
    }
    return () => {
      stopVoiceSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-neutral-950" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">Apex Live Voice</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Real-Time Bi-Directional Audio • Irvine Bay</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="End Call and Close"
          >
            <PhoneOff className="w-5 h-5 text-rose-400" />
          </button>
        </div>

        {/* Live Audio Visualizer Core */}
        <div className="py-8 px-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900/40 to-neutral-950">
          {/* Background radial glow */}
          <div className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            isModelSpeaking 
              ? 'bg-amber-500/25 scale-125' 
              : connectionStatus === 'connected' 
              ? 'bg-emerald-500/15 scale-100' 
              : connectionStatus === 'mic_denied'
              ? 'bg-amber-500/10 scale-90'
              : 'bg-neutral-700/10 scale-75'
          }`} />

          {/* Central Pulsing Sphere */}
          <div className="relative flex items-center justify-center my-3">
            <div className={`absolute w-40 h-40 rounded-full border border-amber-400/20 transition-all duration-700 ${
              isModelSpeaking ? 'scale-125 animate-ping opacity-30' : 'scale-100 opacity-20'
            }`} />
            <div className={`absolute w-32 h-32 rounded-full border border-amber-400/40 transition-all duration-500 ${
              isModelSpeaking ? 'scale-110' : 'scale-95'
            }`} />

            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isModelSpeaking
                ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-amber-500/50 scale-105'
                : connectionStatus === 'connected'
                ? 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-2 border-amber-500/50 shadow-neutral-900'
                : 'bg-neutral-900 border border-neutral-800 opacity-80'
            }`}>
              {isModelSpeaking ? (
                <Volume2 className="w-9 h-9 text-neutral-950 animate-bounce" />
              ) : connectionStatus === 'mic_denied' ? (
                <MicOff className="w-8 h-8 text-amber-400/80" />
              ) : (
                <Mic className={`w-8 h-8 transition-colors ${
                  isMicMuted ? 'text-neutral-500' : 'text-amber-400'
                }`} />
              )}
            </div>
          </div>

          {/* Live Status Subtitle */}
          <div className="mt-2 text-center space-y-1 z-10">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? isModelSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse' 
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-500 animate-pulse'
                  : connectionStatus === 'mic_denied'
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`} />
              <span className="text-sm font-semibold text-white tracking-wide">
                {connectionStatus === 'connecting' && 'Connecting to Gemini 3.8 Live API...'}
                {connectionStatus === 'connected' && (isModelSpeaking ? 'Apex Speaking (24kHz Live Audio)...' : isMicMuted ? 'Microphone Muted' : 'Apex Listening (Speak naturally)...')}
                {connectionStatus === 'mic_denied' && 'Microphone Access Needed (Or Type & Listen Below)'}
                {connectionStatus === 'error' && 'Connection Issue (WebSocket / Network)'}
                {connectionStatus === 'idle' && 'Session Ended'}
              </span>
            </div>
          </div>

          {/* If Microphone Permission is Denied Banner */}
          {connectionStatus === 'mic_denied' && (
            <div className="mt-4 w-full max-w-lg p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 z-10 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">Microphone permission was not granted.</p>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Allow microphone permissions in your browser bar to speak, or use <strong>Type &amp; Listen</strong> below to hear Apex's voice response!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={setupMicrophone}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px] hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Grant / Retry Microphone</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Voice / Prompt Chips */}
          <div className="mt-4 w-full max-w-lg z-10 space-y-1.5">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Quick Spoken Prompts</span>
              <span className="text-[10px] text-neutral-500">Tap to send to Apex</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSendTextPromptToLive("I drive a 2024 Porsche 911 GT3 and need Ceramic Coating")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/70 text-neutral-300 hover:text-white transition-colors"
              >
                🏎️ 2024 Porsche 911 (Ceramic)
              </button>
              <button
                type="button"
                onClick={() => handleSendTextPromptToLive("What is the pricing for Paint Correction on my Tesla?")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/70 text-neutral-300 hover:text-white transition-colors"
              >
                ⚡ Paint Correction ($400-$700)
              </button>
              <button
                type="button"
                onClick={() => handleSendTextPromptToLive("My name is David, phone is (949) 555-0199, book Saturday")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/70 text-neutral-300 hover:text-white transition-colors"
              >
                📅 Book Saturday Appointment
              </button>
            </div>
          </div>

          {/* Real-Time Live Transcript Preview */}
          <div className="mt-4 w-full max-w-lg p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-1.5 z-10 shadow-lg">
            <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>Apex Live Output</span>
              <span className="text-amber-400 font-mono">24kHz Audio</span>
            </div>
            {modelTranscript ? (
              <p className="text-neutral-200 italic line-clamp-3 leading-relaxed">
                <strong className="text-amber-400 not-italic">Apex:</strong> "{modelTranscript}"
              </p>
            ) : (
              <p className="text-neutral-500 italic">
                {connectionStatus === 'connected' 
                  ? 'Listening for your voice... Try saying: "I drive a 2024 Porsche 911 GT3 and want Ceramic Coating"'
                  : 'Ready to converse with Apex...'}
              </p>
            )}
          </div>
        </div>

        {/* Lead Progress Snapshot (Dynamic live extraction) */}
        <div className="px-6 py-2.5 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-300 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-400">Vehicle:</span>
            <strong className="text-white truncate max-w-[120px]">{leadState.vehicle || 'Pending'}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-400">Service:</span>
            <strong className="text-amber-300">{leadState.service || 'Select tier'}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Estimate:</span>
            <strong className="text-amber-400 font-mono">{leadState.estimatedPrice || 'Pending'}</strong>
          </div>
        </div>

        {/* Type & Listen Input Bar (Allows conversation even if mic is muted or denied) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendTextPromptToLive();
          }}
          className="p-3 bg-neutral-900/50 border-t border-neutral-800/80 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={textInputInVoice}
            onChange={(e) => setTextInputInVoice(e.target.value)}
            placeholder="Type anything to hear Apex speak back in real time..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!textInputInVoice.trim()}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold disabled:opacity-40 transition-colors cursor-pointer"
            title="Send to Apex Live API"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Bottom Call Controls */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          {/* Mute Button */}
          {connectionStatus === 'connected' ? (
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                isMicMuted
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700'
              }`}
            >
              {isMicMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>
          ) : (
            <button
              onClick={setupMicrophone}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Retry Mic</span>
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
