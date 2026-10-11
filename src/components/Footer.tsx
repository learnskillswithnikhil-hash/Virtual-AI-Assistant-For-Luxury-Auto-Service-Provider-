import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { SHOP_DATA } from '../data/shopData';

interface FooterProps {
  onOpenApex: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApex }) => {
  return (
    <footer id="studio" className="bg-neutral-950 text-neutral-400 border-t border-neutral-800">
      {/* Studio Location & Facility Spotlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand & Address Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-amber-500/30 text-amber-400 font-display font-extrabold text-lg">
                C
              </div>
              <div>
                <span className="font-display text-lg font-bold text-white uppercase tracking-tight">
                  Collective Detailing
                </span>
                <p className="text-xs text-amber-400 font-medium">Irvine, CA 92614</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md">
              Collective Detailing is Irvine's specialized luxury auto preservation studio. 
              Our private bay features high-CRI lighting, filtered air filtration, and Rupes Bigfoot certified technicians.
            </p>

            <div className="space-y-2 text-xs text-neutral-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{SHOP_DATA.fullAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${SHOP_DATA.phone.replace(/[^0-9]/g, '')}`} className="hover:text-amber-300">
                  {SHOP_DATA.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{SHOP_DATA.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{SHOP_DATA.hours}</span>
              </div>
            </div>
          </div>

          {/* Service Pricing Summary */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Standard Ballpark Pricing
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Interior Detail</div>
                  <div className="text-[11px] text-neutral-500">Steam, leather feed, sanitize</div>
                </div>
                <div className="font-bold text-amber-400 font-mono">$150 – $250</div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Paint Correction</div>
                  <div className="text-[11px] text-neutral-500">Swirl & scratch leveling</div>
                </div>
                <div className="font-bold text-amber-400 font-mono">$400 – $700</div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Ceramic Coating</div>
                  <div className="text-[11px] text-neutral-500">9H multi-year nano glass shield</div>
                </div>
                <div className="font-bold text-amber-400 font-mono">$900 – $1,500</div>
              </div>
            </div>
          </div>

          {/* Virtual Assistant Card */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Virtual Concierge
            </h4>
            <div className="p-4 rounded-xl bg-gradient-to-b from-neutral-900 to-amber-950/20 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white">Apex Assistant Active</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Qualified vehicle scheduling with confirmation texted within 30 minutes.
              </p>
              <button
                onClick={onOpenApex}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-400 text-neutral-950 font-semibold text-xs hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chat with Apex</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Collective Detailing. All rights reserved. 1621 Alton Pkwy Ste 120, Irvine, CA 92614.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Orange County, California</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">Apex AI Virtual Booking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
