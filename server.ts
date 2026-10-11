import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-memory lead storage for Collective Detailing dispatch
interface LeadRecord {
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

const mockInitialLeads: LeadRecord[] = [
  {
    id: 'CD-8041',
    name: 'Harrison Vance',
    phone: '(949) 302-8819',
    vehicle: '2024 Porsche 911 GT3 RS',
    service: 'Ceramic Coating',
    preferredDay: 'This Saturday, 9:00 AM',
    estimatedPrice: '$900 - $1,500',
    timestamp: '14 mins ago',
    status: 'Confirmed',
    notes: 'Requested Gtechniq Ultra + wheels coating',
  },
  {
    id: 'CD-8040',
    name: 'Elena Rostova',
    phone: '(949) 812-4402',
    vehicle: '2023 Tesla Model X Plaid',
    service: 'Interior Detail',
    preferredDay: 'Friday Afternoon',
    estimatedPrice: '$150 - $250',
    timestamp: '42 mins ago',
    status: 'Confirmed',
    notes: 'White leather restoration & child seat sanitation',
  },
  {
    id: 'CD-8039',
    name: 'Marcus Chen',
    phone: '(949) 459-7100',
    vehicle: '2022 BMW M5 Competition',
    service: 'Paint Correction',
    preferredDay: 'Next Tuesday',
    estimatedPrice: '$400 - $700',
    timestamp: '2 hours ago',
    status: 'Confirmed',
    notes: '2-Step correction on Marina Bay Blue metallic',
  },
];

const leads: LeadRecord[] = [...mockInitialLeads];

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const APEX_SYSTEM_INSTRUCTION = `You are "Apex", the virtual booking assistant for Collective Detailing a luxury auto detailing shop in Irvine, CA 92614. Your goal is to welcome website visitors, answer pricing questions politely, qualify vehicle needs, and capture the lead's contact information to schedule an appointment.

Behavior Rules:
1. Greet visitors warmly and ask what vehicle they drive (Year, Make, Model).
2. Ask which service they are interested in (Interior Detail, Paint Correction, or Ceramic Coating).
3. Provide ballpark price estimates based on service selection ($150-$250 for Interior, $400-$700 for Paint Correction, $900-$1,500 for Ceramic Coating).
4. Once the service is chosen, collect their Name, Phone Number, and preferred booking day.
5. Provide a confirmation summary: "Thanks [Name]! Our lead detailer will text your confirmation to [Phone Number] within 30 minutes to lock in your slot."

Tone & Persona Guidelines:
- Professional, welcoming, knowledgeable, refined luxury automotive demeanor.
- Collective Detailing is located at 1621 Alton Pkwy Ste 120, Irvine, CA 92614. Phone: (949) 828-3920.
- If the user asks about packages or what is included, provide concise luxury details:
  - Interior Detail ($150-$250): Deep steam extraction, pH-balanced leather cleansing & conditioning, anti-static dash protection, alcantara revival, cabin sterilization.
  - Paint Correction ($400-$700): Multi-stage rotary & dual-action polishing to eliminate 85%-95% of swirl marks, light scratches, water spots, and oxidation for deep optical mirror clarity.
  - Ceramic Coating ($900-$1,500): 9H diamond-grade hydrophobic barrier, extreme gloss, 3-5 year UV and chemical shield, self-cleaning slickness.
- Keep responses focused, friendly, and naturally guiding towards scheduling. Never deviate from the 5 behavior rules.
- When you confirm the booking, always use the exact phrase format: "Thanks [Name]! Our lead detailer will text your confirmation to [Phone Number] within 30 minutes to lock in your slot."`;

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, leadState } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Format chat history for Gemini contents
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If Gemini API Key is available, attempt real Gemini 3.8 Flash call with 4s timeout
    if (process.env.GEMINI_API_KEY) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: APEX_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const response = await Promise.race([geminiPromise, timeoutPromise]);

        const replyText = response.text;
        if (replyText && replyText.trim()) {
          return res.json({ reply: replyText });
        }
      } catch (genAiError) {
        console.warn('Gemini API call skipped or timed out, executing Apex rule engine:', genAiError);
      }
    }

    // Resilient Apex Rule-Engine Fallback (Strictly follows Behavior Rules 1-5)
    const allUserTexts = messages
      .filter((m: { role: string }) => m.role === 'user')
      .map((m: { content: string }) => m.content)
      .join(' ');
    const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();

    // Check what info we have accumulated
    const hasInterior = allUserTexts.toLowerCase().includes('interior');
    const hasCorrection = allUserTexts.toLowerCase().includes('correction') || allUserTexts.toLowerCase().includes('paint');
    const hasCeramic = allUserTexts.toLowerCase().includes('ceramic') || allUserTexts.toLowerCase().includes('coating');
    const selectedService = hasCeramic ? 'Ceramic Coating' : hasCorrection ? 'Paint Correction' : hasInterior ? 'Interior Detail' : leadState?.service;

    // Check phone number pattern
    const phoneMatch = allUserTexts.match(/(\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
    const capturedPhone = phoneMatch ? phoneMatch[0] : leadState?.phone;

    // Check for vehicle keywords or years
    const hasVehicleYear = allUserTexts.match(/\b(19\d{2}|20\d{2})\b/);
    const makes = ['porsche', 'tesla', 'bmw', 'mercedes', 'audi', 'corvette', 'ferrari', 'lamborghini', 'ford', 'lucid', 'lexus', 'toyota', 'honda', 'rivian', 'mclaren'];
    const hasMake = makes.some(m => allUserTexts.toLowerCase().includes(m));
    const vehicleKnown = Boolean(leadState?.vehicle || hasVehicleYear || hasMake || messages.length > 2);

    let reply = '';

    if (!vehicleKnown) {
      // Rule 1: Greet warmly and ask what vehicle they drive (Year, Make, Model)
      reply = "Welcome to Collective Detailing in Irvine! I'm Apex, your virtual booking assistant. What vehicle do you drive (Year, Make, and Model)?";
    } else if (!selectedService) {
      // Rule 2 & 3: Ask which service they are interested in & provide ballpark price estimates
      reply = "Thanks for letting me know! Which service are you interested in today?\n\n• Interior Detail ($150–$250)\n• Paint Correction ($400–$700)\n• Ceramic Coating ($900–$1,500)\n\nAll services are performed in our private Irvine studio bay.";
    } else if (!capturedPhone) {
      // Rule 3 (ballpark re-confirmation) & Rule 4: Collect Name, Phone Number, and preferred booking day
      const priceText = selectedService === 'Interior Detail' 
        ? '$150-$250' 
        : selectedService === 'Paint Correction' 
        ? '$400-$700' 
        : '$900-$1,500';
      reply = `Excellent choice! The ballpark estimate for our ${selectedService} is ${priceText}.\n\nTo lock in your appointment with our lead detailer, could you please provide your Name, Phone Number, and your preferred booking day?`;
    } else {
      // Rule 5: Provide exact confirmation summary
      // Extract name if provided from leadState or latest user message
      let name = leadState?.name || '';
      const latestMsg = messages[messages.length - 1]?.content || '';
      const nameMatch = latestMsg.match(/(?:my name is|i am|name is|i'm)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
      
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      } else if (!name && latestMsg.includes(',')) {
        const potential = latestMsg.split(',')[0].trim();
        if (potential.length > 1 && potential.length < 25) {
          name = potential;
        }
      }
      
      if (!name) {
        name = 'Valued Client';
      }

      const phone = capturedPhone || '(949) 555-0199';
      reply = `Thanks ${name}! Our lead detailer will text your confirmation to ${phone} within 30 minutes to lock in your slot.`;
    }

    return res.json({ reply });
  } catch (err: unknown) {
    console.error('Error generating chat response:', err);
    return res.status(200).json({
      reply: "Welcome to Collective Detailing in Irvine! What vehicle do you drive (Year, Make, Model)?",
    });
  }
});

