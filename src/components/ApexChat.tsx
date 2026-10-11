import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, X, Volume2, VolumeX, Car, CheckCircle2, 
  Clock, Phone, Calendar, User, Shield, RefreshCw, Maximize2, Minimize2,
  AlertCircle, Mic, Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Message, LeadState, LeadRecord } from '../types';
import { playChime, playSuccessChime } from '../utils/audio';
import { POPULAR_VEHICLES, SHOP_DATA } from '../data/shopData';

interface ApexChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: string;
  initialService?: string;
  onLeadCaptured: (lead: LeadRecord) => void;
  onOpenLiveVoice?: () => void;
}

const SERVICE_PRICES: Record<string, string> = {
  'Interior Detail': '$150 – $250',
  'Paint Correction': '$400 – $700',
  'Ceramic Coating': '$900 – $1,500',
};

export const ApexChat: React.FC<ApexChatProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  initialService,
  onLeadCaptured,
  onOpenLiveVoice,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: "Hello! Welcome to Collective Detailing in Irvine, CA 92614. I'm Apex, your virtual booking assistant.\n\nTo get started, what vehicle do you drive (Year, Make, and Model)?",
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Qualified lead state tracked by Apex
  const [leadState, setLeadState] = useState<LeadState>({
    vehicle: initialVehicle || '',
    service: initialService || '',
    estimatedPrice: initialService ? SERVICE_PRICES[initialService] : '',
    name: '',
    phone: '',
    preferredDay: '',
    isConfirmed: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle external vehicle/service selection from hero or cards
  useEffect(() => {
    if (initialVehicle || initialService) {
      setLeadState(prev => {
        const nextService = initialService || prev.service;
        const nextPrice = nextService ? (SERVICE_PRICES[nextService] || '') : prev.estimatedPrice;
        return {
          ...prev,
          vehicle: initialVehicle || prev.vehicle,
          service: nextService,
          estimatedPrice: nextPrice,
        };
      });

      if (initialVehicle && !messages.some(m => m.content.includes(initialVehicle))) {
        handleUserSend(`I drive a ${initialVehicle}${initialService ? ` and I am interested in ${initialService}` : ''}`);
      } else if (initialService && !leadState.vehicle) {
        // Just service selected, ask for vehicle
        setMessages(prev => [
          ...prev,
          {
            id: `msg-svc-${Date.now()}`,
            role: 'assistant',
            content: `Understood! You're looking into our ${initialService} (${SERVICE_PRICES[initialService] || 'Pricing varies'}).\n\nWhat vehicle do you drive (Year, Make, Model) so we can tailor the slot?`,
            timestamp: 'Just now',
          }
        ]);
      }
    }
  }, [initialVehicle, initialService]);

  // Extract lead information heuristically from conversation for instant state feedback
  const extractLeadInfo = (text: string, currentLead: LeadState): Partial<LeadState> => {
    const updates: Partial<LeadState> = {};
    const lower = text.toLowerCase();

    // Check service
    if (lower.includes('interior') || lower.includes('interior detail')) {
      updates.service = 'Interior Detail';
      updates.estimatedPrice = '$150 – $250';
    } else if (lower.includes('paint correction') || lower.includes('correction') || lower.includes('swirl')) {
      updates.service = 'Paint Correction';
      updates.estimatedPrice = '$400 – $700';
    } else if (lower.includes('ceramic') || lower.includes('coating') || lower.includes('ceramic coating')) {
      updates.service = 'Ceramic Coating';
      updates.estimatedPrice = '$900 – $1,500';
    }

    // Check vehicle if not yet detected
    if (!currentLead.vehicle) {
      // Look for year like 2018-2026 or car brands
      const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
      const makes = ['porsche', 'tesla', 'bmw', 'mercedes', 'audi', 'corvette', 'ferrari', 'lamborghini', 'ford', 'lucid', 'lexus', 'toyota', 'honda', 'rivian', 'mclaren'];
      const hasMake = makes.some(m => lower.includes(m));
      if (yearMatch || hasMake || text.length > 5 && !lower.includes('hello') && !lower.includes('hi')) {
        updates.vehicle = text.trim();
      }
    }

    // Check phone number format (e.g., (949) 555-0199 or 949-555-0199 or 10 digits)
    const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
    if (phoneMatch) {
      updates.phone = phoneMatch[0];
    }

    // Check for Name patterns if "my name is X" or "I am X" or comma separated
    const nameMatch = text.match(/(?:my name is|i am|name is|i'm)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      updates.name = nameMatch[1].trim();
    } else if (text.includes(',') && !currentLead.name) {
      const parts = text.split(',');
      if (parts[0] && parts[0].trim().length < 25 && !parts[0].includes('20')) {
        updates.name = parts[0].trim();
      }
    }

    // Preferred day check
    const dayKeywords = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'tomorrow', 'today', 'weekend', 'morning', 'afternoon'];
    const hasDay = dayKeywords.some(d => lower.includes(d));
    if (hasDay) {
      updates.preferredDay = text;
    }

    return updates;
  };

  const handleUserSend = async (contentToSend?: string) => {
    const text = contentToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: 'Just now',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Update local state qualifications
    const detected = extractLeadInfo(text, leadState);
    const updatedLead: LeadState = { ...leadState, ...detected };
    setLeadState(updatedLead);

    try {
      // Call server Gemini endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          leadState: updatedLead,
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const assistantReply = data.reply || "Thank you. Let me coordinate that for your vehicle.";

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: 'Just now',
      };

      setMessages(prev => [...prev, assistantMsg]);
      playChime(soundEnabled);

      // Check if this message was the confirmation summary:
      // "Thanks [Name]! Our lead detailer will text your confirmation to [Phone Number] within 30 minutes to lock in your slot."
      const isConfirmation = assistantReply.toLowerCase().includes('will text your confirmation') ||
                            assistantReply.toLowerCase().includes('within 30 minutes to lock in');

      if (isConfirmation) {
        // Trigger celebratory confetti and success chime!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff']
        });
        playSuccessChime(soundEnabled);

        // Extract name and phone from text if not yet in state
        let finalName = updatedLead.name || 'Valued Client';
        let finalPhone = updatedLead.phone || '(949) 555-0100';

        const nameMatch = assistantReply.match(/Thanks\s+([^!,\n]+)/i);
        if (nameMatch && nameMatch[1]) {
          finalName = nameMatch[1].trim();
        }

        const phoneMatch = assistantReply.match(/to\s+([0-9()\-.\s+]{10,16})\s+within/i);
        if (phoneMatch && phoneMatch[1]) {
          finalPhone = phoneMatch[1].trim();
        }

        const confirmedLead: LeadState = {
          ...updatedLead,
          name: finalName,
          phone: finalPhone,
          isConfirmed: true,
        };
        setLeadState(confirmedLead);

        // Record lead on backend server
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: finalName,
            phone: finalPhone,
            vehicle: confirmedLead.vehicle || 'Qualified Vehicle',
            service: confirmedLead.service || 'Ceramic / Paint Detail',
            preferredDay: confirmedLead.preferredDay || 'Upcoming Saturday',
            estimatedPrice: confirmedLead.estimatedPrice || (confirmedLead.service ? SERVICE_PRICES[confirmedLead.service] : '$400 – $700'),
            notes: 'Captured via Apex Virtual Booking Assistant',
          }),
        })
          .then(res => res.json())
          .then(resData => {
            if (resData.lead) {
              onLeadCaptured(resData.lead);
            }
          })
          .catch(err => console.error('Failed to save lead:', err));
      }
    } catch (err) {
      console.error('Error during Apex chat:', err);
      // Clean fallback response keeping the 5 Behavior Rules
      let fallbackText = '';
      if (!updatedLead.vehicle) {
        fallbackText = "Welcome to Collective Detailing in Irvine! What vehicle do you drive (Year, Make, Model)?";
      } else if (!updatedLead.service) {
        fallbackText = `For your ${updatedLead.vehicle}, which service are you interested in?\n\n• Interior Detail ($150–$250)\n• Paint Correction ($400–$700)\n• Ceramic Coating ($900–$1,500)`;
      } else if (!updatedLead.name || !updatedLead.phone) {
        fallbackText = `Great! For the ${updatedLead.service} (${updatedLead.estimatedPrice || '$400–$700'}), could you share your Name, Phone Number, and preferred booking day?`;
      } else {
        fallbackText = `Thanks ${updatedLead.name || 'there'}! Our lead detailer will text your confirmation to ${updatedLead.phone || 'your phone'} within 30 minutes to lock in your slot.`;
      }

      const fallbackMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, fallbackMsg]);
      playChime(soundEnabled);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: "Hello! Welcome to Collective Detailing in Irvine, CA 92614. I'm Apex, your virtual booking assistant.\n\nTo get started, what vehicle do you drive (Year, Make, and Model)?",
        timestamp: 'Just now',
      },
    ]);
    setLeadState({
      vehicle: '',
      service: '',
      estimatedPrice: '',
      name: '',
      phone: '',
      preferredDay: '',
      isConfirmed: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? 'inset-2 sm:inset-6 md:inset-10' 
        : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[460px] h-[640px] max-h-[90vh]'
    }`}>
      <div className="w-full h-full rounded-2xl glass-panel shadow-2xl border border-neutral-700/80 flex flex-col overflow-hidden bg-neutral-950/95 backdrop-blur-2xl">
        {/* Chat Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-neutral-950" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">Apex</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Collective Detailing
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                <span>Irvine, CA 92614</span>
                <span className="text-neutral-600">•</span>
                <span className="text-emerald-400 font-medium">Virtual Booking Assistant</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 text-neutral-400">
            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105"
                title="Start Real-time Voice Call with Apex (Gemini 3.8 Live)"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden xs:inline">Voice Call</span>
              </button>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleResetConversation}
              title="Reset conversation"
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Minimize' : 'Expand'}
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors hidden sm:block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lead Progress Stepper Banner */}
        <div className="px-4 py-2 bg-neutral-900/80 border-b border-neutral-800/80 text-[11px] flex items-center justify-between overflow-x-auto shrink-0">
          <div className={`flex items-center gap-1 font-medium ${leadState.vehicle ? 'text-amber-400' : 'text-neutral-500'}`}>
            <Car className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{leadState.vehicle ? leadState.vehicle.split(' ').slice(0, 2).join(' ') : '1. Vehicle'}</span>
          </div>
          <span className="text-neutral-700">→</span>
          <div className={`flex items-center gap-1 font-medium ${leadState.service ? 'text-amber-400' : 'text-neutral-500'}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{leadState.service ? leadState.service.split(' ')[0] : '2. Service'}</span>
          </div>
          <span className="text-neutral-700">→</span>
          <div className={`flex items-center gap-1 font-medium ${leadState.estimatedPrice ? 'text-amber-400' : 'text-neutral-500'}`}>
            <span>{leadState.estimatedPrice || '3. Estimate'}</span>
          </div>
          <span className="text-neutral-700">→</span>
          <div className={`flex items-center gap-1 font-medium ${leadState.isConfirmed ? 'text-emerald-400 font-bold' : leadState.phone ? 'text-amber-400' : 'text-neutral-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{leadState.isConfirmed ? 'Confirmed' : '4. Contact'}</span>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                    : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800 rounded-tl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* If assistant gave confirmation summary */}
                  {message.content.toLowerCase().includes('will text your confirmation') && (
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs space-y-2">
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">Lead successfully routed to Collective Detailing dispatch.</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        📍 Studio: {SHOP_DATA.fullAddress} <br />
                        📞 Emergency line: {SHOP_DATA.phone}
                      </div>
                    </div>
                  )}

                  <span className={`block text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-neutral-800' : 'text-neutral-500'
                  }`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-neutral-900 text-neutral-400 border border-neutral-800 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse delay-200"></span>
                <span className="text-[11px] text-neutral-400 ml-1">Apex is crafting your estimate...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Dynamic based on current conversation stage) */}
        <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800/80 space-y-1.5 shrink-0">
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
            <span>Quick Suggestions</span>
            <span className="text-[10px] text-neutral-500">Tap to answer</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {/* If vehicle not entered yet */}
            {!leadState.vehicle && (
              <>
                {POPULAR_VEHICLES.slice(0, 4).map((veh) => (
                  <button
                    key={veh}
                    onClick={() => handleUserSend(`I drive a ${veh}`)}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                  >
                    🚗 {veh}
                  </button>
                ))}
              </>
            )}

            {/* If vehicle is known but service is not */}
            {leadState.vehicle && !leadState.service && (
              <>
                <button
                  onClick={() => handleUserSend('I am interested in Interior Detail ($150-$250)')}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                >
                  ✨ Interior Detail ($150–$250)
                </button>
                <button
                  onClick={() => handleUserSend('I am interested in Paint Correction ($400-$700)')}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                >
                  ⚡ Paint Correction ($400–$700)
                </button>
                <button
                  onClick={() => handleUserSend('I am interested in Ceramic Coating ($900-$1,500)')}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                >
                  🛡️ Ceramic Coating ($900–$1,500)
                </button>
              </>
            )}

            {/* If service chosen, prompt for days */}
            {leadState.service && !leadState.isConfirmed && (
              <>
                <button
                  onClick={() => handleUserSend('This Saturday morning works best for me.')}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                >
                  📅 This Saturday Morning
                </button>
                <button
                  onClick={() => handleUserSend('Friday afternoon works great.')}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                >
                  📅 Friday Afternoon
                </button>
                <button
                  onClick={() => handleUserSend('Next week, whenever the earliest slot is available.')}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 hover:text-amber-300 text-neutral-300 transition-colors"
                >
                  ⚡ Earliest Available Slot
                </button>
              </>
            )}

            {/* If already confirmed */}
            {leadState.isConfirmed && (
              <button
                onClick={handleResetConversation}
                className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium"
              >
                + Schedule Another Vehicle
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSend();
          }}
          className="p-3 bg-neutral-950 border-t border-neutral-800/80 flex items-center gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={
              !leadState.vehicle
                ? "Enter your Year, Make, Model (e.g. 2024 Porsche 911)..."
                : !leadState.service
                ? "Type Interior, Paint Correction, or Ceramic Coating..."
                : "Type your Name, Phone Number, and preferred day..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-60"
          />

          {onOpenLiveVoice && (
            <button
              type="button"
              onClick={onOpenLiveVoice}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-amber-400 hover:text-amber-300 hover:bg-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer"
              title="Speak with Apex (Live Audio)"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title="Send message to Apex"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
