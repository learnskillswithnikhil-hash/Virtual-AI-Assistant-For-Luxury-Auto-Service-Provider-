import React from 'react';
import { X, CalendarCheck, Phone, Car, Clock, Shield, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { LeadRecord } from '../types';
import { SHOP_DATA } from '../data/shopData';

interface LeadDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LeadRecord[];
}

export const LeadDispatchModal: React.FC<LeadDispatchModalProps> = ({
  isOpen,
  onClose,
  leads,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Collective Detailing • Lead Dispatch Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Bookings captured in real time by virtual booking assistant <strong className="text-amber-300">Apex</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Rules Notice */}
        <div className="px-6 py-3 bg-amber-950/20 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
          <MessageSquare className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Shop Protocol:</strong> Our lead detailer texts confirmation to the client's phone number within 30 minutes of booking to lock in their slot.
          </span>
        </div>

        {/* Lead List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {leads.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
              <p>No appointments captured yet. Start a conversation with Apex to book one!</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Client & Car Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-base text-white">
                      {lead.name}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {lead.id}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {lead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-medium text-white">{lead.vehicle}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lead.service}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lead.preferredDay}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
                    <div className="flex items-center gap-1 text-amber-300 font-mono">
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.notes && (
                      <span className="text-neutral-500 italic truncate max-w-sm">
                        "{lead.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Estimate & Time info */}
                <div className="md:text-right shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
                  <div className="text-sm font-bold text-amber-400 font-display">
                    {lead.estimatedPrice}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {lead.timestamp}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 text-[11px] text-neutral-300">
                    <span>SMS Dispatch:</span>
                    <span className="text-emerald-400 font-medium">Pending 30m</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>{SHOP_DATA.address}, {SHOP_DATA.city}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
          >
            Close Dispatch Hub
          </button>
        </div>
      </div>
    </div>
  );
};
