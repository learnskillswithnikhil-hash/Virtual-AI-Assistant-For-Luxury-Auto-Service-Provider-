import React, { useState } from 'react';
import { Eye, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState<'paint' | 'interior'>('paint');

  const comparisons = {
    paint: {
      title: 'Paint Correction & Ceramic Shield',
      beforeLabel: 'Before: Wash Swirls, Scratches & Haze',
      afterLabel: 'After: True 95%+ Optical Mirror Finish',
      beforeImg: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      afterImg: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      description: 'Under 1000W inspection LED lights, standard clear coats reveal micro-marring and dealer swirl marks. Our multi-stage machine compounding restores deep black liquid depth.',
    },
    interior: {
      title: 'Deep Interior Steam & Leather Revival',
      beforeLabel: 'Before: Grease, Crevice Dirt & Dullness',
      afterLabel: 'After: Sterile, Matte Factory Rejuvenation',
      beforeImg: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
      afterImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      description: 'High-temperature steam dislodges embedded contaminants while pH-neutral leather conditioners revive supple softness without slippery residue.',
    },
  };

  const current = comparisons[activeTab];

  return (
    <section id="inspection" className="py-20 bg-neutral-900/40 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
              Studio Optical Proof
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Interactive <span className="gold-gradient-text">Transformation Lab</span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-xl mt-2">
              Drag the interactive slider below to witness the level of detail delivered inside our Irvine shop.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => setActiveTab('paint')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'paint'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Paint Correction ($400-$700)
            </button>
            <button
              onClick={() => setActiveTab('interior')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'interior'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Interior Detail ($150-$250)
            </button>
          </div>
        </div>

        {/* Interactive Comparison Container */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950 aspect-[16/9] sm:aspect-[21/9] select-none max-h-[500px]">
          {/* Before image (Full background layer) */}
          <div className="absolute inset-0">
            <img
              src={current.beforeImg}
              alt="Before Detail"
              className="w-full h-full object-cover filter brightness-75 contrast-90"
            />
            {/* Before Badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-black/80 text-rose-300 border border-rose-500/30 text-xs font-medium backdrop-blur-md flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{current.beforeLabel}</span>
            </div>
          </div>

          {/* After image (Clipped overlay layer) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          >
            <img
              src={current.afterImg}
              alt="After Detail"
              className="w-full h-full object-cover filter brightness-110 contrast-125"
            />
            {/* After Badge */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/80 text-emerald-300 border border-emerald-500/30 text-xs font-medium backdrop-blur-md flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{current.afterLabel}</span>
            </div>
          </div>

          {/* Vertical Divider Line and Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-neutral-950 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-xl cursor-ew-resize">
              <span className="text-[10px] font-bold">⇄</span>
            </div>
          </div>

          {/* Slider Input overlay */}
          <input
            type="range"
            min="5"
            max="95"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            aria-label="Before and After visual slider"
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          {/* Bottom explanation ribbon */}
          <div className="absolute bottom-4 left-4 right-4 z-10 px-4 py-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-xs text-neutral-300 flex items-center justify-between">
            <span className="truncate max-w-xl">{current.description}</span>
            <span className="shrink-0 text-amber-400 font-medium ml-4 hidden sm:inline">
              Drag Slider ⇄
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
