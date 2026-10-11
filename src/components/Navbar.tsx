import React from 'react';
import { Sparkles, MapPin, Phone, ShieldCheck, CalendarCheck, Mic } from 'lucide-react';
import { SHOP_DATA } from '../data/shopData';

interface NavbarProps {
  onOpenChat: () => void;
  onOpenDispatch: () => void;
  onOpenVoiceCall: () => void;
  leadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat, onOpenDispatch, onOpenVoiceCall, leadCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-xl">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-neutral-950 px-4 py-1.5 text-xs text-neutral-300 border-b border-amber-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {SHOP_DATA.city}
            </span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="hidden sm:inline text-neutral-400">{SHOP_DATA.address}</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${SHOP_DATA.phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-amber-400 transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-amber-500" />
              <span>{SHOP_DATA.phone}</span>
            </a>
            <span className="hidden md:inline text-neutral-600">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Slots Available This Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border border-amber-500/30 shadow-lg shadow-amber-950/20">
            <span className="font-display font-extrabold text-xl tracking-wider text-amber-400">C</span>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-400/80 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                Collective Detailing
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Irvine
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 tracking-wide hidden sm:block">
              Luxury Automotive Aesthetics &amp; Paint Protection
            </p>
          </div>
        </div>

        {/* Center / Right links & actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden lg:flex items-center gap-6 text-sm text-neutral-300">
            <a href="#services" className="hover:text-amber-400 transition-colors">
              Services &amp; Pricing
            </a>
            <a href="#inspection" className="hover:text-amber-400 transition-colors">
              Paint Inspection
            </a>
            <a href="#reviews" className="hover:text-amber-400 transition-colors">
              Reviews
            </a>
            <a href="#studio" className="hover:text-amber-400 transition-colors">
              Studio Location
            </a>
          </nav>

          {/* Shop Leads / Dispatch Hub button */}
          <button
            onClick={onOpenDispatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900/90 border border-neutral-700/80 hover:border-neutral-600 transition-colors"
            title="View Lead Dispatch / Booked Appointments"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Dispatch Hub</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
              {leadCount}
            </span>
          </button>

          {/* Live Voice Call Button */}
          <button
            onClick={onOpenVoiceCall}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all hover:scale-105 cursor-pointer"
            title="Start Live Voice Conversation with Apex (Gemini 3.8 Live)"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Voice Call</span>
          </button>

          {/* Primary CTA: Apex Booking */}
          <button
            onClick={onOpenChat}
            className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-200 font-semibold"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-950 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-950"></span>
            </span>
            <Sparkles className="w-4 h-4 text-neutral-950" />
            <span>Chat with Apex</span>
          </button>
        </div>
      </div>
    </header>
  );
};
