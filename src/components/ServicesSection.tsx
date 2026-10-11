import React from 'react';
import { Check, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { SERVICES } from '../data/shopData';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 bg-neutral-950 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Collective Detailing Menus
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Transparent Pricing. <span className="gold-gradient-text">Master Craftsmanship.</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Every service is executed inside our temperature and humidity controlled studio bay in Irvine, CA 92614.
            Select a service below to chat with Apex and lock in your appointment.
          </p>
        </div>

        {/* 3 Service Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SERVICES.map((service: ServiceItem) => {
            const isHighlight = service.id === 'coating';
            return (
              <div
                key={service.id}
                className={`relative rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 group ${
                  isHighlight
                    ? 'bg-neutral-900/90 border-2 border-amber-500/60 shadow-2xl shadow-amber-500/10'
                    : 'bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Popular / Best Value Ribbon */}
                {isHighlight && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-neutral-950 font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-bl-lg shadow-sm">
                    Flagship Protection
                  </div>
                )}

                {/* Card Top: Image & Header */}
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
                    
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-neutral-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md font-medium">
                        {service.badge}
                      </span>
                      <span className="text-xs text-neutral-300 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-display text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {service.name}
                      </h3>
                    </div>

                    {/* Price Range Display */}
                    <div className="mb-4">
                      <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
                        {service.priceRange}
                      </div>
                      <span className="text-[11px] text-neutral-400">Ballpark estimate for standard passenger vehicles</span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-2 border-t border-neutral-800">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                        Included In Package:
                      </div>
                      {service.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-6 pt-0 mt-6">
                  <button
                    onClick={() => onSelectService(service.name)}
                    className={`w-full py-3 px-4 rounded-xl font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isHighlight
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 hover:border-amber-500/40'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Book {service.name} with Apex</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  <p className="text-[11px] text-center text-neutral-500 mt-2">
                    Recommended for: {service.recommendedFor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
