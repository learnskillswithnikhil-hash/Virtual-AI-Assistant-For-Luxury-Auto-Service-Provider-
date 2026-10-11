export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  options?: string[];
  leadSummary?: {
    name?: string;
    phone?: string;
    vehicle?: string;
    service?: string;
    preferredDay?: string;
    price?: string;
  };
}

export interface LeadState {
  vehicle?: string;
  service?: 'Interior Detail' | 'Paint Correction' | 'Ceramic Coating' | string;
  estimatedPrice?: string;
  name?: string;
  phone?: string;
  preferredDay?: string;
  isConfirmed?: boolean;
}

export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  service: string;
  preferredDay: string;
  estimatedPrice: string;
  timestamp: string;
  status: 'Confirmed' | 'Dispatch Pending' | 'Completed';
  notes?: string;
}

export interface ServiceItem {
  id: 'interior' | 'correction' | 'coating';
  name: string;
  priceRange: string;
  badge: string;
  duration: string;
  description: string;
  features: string[];
  recommendedFor: string;
  image: string;
}
