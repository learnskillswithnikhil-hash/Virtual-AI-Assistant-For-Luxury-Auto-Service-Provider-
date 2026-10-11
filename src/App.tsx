import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Phone, CalendarCheck, ShieldCheck, MapPin } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { ApexChat } from './components/ApexChat';
import { ApexLiveVoiceModal } from './components/ApexLiveVoiceModal';
import { LeadDispatchModal } from './components/LeadDispatchModal';
import { LeadRecord } from './types';
import { SHOP_DATA } from './data/shopData';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  // Fetch initial leads from server
  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      })
      .catch(err => console.error('Error fetching leads:', err));
  }, []);

  const handleStartBookingWithVehicle = (vehicle: string, service?: string) => {
    setSelectedVehicle(vehicle || undefined);
    setSelectedService(service || undefined);
    setIsChatOpen(true);
  };

  const handleSelectServiceFromCard = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsChatOpen(true);
  };

  const handleLeadCaptured = (newLead: LeadRecord) => {
    setLeads(prev => [newLead, ...prev.filter(l => l.id !== newLead.id)]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation */}
      <Navbar
        onOpenChat={() => {
          setSelectedVehicle(undefined);
          setSelectedService(undefined);
          setIsChatOpen(true);
        }}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenVoiceCall={() => setIsVoiceModalOpen(true)}
        leadCount={leads.length}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Quick Booking Widget */}
        <Hero
          onStartBookingWithVehicle={handleStartBookingWithVehicle}
          onOpenApexChat={() => {
            setSelectedVehicle(undefined);
            setSelectedService(undefined);
            setIsChatOpen(true);
          }}
          onOpenVoiceCall={() => setIsVoiceModalOpen(true)}
        />

        {/* Services & Ballpark Pricing Grid */}
        <ServicesSection onSelectService={handleSelectServiceFromCard} />

        {/* Interactive Before & After Transformation Slider */}
        <BeforeAfterSlider />

        {/* Irvine Client Reviews & Testimonials */}
        <ReviewsSection
          onOpenApex={() => {
            setSelectedVehicle(undefined);
            setSelectedService(undefined);
            setIsChatOpen(true);
          }}
        />
      </main>

      {/* Studio Location & Footer */}
      <Footer
        onOpenApex={() => {
          setSelectedVehicle(undefined);
          setSelectedService(undefined);
          setIsChatOpen(true);
        }}
      />

      {/* Floating Apex Virtual Assistant Trigger Button (Bottom Right) */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {/* Subtle invitation prompt */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/90 border border-amber-500/30 text-xs text-neutral-200 shadow-xl backdrop-blur-md animate-bounce duration-1000">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Need an estimate in Irvine? <strong>Ask Apex</strong></span>
          </div>

          <button
            onClick={() => {
              setSelectedVehicle(undefined);
              setSelectedService(undefined);
              setIsChatOpen(true);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-display font-bold shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Open Apex Virtual Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-neutral-950" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-950"></span>
            </div>
            <span className="text-sm">Apex Booking</span>
          </button>
        </div>
      )}

      {/* Floating or Modal Apex Virtual Assistant */}
      <ApexChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialVehicle={selectedVehicle}
        initialService={selectedService}
        onLeadCaptured={handleLeadCaptured}
        onOpenLiveVoice={() => {
          setIsChatOpen(false);
          setIsVoiceModalOpen(true);
        }}
      />

      {/* Real-Time Live Voice Conversation (Gemini 3.8 Live) */}
      <ApexLiveVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onLeadCaptured={handleLeadCaptured}
        initialVehicle={selectedVehicle}
        initialService={selectedService}
      />

      {/* Lead Dispatch Modal for Shop Records */}
      <LeadDispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        leads={leads}
      />
    </div>
  );
}