// Endpoint to register/save a confirmed booking lead
app.post('/api/leads', (req, res) => {
  try {
    const { name, phone, vehicle, service, preferredDay, estimatedPrice, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newLead: LeadRecord = {
      id: `CD-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      vehicle: vehicle || 'Not specified',
      service: service || 'Custom Detail',
      preferredDay: preferredDay || 'Flexible',
      estimatedPrice: estimatedPrice || 'Custom Quote',
      timestamp: 'Just now',
      status: 'Confirmed',
      notes: notes || '',
    };

    leads.unshift(newLead);
    return res.status(201).json({ success: true, lead: newLead, allLeads: leads });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record lead' });
  }
});

// Endpoint to list leads (for shop dispatch view)
app.get('/api/leads', (_req, res) => {
  return res.json({ leads });
});

// Shop details & packages endpoint
app.get('/api/shop-info', (_req, res) => {
  return res.json({
    name: 'Collective Detailing',
    tagline: 'Luxury Automotive Aesthetics & Preservation',
    location: '1621 Alton Pkwy Ste 120, Irvine, CA 92614',
    phone: '(949) 828-3920',
    email: 'concierge@collectivedetailing.com',
    hours: 'Mon - Sat: 8:00 AM - 6:30 PM | Sun: By Appointment',
    pricingTiers: [
      {
        id: 'interior',
        name: 'Interior Detail',
        priceRange: '$150 – $250',
        badge: 'Deep Rejuvenation',
        duration: '2.5 - 3.5 Hours',
        features: [
          'High-temp steam extraction on all carpeting and floor mats',
          'pH-neutral conditioning & matte restoration for leather & vinyl',
          'Alcantara & suede microfiber revitalizing treatment',
          'Crevice air purge and anti-static UV protection coat',
          'Ozone cabin air sanitization & antimicrobial treatment',
        ],
      },
      {
        id: 'correction',
        name: 'Paint Correction',
        priceRange: '$400 – $700',
        badge: 'Flawless Reflection',
        duration: '5 - 8 Hours',
        features: [
          'Decontamination multi-step foam bath & clay bar exfoliation',
          'Dual-action & rotary machine compound to level micro-scratches',
          'Jeweling polish stage for extreme optical depth and gloss',
          '85% - 95% elimination of swirls, haze, and buffer trails',
          'Paint depth gauge audit & pre-sealant alcohol wipe-down',
        ],
      },
      {
        id: 'coating',
        name: 'Ceramic Coating',
        priceRange: '$900 – $1,500',
        badge: 'Ultimate 9H Shield',
        duration: '1 - 2 Days (Curing included)',
        features: [
          'Full surface preparation & multi-stage optical polish',
          '9H hardness multi-year nano-ceramic glass matrix',
          'Extreme hydrophobic water-beading & self-cleaning effect',
          'Shield against harsh UV rays, chemical fallout & bird etchings',
          'Includes wheels, windshield, and trim ceramic coverage',
        ],
      },
    ],
  });
});

// Live API WebSocket bridge for gemini-3.8-live
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to /live');

  if (!process.env.GEMINI_API_KEY) {
    clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }));
    clientWs.close();
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: APEX_SYSTEM_INSTRUCTION,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          // Model audio chunk (24kHz 16-bit PCM little-endian)
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }

          // User interruption flag
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }

          // Transcription text parts if present
          const textPart = message.serverContent?.modelTurn?.parts?.find(p => p.text);
          if (textPart?.text) {
            clientWs.send(JSON.stringify({ text: textPart.text }));
          }
        },
        onclose: () => {
          console.log('[Live API] Gemini session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close();
          }
        },
        onerror: (err: unknown) => {
          console.error('[Live API] Gemini session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: 'Live session encountered an error' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ connected: true, model: 'gemini-3.8-live' }));

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text && session) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (e) {
        console.warn('[Live API] Error forwarding message from client:', e);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API] Client disconnected');
      if (session) {
        try {
          session.close();
        } catch (e) {
          // ignore
        }
      }
    });
  } catch (err: unknown) {
    console.error('[Live API] Failed to initialize ai.live.connect:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'Failed to connect to Gemini 3.8 Live API' }));
      clientWs.close();
    }
  }
});

// Vite or Static assets handling
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Collective Detailing server running at http://0.0.0.0:${port}`);
});
