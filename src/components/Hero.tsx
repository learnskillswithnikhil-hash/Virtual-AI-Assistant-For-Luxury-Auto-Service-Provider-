import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shield, Award, CheckCircle2, Car, Clock, Zap, Mic } from 'lucide-react';
import { POPULAR_VEHICLES, SHOP_DATA } from '../data/shopData';

interface HeroProps {
  onStartBookingWithVehicle: (vehicle: string, service?: string) => void;
  onOpenApexChat: () => void;
  onOpenVoiceCall: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartBookingWithVehicle, onOpenApexChat, onOpenVoiceCall }) => {
  const [selectedVehicleInput, setSelectedVehicleInput] = useState('');
  const [selectedServiceQuick, setSelectedServiceQuick] = useState<'Interior Detail' | 'Paint Correction' | 'Ceramic Coating' | ''>('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicleInput.trim() || selectedServiceQuick) {
      onStartBookingWithVehicle(selectedVehicleInput.trim(), selectedServiceQuick || undefined);
    } else {
      onOpenApexChat();
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:py-24 border-b border-neutral-800/80">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Grid line texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Location & Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/30 text-xs text-neutral-300">
              <span className="flex h-2 w-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-amber-300">IRVINE, CA 92614</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-300">Luxury Auto Detailing &amp; Ceramic Studio</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Flawless Paintwork. <br />
              <span className="gold-gradient-text">Instant VIP Booking.</span>
            </h1>

            {/* Subheading with Apex introduction */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl font-light leading-relaxed">
              Welcome to <span className="text-white font-medium">Collective Detailing</span>. Meet{' '}
              <strong className="text-amber-300 font-semibold">Apex</strong>, our intelligent virtual booking assistant.
              Answer a few quick questions about your vehicle, receive upfront ballpark estimates, and secure your spot in under 60 seconds.
            </p>

            {/* 3 Core Services Highlight with Ballpark Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div 
                onClick={() => onStartBookingWithVehicle('', 'Interior Detail')}
                className="cursor-pointer group p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-800/80 transition-all"
              >
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Service 01</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Interior Detail</div>
                <div className="text-xs text-amber-400/90 font-medium mt-1">$150 – $250</div>
              </div>

              <div 
                onClick={() => onStartBookingWithVehicle('', 'Paint Correction')}
                className="cursor-pointer group p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-800/80 transition-all"
              >
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Service 02</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Paint Correction</div>
                <div className="text-xs text-amber-400/90 font-medium mt-1">$400 – $700</div>
              </div>

              <div 
                onClick={() => onStartBookingWithVehicle('', 'Ceramic Coating')}
                className="cursor-pointer group p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-800/80 transition-all"
              >
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Service 03</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Ceramic Coating</div>
                <div className="text-xs text-amber-400/90 font-medium mt-1">$900 – $1,500</div>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-400 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Text Confirmation in 30 Mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>9H Certified Installers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Irvine Studio Bay Facilities</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Apex Quick Booking Launcher */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl glass-panel p-6 sm:p-7 shadow-2xl border border-neutral-700/60 ambient-glow">
              {/* Top Assistant Status Badge */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
                    <Sparkles className="w-5 h-5 text-neutral-950" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-900"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-base font-bold text-white">Apex</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Live Virtual Concierge
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">Collective Detailing • Irvine, CA 92614</p>
                  </div>
                </div>

                <span className="text-[11px] text-amber-400/90 font-mono font-medium">Fast Booking</span>
              </div>

              {/* Apex Prompt speech bubble */}
              <div className="mt-5 p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs sm:text-sm text-neutral-200 space-y-2">
                <p className="font-medium text-amber-300/90 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  "Hello! What vehicle do you drive (Year, Make, Model)?"
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Tell me your vehicle or pick from our Irvine exotics lineup below, and I will quote your exact ballpark and hold a slot for you.
                </p>
              </div>

              {/* Quick Preset Vehicles */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Popular Irvine Garage Vehicles</span>
                  <span className="text-[10px] text-neutral-500">Tap to select</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_VEHICLES.slice(0, 5).map((veh) => (
                    <button
                      key={veh}
                      type="button"
                      onClick={() => setSelectedVehicleInput(veh)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        selectedVehicleInput === veh
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-medium'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {veh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Input Form */}
              <form onSubmit={handleQuickSubmit} className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Your Vehicle (Year, Make, Model)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 2024 Porsche 911 GT3 or 2023 Tesla Model S"
                      value={selectedVehicleInput}
                      onChange={(e) => setSelectedVehicleInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-white text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    <Car className="w-4 h-4 text-neutral-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Service Interested In
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {(['Interior Detail', 'Paint Correction', 'Ceramic Coating'] as const).map((svc) => (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => setSelectedServiceQuick(svc)}
                        className={`p-2 rounded-lg text-[11px] font-medium border transition-all ${
                          selectedServiceQuick === svc
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-display font-semibold text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Chat with Apex</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenVoiceCall}
                    className="w-full py-3 px-4 rounded-xl font-display font-semibold text-xs sm:text-sm text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Mic className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <span>Live Voice Call</span>
                  </button>
                </div>
              </form>

              {/* Sub-badge */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Confirmation texted within 30 min</span>
                </span>
                <span className="text-neutral-500">Irvine Shop Bay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
