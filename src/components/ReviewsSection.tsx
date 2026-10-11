import React from 'react';
import { Star, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { REVIEWS } from '../data/shopData';

interface ReviewsSectionProps {
  onOpenApex: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onOpenApex }) => {
  return (
    <section id="reviews" className="py-20 bg-neutral-950 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
              Irvine Client Testimonials
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Orange County's <span className="gold-gradient-text">Trusted Detailing Authority</span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-xl mt-2">
              From Pelican Hill to Shady Canyon, see why collectors and daily drivers trust Collective Detailing and Apex for frictionless booking.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-white">5.0 Star Rating</span>
            <span className="text-xs text-neutral-400">• 140+ Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-amber-400/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {rev.service}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 italic leading-relaxed">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{rev.author}</div>
                  <div className="text-[11px] text-neutral-400">{rev.car}</div>
                </div>
                <div className="text-right text-[11px] text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{rev.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner to Apex */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-neutral-900 via-amber-950/20 to-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">
              Ready to restore your vehicle's factory glow?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Speak with Apex now. Upfront pricing: Interior ($150-$250), Paint Correction ($400-$700), Ceramic ($900-$1,500).
            </p>
          </div>

          <button
            onClick={onOpenApex}
            className="px-6 py-3 rounded-xl font-display font-semibold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Apex Booking</span>
          </button>
        </div>
      </div>
    </section>
  );
};
