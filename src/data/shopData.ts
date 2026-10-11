import { ServiceItem } from '../types';

export const SHOP_DATA = {
  name: 'Collective Detailing',
  tagline: 'Luxury Automotive Aesthetics & Preservation',
  address: '1621 Alton Pkwy Ste 120',
  city: 'Irvine, CA 92614',
  fullAddress: '1621 Alton Pkwy Ste 120, Irvine, CA 92614',
  phone: '(949) 828-3920',
  displayPhone: '(949) 828-3920',
  email: 'vip@collectivedetailing.com',
  hours: 'Mon – Sat: 8:00 AM – 6:30 PM | Sun: Concierge Slots',
  serviceArea: 'Irvine • Newport Beach • Laguna Beach • Costa Mesa • Orange County',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'interior',
    name: 'Interior Detail',
    priceRange: '$150 – $250',
    badge: 'Deep Rejuvenation',
    duration: '2.5 – 3.5 Hours',
    description: 'Bespoke deep cabin restoration. Removes allergens, embedded grit, oils, and restores factory matte leather finish without greasy silicone residue.',
    features: [
      'High-pressure steam extraction for carpet & mats',
      'pH-balanced Swissvax/Colourlock leather cleanse & feed',
      'Alcantara & perforated suede gentle extraction',
      'Compressed air purge of all switches, vents & crevices',
      'Hospital-grade ozone cabin sterilization',
      'Streak-free optical glass clarity inside & out',
    ],
    recommendedFor: 'Daily exotics, family luxury SUVs, seasonal cabin resets',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'correction',
    name: 'Paint Correction',
    priceRange: '$400 – $700',
    badge: 'Optical Clarity',
    duration: '5 – 8 Hours',
    description: 'Precision multi-stage machine compounding and jeweling polish that removes 85%–95% of wash swirls, micro-scratches, water etching, and clear coat haze.',
    features: [
      'Decontaminating foam bath & synthetic clay bar levelling',
      'Digital ultrasonic paint depth audit on all panels',
      'Dual-action Rupes Bigfoot machine compounding',
      'Fine micro-jeweling polish for liquid-deep gloss',
      'Removes spider-web swirls, dealer buffer trails & holograms',
      'Pre-sealant IPA alcohol surface wipe-down',
    ],
    recommendedFor: 'Swirled paint, black & dark exotics, pre-coating prep',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'coating',
    name: 'Ceramic Coating',
    priceRange: '$900 – $1,500',
    badge: 'Ultimate 9H Shield',
    duration: '1 – 2 Days (IR Curing Included)',
    description: 'Permanent 9H diamond-grade ceramic glass matrix chemically bonding to your clear coat. Delivers intense candy-like gloss and hydrophobic self-cleaning slickness.',
    features: [
      'Includes multi-stage machine paint correction foundation',
      'Multi-year 9H nano-ceramic sacrificial barrier',
      'Extreme water & dirt repelling contact angle (>110°)',
      'UV barrier preventing oxidation, sun fade & clear burn',
      'Resistance against bird droppings, acid rain & road salt',
      'Coating applied to painted surfaces, wheel faces & windshield',
    ],
    recommendedFor: 'New vehicle protection, sports cars, supercars & collectors',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
  },
];

export const REVIEWS = [
  {
    author: 'Brandon Thorne',
    location: 'Shady Canyon, Irvine',
    car: '2024 Porsche 911 GT3 RS',
    service: 'Ceramic Coating & Paint Correction',
    quote: 'Apex booked me in 60 seconds on a Tuesday evening. Detailer texted within 15 minutes, and the optical clarity on my GT3 RS is unbelievable. True masters in Irvine.',
    rating: 5,
  },
  {
    author: 'Christine Lin',
    location: 'Irvine Spectrum',
    car: '2023 Tesla Model S Plaid',
    service: 'Interior Detail & Leather Feed',
    quote: 'My white leather interior had denim stains and everyday grime. Collective Detailing made the seats look factory-fresh with zero artificial shine. Apex made scheduling seamless.',
    rating: 5,
  },
  {
    author: 'Devon Vance',
    location: 'Pelican Hill, Newport Coast',
    car: '2022 Aston Martin Vantage',
    service: 'Paint Correction ($400-$700)',
    quote: 'The previous wash place left horrific swirl marks in the British Racing Green paint. Collective Detailing dialed it in to mirror perfection. The transparent pricing upfront is rare for exotics.',
    rating: 5,
  },
];

export const POPULAR_VEHICLES = [
  '2024 Porsche 911 GT3',
  '2023 Tesla Model S Plaid',
  '2024 BMW M4 Competition',
  '2023 Mercedes G63 AMG',
  '2022 Corvette Z06',
  '2024 Lucid Air Sapphire',
  '2023 Audi RS6 Avant',
  '2021 Ferrari F8 Tributo',
];
