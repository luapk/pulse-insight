import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Search, TrendingUp, AlertCircle, Calendar, Users, Target, Zap, Eye, Flame, Copy, Check, Download, FileText, ArrowUpRight, Radar as RadarIcon, Clock, Quote } from 'lucide-react';
import {
  Lightning, Pulse, ChartScatter, MagicWand, ClockCountdown,
  Megaphone, MapTrifold, Binoculars, CalendarHeart, UsersFour, Quotes,
  CheckSquare, Prohibit, FlagBanner, Sparkle
} from '@phosphor-icons/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SYSTEM_PROMPT = `You are PULSE, a senior social intelligence partner for creative directors and social strategists in advertising. You produce sign-off-ready tactical intelligence. Your users are building campaigns — not TikToks.

OPERATING PRINCIPLES:
1. Signal over noise. Lead with the shift, not the symptom.
2. Tension, not topic. Name the cultural tension underneath every trend.
3. Whitespace mapping. Say what competitors are missing.
4. Calibrated confidence. Flag every claim you can't personally verify.
5. Time-decay aware. Every trend gets a decay estimate in weeks.
6. Earned vs paid distinction.

VERIFICATION STANDARD (critical):
You must be ruthlessly honest about what you can and cannot verify from web search:
- Creator handles: Only include a creator if you can verify them from a search result in THIS session. If you're extrapolating from training data, set "verified": false and add a safety_note flagging it.
- Follower counts, growth rates, view counts: Only state specific numbers if you've seen them in a search result. Otherwise use qualitative phrasing ("emerging", "mid-tier", "growing fast") and set "verified": false.
- Hashtags, sounds, formats: Same rule — verified from search, or marked as unverified.
- If you don't have real data, it is better to have fewer items than invented ones. Quality over quantity. Never invent a handle or follower count to fill a slot.

PROCESS:
- If proposition/audience/market missing, ask ONE focused question before searching.
- Otherwise run between 3 and 5 web searches covering: platform-native trends, top 2-3 competitors' recent output, cultural calendar 8-12 weeks ahead, creator ecosystem + brand-safety flags. Batch queries aggressively.
- Synthesise — do not paste search results.
- Do NOT include any <cite> tags or citation markup inside JSON string values. Write clean prose.

CRITICAL OUTPUT RULE:
You MUST return your response as a single valid JSON object. No preamble, no markdown code fences, no <cite> tags, no explanation. Just the JSON.

If you need to ask a clarifying question before searching, return:
{"type": "question", "question": "your single focused question"}

Otherwise return the full brief in this exact schema:

{
  "type": "brief",
  "brand": "Brand name",
  "market": "Market/region",
  "hero_image_query": "2-4 word search query for a cinematic hero image relevant to the brief — e.g. 'wolverine comic dark', 'golden retriever field', 'london skyline blue hour'. Concrete visual nouns only.",
  "executive_summary": {
    "the_read": "One sharp sentence naming the cultural shift. No cite tags, no markup.",
    "the_move": "One sentence on the strategic play.",
    "the_risk": "One sentence on the biggest risk.",
    "headline_stat": {"value": "85M", "label": "descriptor", "verified": true}
  },
  "confidence": {
    "level": "High" | "Medium" | "Low",
    "reasoning": "One line on why",
    "freshness_days": 14
  },
  "trend_positioning": [
    {
      "name": "Short trend label (2-4 words)",
      "opportunity": 85,
      "saturation": 30,
      "platform": "TikTok",
      "note": "One line on why this positioning"
    }
  ],
  "platform_fit": [
    {"platform": "TikTok", "score": 78, "play": "One sentence on how to play it here"},
    {"platform": "Instagram", "score": 72, "play": "..."},
    {"platform": "YouTube", "score": 55, "play": "..."},
    {"platform": "X", "score": 42, "play": "..."}
  ],
  "tensions": [
    {"name": "3-5 word tension name", "unpack": "One sentence unpack"}
  ],
  "trends": [
    {
      "name": "Trend name",
      "platform": "TikTok" | "Instagram" | "YouTube" | "X" | "Cross-platform",
      "velocity": "EXPLODING" | "RISING" | "PEAKING" | "DECLINING",
      "decay_weeks": 3,
      "entry_mode": "Earned" | "Creator" | "Paid" | "Earned + Creator",
      "reach_estimate": "e.g. 40M views — or 'emerging' if not verified",
      "verified": true,
      "mechanic": "What actually makes it work",
      "brand_angle": "Specific execution idea for this brand",
      "risk_flag": "Brand-safety concern or null",
      "example_handle": "@creator — only if verified from search"
    }
  ],
  "whitespace": [
    {"space": "Name of the whitespace", "why_empty": "Why no competitor is in it", "opportunity": "How this brand could plant a flag"}
  ],
  "competitive_read": {
    "competitors": [
      {"name": "Competitor 1", "posture": "One line on current social posture"}
    ],
    "the_gap": "The gap for [brand] is..."
  },
  "calendar": [
    {
      "event": "Event name",
      "date": "DD MMM YYYY",
      "days_away": 21,
      "category": "Sports" | "Entertainment" | "Cultural" | "Industry" | "Holiday" | "Seasonal",
      "why_matters": "Why this matters specifically for this brand",
      "execution_idea": "Concrete idea tied to proposition",
      "lead_time_weeks": 4,
      "too_late": false
    }
  ],
  "creators": [
    {
      "handle": "@handle",
      "platform": "TikTok",
      "followers": "850K — or 'mid-tier' if unverified",
      "growth_30d": "+18% — or 'growing' if unverified",
      "verified": true,
      "relevance": "Why they matter beyond follower count",
      "collab_idea": "Specific format native to their content",
      "safety_note": "Only include a creator if verified via search. If verified: any brand-safety note. If unverified: 'UNVERIFIED — audit before engagement'."
    }
  ],
  "executional_starters": {
    "routes": [
      {
        "route_name": "The strategic angle (e.g. 'The confession', 'The reframe')",
        "platform": "TikTok" | "Instagram" | "X" | "YouTube",
        "trend_used": "Which trend this rides — or null",
        "copy": "The actual post copy",
        "visual": "Visual/format description — one sentence",
        "hashtags": ["#chosen", "#deliberately"],
        "rationale": "The strategic MOVE this route makes — not a paraphrase of the copy"
      }
    ]
  },
  "this_weeks_moves": [
    {"action": "Specific action", "owner": "Social" | "Creative" | "Media" | "Production" | "Strategy", "time_estimate": "e.g. 2 hours"}
  ],
  "do_not": [
    {"item": "Specific thing to avoid", "why": "One line on why"}
  ],
  "unexpected_ideas": [
    {"opportunity": "Opportunity outside the obvious category lane", "why_it_works": "Why this adjacency has creative tension"},
    {"opportunity": "Second unexpected opportunity", "why_it_works": "..."},
    {"opportunity": "Third unexpected opportunity", "why_it_works": "..."}
  ]
}

TREND_POSITIONING GUIDANCE:
This is a 2D plot — opportunity (Y axis, 0-100, how big the upside is for this brand) vs saturation (X axis, 0-100, how crowded the space already is). The sweet spot is high opportunity, low saturation. Include 5-8 trends here, including variety: some safe high-saturation ones, some riskier emerging ones, ideally one or two in the sweet spot. These are the trends you plot — they can overlap with "trends" array but this is specifically a strategic positioning view.

UNEXPECTED IDEAS:
Must be exactly 3. These are the adjacent-culture, unexpected-partnership, cross-vertical-format ideas that make the brief interesting. Each one should feel like it came from a different angle — different sector, different medium, different scale.

EXECUTIONAL STARTERS — CRAFT STANDARD:
Each route a distinct strategic angle. Tonal diversity across the set. At least one provocation route. Apply the Swap Test (would it work for a competitor? kill it) and the So What Test. No obvious puns. No empty parallel structure ("More X. More Y. More Z."). No generic "authentic/elevated/journey" language. Rationale names the technique, not restates the copy.

TONE: Senior creative partner. Confident, specific, directional. No hedging. No generic observations.

OUTPUT PURITY — CRITICAL:
Your entire response must be a single raw JSON object and NOTHING ELSE. No code fences, no preamble, no commentary, no <cite> tags anywhere inside strings.

WRONG (breaks the parser):
  \`\`\`json
  {...}
  \`\`\`

WRONG (breaks the parser):
  Here's your brief:
  {...}

WRONG (cite tags in strings break the display):
  "the_read": "<cite index='1-1'>PlayStation's Wolverine absence</cite> signals Sony is saving reveals"

CORRECT:
  {"the_read": "PlayStation's Wolverine absence signals Sony is saving reveals", ...}

Start your response with { and end it with }. Nothing else.`;

// Bulletproof JSON extraction — handles code fences, preamble, trailing text, and nested braces
function extractJSON(text) {
  if (!text || typeof text !== 'string') return null;
  
  let cleaned = text.trim();
  
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  
  // Find the first { and match balanced braces to find the complete JSON object
  const startIdx = cleaned.indexOf('{');
  if (startIdx === -1) return null;
  
  let depth = 0;
  let inString = false;
  let escape = false;
  let endIdx = -1;
  
  for (let i = startIdx; i < cleaned.length; i++) {
    const char = cleaned[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  
  if (endIdx === -1) return null;
  
  const jsonStr = cleaned.substring(startIdx, endIdx + 1);
  
  const stripCitations = (obj) => {
    if (typeof obj === 'string') {
      // Remove <cite index="...">...</cite> tags, keep inner content
      return obj.replace(/<cite\s+index="[^"]*">/gi, '').replace(/<\/cite>/gi, '');
    }
    if (Array.isArray(obj)) return obj.map(stripCitations);
    if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const key in obj) cleaned[key] = stripCitations(obj[key]);
      return cleaned;
    }
    return obj;
  };
  
  try {
    const parsed = JSON.parse(jsonStr);
    return stripCitations(parsed);
  } catch (e) {
    // Try one more time with common cleanups
    try {
      // Remove trailing commas before closing braces/brackets (common LLM error)
      const repaired = jsonStr
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/([^\\])\n/g, '$1\\n');
      const parsed = JSON.parse(repaired);
      return stripCitations(parsed);
    } catch (e2) {
      console.error('JSON parse failed after cleanup:', e2.message);
      console.error('Attempted JSON:', jsonStr.substring(0, 500));
      return null;
    }
  }
}

export default function PulseApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingStage]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setLoadingStage('Connecting...');

    // Initial rotation for the first few seconds before streaming events arrive
    const initialStages = [
      'Connecting...',
      'Reading the brief...',
      'Planning searches...',
    ];
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      stageIndex = (stageIndex + 1) % initialStages.length;
      setLoadingStage(initialStages[stageIndex]);
    }, 2000);

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 5000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ 
            role: m.role, 
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) 
          })),
          tools: [{ type: 'web_search_20250305', name: 'web_search' }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText.slice(0, 200)}`);
      }

      // Parse streaming SSE response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let searchCount = 0;
      let lastProgressUpdate = Date.now();
      let streamStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // First byte received — kill the initial rotation
        if (!streamStarted) {
          streamStarted = true;
          clearInterval(stageInterval);
        }

        buffer += decoder.decode(value, { stream: true });

        // SSE events end with \n\n — split on that
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // keep incomplete event in buffer

        for (const event of events) {
          if (!event.trim()) continue;

          // Parse event lines
          const lines = event.split('\n');
          let eventType = '';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) eventData = line.slice(6).trim();
          }

          if (!eventData) continue;

          try {
            const parsed = JSON.parse(eventData);

            if (eventType === 'content_block_start') {
              if (parsed.content_block?.type === 'server_tool_use') {
                searchCount++;
                setLoadingStage(`Running search ${searchCount}...`);
              } else if (parsed.content_block?.type === 'text') {
                setLoadingStage('Writing the brief...');
              }
            } else if (eventType === 'content_block_delta') {
              if (parsed.delta?.type === 'text_delta') {
                accumulatedText += parsed.delta.text || '';
                // Update loading stage periodically to show progress
                if (Date.now() - lastProgressUpdate > 1500) {
                  const charCount = accumulatedText.length;
                  setLoadingStage(`Writing brief · ${charCount.toLocaleString()} chars so far...`);
                  lastProgressUpdate = Date.now();
                }
              }
            } else if (eventType === 'message_stop' || parsed.type === 'message_stop') {
              setLoadingStage('Rendering designed brief...');
            } else if (eventType === 'error') {
              throw new Error(parsed.error?.message || 'Stream error');
            }
          } catch (parseErr) {
            // Malformed event — skip silently unless it's our thrown error
            if (parseErr.message.includes('Stream error')) throw parseErr;
          }
        }
      }

      // Bulletproof JSON extraction from accumulated text
      const parsed = extractJSON(accumulatedText);

      setMessages([...newMessages, { 
        role: 'assistant', 
        content: parsed || accumulatedText,
        parsed: !!parsed,
        rawResponse: accumulatedText,
        searches: searchCount
      }]);
    } catch (error) {
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${error.message}. Check your connection and try again.`,
        error: true
      }]);
    } finally {
      clearInterval(stageInterval);
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    { label: 'IAMS Dog · gut health', value: 'IAMS Dog (green sub-brand), UK market. Proposition: proactive gut health as the foundation of a dog\'s vitality. Audience: engaged pet parents 28-45. Competitors: Purina Pro Plan, Royal Canin, Lily\'s Kitchen.' },
    { label: 'PlayStation · Q2 launch', value: 'PlayStation UK. Proposition: play without limits. Audience: 18-34 gamers. Looking for social territories ahead of a major Q2 title drop. Competitors: Xbox, Nintendo.' },
    { label: 'Waymo · London launch', value: 'Waymo London pre-launch. Proposition: the way London should move. Audience: early-adopter Londoners, commuters, urbanists. Competitors: Uber, black cabs, TfL.' },
    { label: 'Temptations · cat obsession', value: 'Temptations cat treats, UK. Proposition: the treat cats obsess over. Audience: cat parents who already anthropomorphise their cats. Competitors: Dreamies, Felix.' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top left, #1a0b3d 0%, #0d1138 30%, #0a1428 65%, #050814 100%)',
      fontFamily: '"Instrument Serif", Georgia, serif'
    }}>
      {/* Ambient glow orbs — blue/violet */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-25 blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen flex flex-col">
        <header className="mb-8">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <h1 className="text-6xl tracking-tight text-white" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
                Pulse
              </h1>
              <span className="text-sm tracking-[0.3em] uppercase text-violet-300" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                v3.0
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs tracking-wider uppercase text-violet-300/80" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live search · Streaming
            </div>
          </div>
          <p className="mt-2 text-violet-200/70 text-lg" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
            Social intelligence for creative directors. Signal, not noise.
          </p>
        </header>

        <main className="flex-1 flex flex-col gap-6">
          {messages.length === 0 ? (
            <WelcomePanel quickPrompts={quickPrompts} onSelect={setInput} />
          ) : (
            <div className="flex-1 space-y-6 overflow-y-auto pb-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {loading && <LoadingPanel stage={loadingStage} />}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="sticky bottom-4">
            <div className="rounded-2xl p-4 border" style={{
              background: 'rgba(20, 15, 45, 0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderColor: 'rgba(139, 92, 246, 0.2)',
              boxShadow: '0 8px 32px rgba(15, 10, 40, 0.4), inset 0 1px 0 rgba(139, 92, 246, 0.15)'
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Brief: brand, market, proposition, audience, competitors…"
                className="w-full bg-transparent resize-none outline-none text-violet-50 placeholder-violet-300/40 text-base"
                style={{ fontFamily: '"Inter", sans-serif', minHeight: '56px', maxHeight: '200px' }}
                rows={2}
                disabled={loading}
              />
              <div className="flex items-center justify-between pt-2 border-t border-violet-500/20">
                <div className="flex items-center gap-2 text-xs text-violet-300/60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <Search className="w-3 h-3" />
                  <span className="tracking-wider uppercase">web search · streaming</span>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                    fontFamily: '"Inter", sans-serif'
                  }}
                >
                  <span>Run brief</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center text-xs text-violet-400/60" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <span className="tracking-[0.2em] uppercase">Claude Sonnet 4 · Live web search · Streaming</span>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #78716c 0%, #1c1917 50%, #78716c 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.5s infinite linear;
        }
        
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .count-up { animation: countUp 0.6s ease-out forwards; }
        
        @keyframes fillBar {
          from { width: 0; }
        }
        .fill-bar { animation: fillBar 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.5s ease-out both; }
      `}</style>
    </div>
  );
}

// ============ WELCOME ============
function WelcomePanel({ quickPrompts, onSelect }) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="rounded-3xl p-8 sm:p-10 border" style={{
        background: 'rgba(20, 15, 45, 0.5)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderColor: 'rgba(139, 92, 246, 0.2)',
        boxShadow: '0 12px 48px rgba(10, 5, 30, 0.5), inset 0 1px 0 rgba(139, 92, 246, 0.15)'
      }}>
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl text-white mb-3" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
            What brand are we reading?
          </h2>
          <p className="text-violet-200/80 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
            Give me the brand, market, proposition, audience, and competitors. I'll return a designed brief with trend positioning, cultural calendar, whitespace map, and three unexpected ideas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelect(prompt.value)}
              className="text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] group"
              style={{
                background: 'rgba(40, 30, 80, 0.5)',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {prompt.label}
                  </div>
                  <div className="text-xs text-violet-200/60 line-clamp-2 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
                    {prompt.value}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-violet-500/20 grid grid-cols-4 gap-4 text-center">
          <StatItem icon={<Eye className="w-4 h-4" />} label="Exec summary" />
          <StatItem icon={<RadarIcon className="w-4 h-4" />} label="Platform radar" />
          <StatItem icon={<Target className="w-4 h-4" />} label="Craft-grade copy" />
          <StatItem icon={<FileText className="w-4 h-4" />} label="PDF export" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-violet-200" style={{
        background: 'rgba(139, 92, 246, 0.2)'
      }}>
        {icon}
      </div>
      <span className="text-xs text-violet-300/70 tracking-wider uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        {label}
      </span>
    </div>
  );
}

function LoadingPanel({ stage }) {
  return (
    <div className="rounded-2xl p-6 border" style={{
      background: 'rgba(20, 15, 45, 0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      boxShadow: '0 8px 32px rgba(10, 5, 30, 0.4)'
    }}>
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-violet-900/40" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
        </div>
        <div className="flex-1">
          <div className="shimmer-text text-lg" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
            {stage}
          </div>
          <div className="text-xs text-stone-500 mt-1 tracking-wider uppercase flex items-center gap-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Streaming · brief renders when complete
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MESSAGE BUBBLE ============
function MessageBubble({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl rounded-2xl px-5 py-3 border border-white/60" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(99, 102, 241, 0.25))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 16px rgba(180, 160, 200, 0.1)'
        }}>
          <div className="text-stone-800 whitespace-pre-wrap" style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="rounded-2xl p-6 border border-red-200 bg-red-50/50">
        <div className="flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div style={{ fontFamily: '"Inter", sans-serif' }}>{message.content}</div>
        </div>
      </div>
    );
  }

  // Handle clarifying question
  if (message.parsed && message.content.type === 'question') {
    return (
      <div className="rounded-2xl p-6 border border-white/60" style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
            background: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)'
          }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 pt-1 text-stone-800" style={{ fontFamily: '"Inter", sans-serif', fontSize: '1rem' }}>
            {message.content.question}
          </div>
        </div>
      </div>
    );
  }

  // Handle unparsed response — show a proper error card, never raw JSON
  if (!message.parsed || !message.content.type) {
    return (
      <div className="rounded-2xl p-8 border border-amber-200" style={{
        background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.6), rgba(255, 255, 255, 0.6))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl text-stone-900 mb-2" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
              Response didn't parse cleanly
            </h3>
            <p className="text-sm text-stone-700 mb-4 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
              The model returned its brief in a format the designer couldn't read — usually because it wrapped the response in code fences or added commentary. Try running the brief again. If it keeps happening, slightly rephrase your input.
            </p>
            <details className="text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <summary className="cursor-pointer hover:text-stone-700 tracking-wider uppercase">Show raw response (for debugging)</summary>
              <div className="mt-3 p-3 rounded-lg bg-stone-900 text-stone-100 max-h-64 overflow-auto">
                <pre className="whitespace-pre-wrap break-words text-[11px]">
                  {message.rawResponse || (typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2))}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return <DesignedBrief brief={message.content} searches={message.searches} />;
}

// ============ THE DESIGNED BRIEF ============
function DesignedBrief({ brief, searches }) {
  const briefRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportingDeck, setExportingDeck] = useState(false);
  const [deckError, setDeckError] = useState(null);

  // Selection state — one Set per selectable section
  const [selections, setSelections] = useState({
    trends: new Set(),
    whitespace: new Set(),
    calendar: new Set(),
    creators: new Set(),
    routes: new Set(),
  });

  const toggleSelection = (section, index) => {
    setSelections(prev => {
      const newSet = new Set(prev[section]);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return { ...prev, [section]: newSet };
    });
  };

  const totalSelected =
    selections.trends.size +
    selections.whitespace.size +
    selections.calendar.size +
    selections.creators.size +
    selections.routes.size;

  const selectAll = () => {
    setSelections({
      trends: new Set((brief.trends || []).map((_, i) => i)),
      whitespace: new Set((brief.whitespace || []).map((_, i) => i)),
      calendar: new Set((brief.calendar || []).map((_, i) => i)),
      creators: new Set((brief.creators || []).map((_, i) => i)),
      routes: new Set(((brief.executional_starters?.routes) || []).map((_, i) => i)),
    });
  };

  const clearAll = () => {
    setSelections({
      trends: new Set(),
      whitespace: new Set(),
      calendar: new Set(),
      creators: new Set(),
      routes: new Set(),
    });
  };

  const handleExportDeck = async () => {
    if (totalSelected === 0) return;
    setExportingDeck(true);
    setDeckError(null);
    try {
      const { generateDeck } = await import('./deckExport.js');
      await generateDeck({ brief, selections });
    } catch (err) {
      console.error('Deck export failed:', err);
      setDeckError(`Deck export failed: ${err?.message || 'unknown error'}`);
    } finally {
      setExportingDeck(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(brief, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setExportError(null);
    
    const element = briefRef.current;
    if (!element) {
      setExportError('Brief not ready yet. Wait a moment and try again.');
      setExporting(false);
      return;
    }

    // Inject a temporary stylesheet that neutralises things html2canvas can't render:
    // - backdrop-filter (glass blur) — capture shows transparent panels
    // - oklch()/color-mix() — crash html2canvas outright
    // We swap them for solid fills that print beautifully, then restore.
    const overrideStyle = document.createElement('style');
    overrideStyle.id = 'pulse-pdf-override';
    overrideStyle.textContent = `
      .pulse-pdf-mode * {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      .pulse-pdf-mode [style*="rgba(255, 255, 255"],
      .pulse-pdf-mode [style*="rgba(255,255,255"] {
        background: #ffffff !important;
      }
      .pulse-pdf-mode {
        background: #ffffff !important;
      }
    `;
    document.head.appendChild(overrideStyle);
    element.classList.add('pulse-pdf-mode');

    // Give the browser a tick to repaint before capture
    await new Promise(r => setTimeout(r, 150));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Extra safety: strip any remaining problematic filters in the clone
          const all = clonedDoc.querySelectorAll('*');
          all.forEach(el => {
            el.style.backdropFilter = 'none';
            el.style.webkitBackdropFilter = 'none';
          });
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Margin for breathing room on printed page
      const margin = 8;
      const contentWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }

      // Add footer to every page
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(7);
      pdf.setTextColor(120);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `PULSE · ${brief.brand || 'Brief'} · ${new Date().toLocaleDateString('en-GB')} · ${i}/${pageCount}`,
          pdfWidth / 2,
          pdfHeight - 4,
          { align: 'center' }
        );
      }

      const filename = `pulse-brief-${(brief.brand || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportError(
        error?.message?.includes('oklch') || error?.message?.includes('color')
          ? 'PDF export failed due to a CSS compatibility issue. Try updating your browser.'
          : `PDF export failed: ${error?.message || 'unknown error'}`
      );
    } finally {
      element.classList.remove('pulse-pdf-mode');
      document.getElementById('pulse-pdf-override')?.remove();
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Prominent action bar */}
      <div className="mb-4 rounded-2xl p-4 border border-white/60 flex items-center justify-between flex-wrap gap-3" style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 4px 16px rgba(180, 160, 200, 0.1)'
      }}>
        <div className="flex items-center gap-2 text-xs text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="tracking-wider uppercase">Brief ready · {searches} searches · {brief.brand}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/80 transition-colors text-stone-600 border border-stone-200" style={{ fontFamily: '"JetBrains Mono", monospace', background: 'rgba(255,255,255,0.6)' }}>
            {copied ? <><Check className="w-3.5 h-3.5" /> copied</> : <><Copy className="w-3.5 h-3.5" /> copy data</>}
          </button>
          <button onClick={handleExportPDF} disabled={exporting} className="text-sm flex items-center gap-2 px-5 py-2 rounded-lg transition-all text-white font-medium hover:scale-[1.02] disabled:opacity-60 disabled:cursor-wait" style={{ 
            fontFamily: '"Inter", sans-serif', 
            background: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {exporting ? <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating PDF...</> : <><Download className="w-4 h-4" /> Export as PDF</>}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="mb-4 rounded-xl p-4 border border-red-200 flex items-start gap-3" style={{
          background: 'rgba(254, 226, 226, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}>
          <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-800" style={{ fontFamily: '"Inter", sans-serif' }}>
            {exportError}
          </div>
          <button
            onClick={() => setExportError(null)}
            className="text-xs text-red-600 hover:text-red-800"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            dismiss
          </button>
        </div>
      )}

      {/* The brief itself */}
      <div ref={briefRef} className="rounded-2xl border border-white/60 overflow-hidden" style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow: '0 12px 40px rgba(180, 160, 200, 0.15)'
      }}>
        <BriefHeader brief={brief} />
        <ExecutiveSummary summary={brief.executive_summary} confidence={brief.confidence} />
        <PlatformFitSection platforms={brief.platform_fit} />
        <TrendPositioningSection positioning={brief.trend_positioning} />
        <TensionsSection tensions={brief.tensions} />
        <TrendsSection trends={brief.trends} selected={selections.trends} onToggle={(i) => toggleSelection('trends', i)} />
        <WhitespaceSection whitespace={brief.whitespace} selected={selections.whitespace} onToggle={(i) => toggleSelection('whitespace', i)} />
        <CompetitiveReadSection read={brief.competitive_read} brand={brief.brand} />
        <CalendarSection calendar={brief.calendar} selected={selections.calendar} onToggle={(i) => toggleSelection('calendar', i)} />
        <CreatorsSection creators={brief.creators} selected={selections.creators} onToggle={(i) => toggleSelection('creators', i)} />
        <ExecutionalStartersSection starters={brief.executional_starters} selected={selections.routes} onToggle={(i) => toggleSelection('routes', i)} />
        <MovesSection moves={brief.this_weeks_moves} />
        <DoNotSection items={brief.do_not} />
        <UnexpectedSection ideas={brief.unexpected_ideas || (brief.the_unexpected ? [brief.the_unexpected] : [])} />
        <BriefFooter brief={brief} />
      </div>

      {deckError && (
        <div className="mt-4 rounded-xl p-4 border border-red-200 flex items-start gap-3" style={{
          background: 'rgba(254, 226, 226, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}>
          <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-800" style={{ fontFamily: '"Inter", sans-serif' }}>
            {deckError}
          </div>
          <button
            onClick={() => setDeckError(null)}
            className="text-xs text-red-600 hover:text-red-800"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            dismiss
          </button>
        </div>
      )}

      {/* Floating deck selection bar — appears when selections exist */}
      {totalSelected > 0 && (
        <div className="sticky bottom-6 mt-6 z-20 fade-in-up">
          <div className="rounded-2xl border-2 p-4 flex items-center justify-between flex-wrap gap-3" style={{
            background: 'rgba(28, 25, 23, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(167, 139, 250, 0.5)',
            boxShadow: '0 16px 48px rgba(28, 25, 23, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.4)'
          }}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-white" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
                  {totalSelected}
                </span>
                <span className="text-xs tracking-[0.2em] uppercase text-stone-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  selected
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300 flex-wrap" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {selections.trends.size > 0 && <span className="px-2 py-0.5 rounded bg-stone-700">{selections.trends.size} trends</span>}
                {selections.whitespace.size > 0 && <span className="px-2 py-0.5 rounded bg-stone-700">{selections.whitespace.size} whitespace</span>}
                {selections.calendar.size > 0 && <span className="px-2 py-0.5 rounded bg-stone-700">{selections.calendar.size} moments</span>}
                {selections.creators.size > 0 && <span className="px-2 py-0.5 rounded bg-stone-700">{selections.creators.size} creators</span>}
                {selections.routes.size > 0 && <span className="px-2 py-0.5 rounded bg-stone-700">{selections.routes.size} routes</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                select all
              </button>
              <button
                onClick={clearAll}
                className="text-xs px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                clear
              </button>
              <button
                onClick={handleExportDeck}
                disabled={exportingDeck}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                  color: '#0f0a28',
                  fontFamily: '"Inter", sans-serif',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)'
                }}
              >
                {exportingDeck ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                    Building deck...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Export deck
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ BRIEF HEADER ============
function BriefHeader({ brief }) {
  const query = encodeURIComponent((brief.hero_image_query || brief.brand || 'abstract').slice(0, 80));
  // Use Unsplash Source — no auth, returns a relevant high-res image for the query
  const heroUrl = `https://source.unsplash.com/1600x600/?${query}`;

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
      {/* Hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("${heroUrl}")`,
          filter: 'saturate(1.1)',
        }}
      />
      {/* Dark gradient overlay for legibility */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(15, 10, 40, 0.85) 0%, rgba(30, 20, 60, 0.65) 40%, rgba(15, 10, 40, 0.45) 100%)'
      }} />
      {/* Violet accent wash */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 10, 40, 0.9) 100%)'
      }} />

      <div className="relative z-10 px-8 py-12">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-violet-200/80 mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              Pulse brief · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h2 className="text-6xl text-white leading-none drop-shadow-lg" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', fontWeight: 400, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {brief.brand}
            </h2>
            {brief.market && (
              <div className="mt-3 text-sm text-violet-100/90" style={{ fontFamily: '"Inter", sans-serif' }}>
                {brief.market}
              </div>
            )}
          </div>
          {brief.hero_image_query && (
            <div className="text-[10px] tracking-[0.2em] uppercase text-violet-200/40 mt-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              ◦ {brief.hero_image_query}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ EXECUTIVE SUMMARY ============
function ExecutiveSummary({ summary, confidence }) {
  if (!summary) return null;
  const confidenceColors = {
    High: { bg: '#16a34a20', text: '#15803d' },
    Medium: { bg: '#ea580c20', text: '#c2410c' },
    Low: { bg: '#dc262620', text: '#b91c1c' }
  };
  const cc = confidenceColors[confidence?.level] || confidenceColors.Medium;

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Lightning size={14} weight="duotone" />} label="Executive summary" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="The read" value={summary.the_read} accent="#ea580c" delay={0.1} />
        <SummaryCard label="The move" value={summary.the_move} accent="#0891b2" delay={0.2} />
        <SummaryCard label="The risk" value={summary.the_risk} accent="#dc2626" delay={0.3} />
      </div>

      {summary.headline_stat && (
        <div className="rounded-xl p-6 border border-white/60 count-up" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(232,240,254,0.5))',
          animationDelay: '0.4s'
        }}>
          <div className="flex items-baseline gap-4 flex-wrap">
            <div className="text-6xl text-stone-900 leading-none" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
              {summary.headline_stat.value}
            </div>
            <div className="text-sm text-stone-600 flex-1" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
              {summary.headline_stat.label}
            </div>
          </div>
        </div>
      )}

      {confidence && (
        <div className="mt-6 flex items-center gap-3 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-md font-medium tracking-wider uppercase" style={{ background: cc.bg, color: cc.text, fontFamily: '"JetBrains Mono", monospace' }}>
            {confidence.level} confidence
          </span>
          <span className="text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Fresh for ~{confidence.freshness_days} days
          </span>
          {confidence.reasoning && (
            <span className="text-stone-600 italic" style={{ fontFamily: '"Inter", sans-serif' }}>
              · {confidence.reasoning}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent, delay }) {
  return (
    <div className="rounded-xl p-5 border border-white/60 fade-in-up" style={{
      background: 'rgba(255,255,255,0.5)',
      animationDelay: `${delay}s`
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-6 rounded-full" style={{ background: accent }} />
        <div className="text-xs tracking-[0.2em] uppercase text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          {label}
        </div>
      </div>
      <div className="text-stone-800 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.95rem', fontWeight: 400 }}>
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)'
      }}>
        {icon}
      </div>
      <h3 className="text-xs tracking-[0.3em] uppercase text-stone-700 font-medium" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        {label}
      </h3>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), transparent)' }} />
    </div>
  );
}

// ============ PLATFORM FIT ============
function TrendPositioningSection({ positioning }) {
  if (!positioning?.length) return null;

  const platformColors = {
    TikTok: '#a78bfa',
    Instagram: '#f0abfc',
    YouTube: '#fca5a5',
    X: '#e0e7ff',
    'Cross-platform': '#c4b5fd'
  };

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<ChartScatter size={14} weight="duotone" />} label="Trend positioning · opportunity vs saturation" />
      
      <div className="rounded-xl p-6 border border-white/60" style={{ background: 'rgba(255,255,255,0.4)' }}>
        {/* The chart */}
        <div className="relative aspect-[16/10] w-full" style={{ minHeight: 340 }}>
          
          {/* Quadrant background tints — sweet spot top-left (high opp, low sat) */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
            <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), transparent)' }} />
            <div />
            <div />
            <div style={{ background: 'linear-gradient(315deg, rgba(239, 68, 68, 0.06), transparent)' }} />
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-stone-200" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-stone-200" />
            {/* Minor grid */}
            {[0.25, 0.75].map(p => (
              <React.Fragment key={p}>
                <div className="absolute left-0 right-0 h-px bg-stone-100" style={{ top: `${p * 100}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-stone-100" style={{ left: `${p * 100}%` }} />
              </React.Fragment>
            ))}
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-2 left-3 text-[10px] tracking-widest uppercase text-green-700/70 font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            ◆ Sweet spot
          </div>
          <div className="absolute top-2 right-3 text-[10px] tracking-widest uppercase text-amber-700/70 font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Crowded bet
          </div>
          <div className="absolute bottom-10 left-3 text-[10px] tracking-widest uppercase text-stone-500 font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Untested
          </div>
          <div className="absolute bottom-10 right-3 text-[10px] tracking-widest uppercase text-red-700/60 font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Skip zone
          </div>

          {/* Axes labels */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap text-[10px] tracking-[0.2em] uppercase text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Opportunity →
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Saturation →
          </div>

          {/* The plotted dots */}
          {positioning.map((t, i) => {
            const x = Math.max(2, Math.min(98, t.saturation || 50));
            const y = Math.max(2, Math.min(98, 100 - (t.opportunity || 50)));
            const color = platformColors[t.platform] || '#a78bfa';
            return (
              <div
                key={i}
                className="absolute group fade-in-up cursor-help"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.08}s`,
                  zIndex: 10 + i,
                }}
              >
                {/* Pulsing halo for high-opportunity, low-saturation */}
                {t.opportunity > 70 && t.saturation < 40 && (
                  <div className="absolute inset-0 rounded-full animate-ping" style={{
                    background: color,
                    opacity: 0.4,
                  }} />
                )}
                <div className="relative rounded-full border-2 border-white shadow-lg" style={{
                  background: color,
                  width: 14,
                  height: 14,
                  boxShadow: `0 2px 8px ${color}80, 0 0 0 2px ${color}20`,
                }} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded bg-stone-900 text-white text-[10px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {t.name}
                  <div className="text-[9px] text-stone-400">{t.platform} · opp {t.opportunity} · sat {t.saturation}</div>
                </div>
                {/* Permanent mini label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-stone-700 whitespace-nowrap pointer-events-none max-w-[100px] text-center leading-tight" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {t.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform legend */}
        <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap gap-4 text-xs">
          {Object.entries(platformColors).map(([platform, color]) => {
            const hasAny = positioning.some(p => p.platform === platform);
            if (!hasAny) return null;
            return (
              <div key={platform} className="flex items-center gap-1.5 text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span>{platform}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend notes list */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {positioning.map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: platformColors[t.platform] || '#a78bfa' }} />
            <div className="flex-1">
              <span className="font-semibold text-stone-800" style={{ fontFamily: '"Inter", sans-serif' }}>{t.name}</span>
              <span className="text-stone-500 ml-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>opp {t.opportunity} · sat {t.saturation}</span>
              {t.note && <div className="text-stone-600 mt-0.5 italic" style={{ fontFamily: '"Inter", sans-serif' }}>{t.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformFitSection({ platforms }) {
  if (!platforms?.length) return null;

  const platformColors = {
    TikTok: '#a78bfa',
    Instagram: '#f0abfc',
    YouTube: '#fca5a5',
    X: '#4f46e5'
  };

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Pulse size={14} weight="duotone" />} label="Platform fit" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {platforms.map((p, i) => (
          <PlatformBar key={p.platform} platform={p} color={platformColors[p.platform]} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

function PlatformBar({ platform, color, delay }) {
  return (
    <div className="rounded-xl p-4 border border-white/60 fade-in-up" style={{ 
      background: 'rgba(255,255,255,0.55)',
      animationDelay: `${delay}s`
    }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="font-semibold text-stone-900" style={{ fontFamily: '"Inter", sans-serif' }}>
            {platform.platform}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl text-stone-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
            {platform.score}
          </span>
          <span className="text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            /100
          </span>
        </div>
      </div>
      
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full fill-bar" style={{ 
          width: `${platform.score}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          animationDelay: `${delay + 0.2}s`
        }} />
      </div>
      
      <div className="text-xs text-stone-600 italic leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
        {platform.play}
      </div>
    </div>
  );
}

// ============ TENSIONS ============
function TensionsSection({ tensions }) {
  if (!tensions?.length) return null;
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<FlagBanner size={14} weight="duotone" />} label="Cultural tensions in play" />
      <div className="space-y-3">
        {tensions.map((t, i) => (
          <div key={i} className="rounded-xl p-5 border border-white/60 fade-in-up" style={{ 
            background: 'linear-gradient(135deg, rgba(255,232,240,0.4), rgba(255,255,255,0.5))',
            animationDelay: `${i * 0.1}s`
          }}>
            <div className="flex items-start gap-4">
              <div className="text-3xl text-stone-300 leading-none" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
                0{i + 1}
              </div>
              <div className="flex-1">
                <div className="text-lg text-stone-900 mb-1" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
                  {t.name}
                </div>
                <div className="text-sm text-stone-700 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
                  {t.unpack}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SELECT CHECKBOX ============
function SelectCheckbox({ isSelected, onClick, label = 'Include in deck' }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center gap-2 px-2.5 py-1 rounded-md transition-all hover:scale-[1.02] active:scale-95"
      style={{
        background: isSelected ? 'rgba(28, 25, 23, 0.92)' : 'rgba(255, 255, 255, 0.65)',
        border: `1px solid ${isSelected ? '#1c1917' : 'rgba(168, 162, 158, 0.4)'}`,
        color: isSelected ? '#ffffff' : '#78716c',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
      title={isSelected ? 'Remove from deck' : 'Add to deck'}
    >
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm" style={{
        background: isSelected ? '#ffffff' : 'transparent',
        border: `1px solid ${isSelected ? '#ffffff' : 'rgba(168, 162, 158, 0.6)'}`,
      }}>
        {isSelected && <Check className="w-2.5 h-2.5" style={{ color: '#1c1917' }} strokeWidth={3} />}
      </span>
      <span>{isSelected ? 'In deck' : label}</span>
    </button>
  );
}

// ============ TRENDS ============
function TrendsSection({ trends, selected, onToggle }) {
  if (!trends?.length) return null;

  const velocityConfig = {
    EXPLODING: { color: '#dc2626', bg: '#fee2e2', icon: '↑↑↑' },
    RISING: { color: '#ea580c', bg: '#ffedd5', icon: '↑↑' },
    PEAKING: { color: '#ca8a04', bg: '#fef3c7', icon: '→' },
    DECLINING: { color: '#64748b', bg: '#f1f5f9', icon: '↓' }
  };

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<TrendingUp size={14} weight="duotone" />} label="Trends worth riding" />
      <div className="space-y-4">
        {trends.map((t, i) => {
          const v = velocityConfig[t.velocity] || velocityConfig.RISING;
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl border overflow-hidden fade-in-up transition-all" style={{
              background: isSelected ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255,255,255,0.55)',
              borderColor: isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.6)',
              animationDelay: `${i * 0.08}s`
            }}>
              <div className="px-5 py-3 border-b border-stone-200/50 flex items-center justify-between flex-wrap gap-2" style={{
                background: 'rgba(255,255,255,0.4)'
              }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-base font-semibold text-stone-900" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {t.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {t.platform}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded flex items-center gap-1.5" style={{ color: v.color, background: v.bg, fontFamily: '"JetBrains Mono", monospace' }}>
                    <span>{v.icon}</span>{t.velocity}
                  </span>
                  <span className="text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    ~{t.decay_weeks}w to saturate
                  </span>
                  {onToggle && <SelectCheckbox isSelected={isSelected} onClick={() => onToggle(i)} />}
                </div>
              </div>
              
              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-3">
                  {t.reach_estimate && (
                    <div>
                      <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Reach</div>
                      <div className="text-xl text-stone-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>{t.reach_estimate}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Entry</div>
                    <div className="text-sm font-medium text-stone-800" style={{ fontFamily: '"Inter", sans-serif' }}>{t.entry_mode}</div>
                  </div>
                  {t.example_handle && (
                    <div>
                      <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Example</div>
                      <div className="text-sm font-medium" style={{ color: '#7c3aed', fontFamily: '"Inter", sans-serif' }}>{t.example_handle}</div>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>The mechanic</div>
                    <div className="text-sm text-stone-700 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>{t.mechanic}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Brand angle</div>
                    <div className="text-sm text-stone-800 leading-relaxed font-medium" style={{ fontFamily: '"Inter", sans-serif' }}>{t.brand_angle}</div>
                  </div>
                  {t.risk_flag && (
                    <div className="flex items-start gap-2 text-xs text-amber-800 p-2 rounded bg-amber-50">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span style={{ fontFamily: '"Inter", sans-serif' }}>{t.risk_flag}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ WHITESPACE ============
function WhitespaceSection({ whitespace, selected, onToggle }) {
  if (!whitespace?.length) return null;
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<MapTrifold size={14} weight="duotone" />} label="Whitespace" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {whitespace.map((w, i) => {
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl p-5 border-2 border-dashed fade-in-up transition-all" style={{ 
              background: isSelected ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255,255,255,0.4)',
              borderColor: isSelected ? 'rgba(139, 92, 246, 0.6)' : '#d6d3d1',
              animationDelay: `${i * 0.1}s`
            }}>
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="text-xs tracking-[0.2em] uppercase text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Open territory
                </div>
                {onToggle && <SelectCheckbox isSelected={isSelected} onClick={() => onToggle(i)} />}
              </div>
              <div className="text-lg text-stone-900 mb-2" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
                {w.space}
              </div>
              <div className="text-xs text-stone-600 mb-3 italic" style={{ fontFamily: '"Inter", sans-serif' }}>
                Why it's empty: {w.why_empty}
              </div>
              <div className="text-sm text-stone-800 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
                {w.opportunity}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ COMPETITIVE READ ============
function CompetitiveReadSection({ read, brand }) {
  if (!read) return null;
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Binoculars size={14} weight="duotone" />} label="Competitive read" />
      <div className="space-y-2 mb-5">
        {read.competitors?.map((c, i) => (
          <div key={i} className="flex items-start gap-4 p-3 rounded-lg border border-white/60 fade-in-up" style={{ 
            background: 'rgba(255,255,255,0.4)',
            animationDelay: `${i * 0.08}s`
          }}>
            <div className="text-sm font-semibold text-stone-900 min-w-[120px]" style={{ fontFamily: '"Inter", sans-serif' }}>
              {c.name}
            </div>
            <div className="text-sm text-stone-700 flex-1" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
              {c.posture}
            </div>
          </div>
        ))}
      </div>
      {read.the_gap && (
        <div className="rounded-xl p-5 border-l-4" style={{
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.18), rgba(99, 102, 241, 0.08))',
          borderLeftColor: '#ea580c'
        }}>
          <div className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            The gap
          </div>
          <div className="text-base text-stone-900 leading-relaxed" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
            {read.the_gap}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CALENDAR ============
function CalendarSection({ calendar, selected, onToggle }) {
  if (!calendar?.length) return null;
  
  const categoryColors = {
    Sports: '#059669',
    Entertainment: '#7c3aed',
    Cultural: '#ea580c',
    Industry: '#0891b2',
    Holiday: '#dc2626',
    Seasonal: '#ca8a04'
  };

  const maxDays = Math.max(...calendar.map(e => e.days_away), 90);

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<CalendarHeart size={14} weight="duotone" />} label="Cultural calendar · next 12 weeks" />
      
      {/* Timeline visualisation */}
      <div className="mb-6 p-4 rounded-xl border border-white/60" style={{ background: 'rgba(255,255,255,0.4)' }}>
        <div className="relative h-16">
          <div className="absolute top-8 left-0 right-0 h-px bg-stone-300" />
          {calendar.map((e, i) => {
            const pos = Math.min((e.days_away / maxDays) * 100, 98);
            const color = categoryColors[e.category] || '#78716c';
            return (
              <div key={i} className="absolute top-0" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                <div className="flex flex-col items-center group cursor-help">
                  <div className="text-[9px] text-stone-500 mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {e.days_away}d
                  </div>
                  <div className="w-3 h-3 rounded-full border-2 border-white fade-in-up" style={{ 
                    background: color,
                    boxShadow: `0 0 0 2px ${color}40`,
                    animationDelay: `${i * 0.1}s`
                  }} />
                  <div className="text-[9px] text-stone-700 mt-1 max-w-[60px] text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {e.event}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-xs text-stone-400" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <span>Today</span>
          <span>4 weeks</span>
          <span>8 weeks</span>
          <span>12 weeks</span>
        </div>
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {calendar.map((e, i) => {
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl border p-4 fade-in-up transition-all" style={{ 
              background: isSelected ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255,255,255,0.55)',
              borderColor: isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.6)',
              animationDelay: `${i * 0.08}s`
            }}>
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-lg font-semibold text-stone-900" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {e.event}
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full" style={{ 
                    background: (categoryColors[e.category] || '#78716c') + '20',
                    color: categoryColors[e.category] || '#78716c',
                    fontFamily: '"JetBrains Mono", monospace'
                  }}>
                    {e.category}
                  </div>
                  <div className="text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {e.date} · {e.days_away} days away
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {e.too_late && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      TOO LATE
                    </span>
                  )}
                  {onToggle && <SelectCheckbox isSelected={isSelected} onClick={() => onToggle(i)} />}
                </div>
              </div>
              <div className="text-sm text-stone-600 mb-2" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
                <span className="font-medium text-stone-800">Why it matters:</span> {e.why_matters}
              </div>
              <div className="text-sm text-stone-700 mb-2 p-3 rounded-lg bg-stone-50/80" style={{ fontFamily: '"Inter", sans-serif' }}>
                <span className="text-xs tracking-wider uppercase text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Execution</span>
                <div className="mt-1">{e.execution_idea}</div>
              </div>
              <div className="text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                Lead time needed: {e.lead_time_weeks} weeks
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ CREATORS ============
function CreatorsSection({ creators, selected, onToggle }) {
  if (!creators?.length) return null;
  
  // Safety notice if any creator is unverified
  const hasUnverified = creators.some(c => c.verified === false);
  
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<UsersFour size={14} weight="duotone" />} label="Rising creators" />
      
      {hasUnverified && (
        <div className="mb-4 rounded-lg p-3 border flex items-start gap-2" style={{
          background: 'rgba(251, 191, 36, 0.1)',
          borderColor: 'rgba(217, 119, 6, 0.25)'
        }}>
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
            Some creators below are flagged <strong>unverified</strong> — they're extrapolated from category knowledge, not confirmed in this session's web search. Audit them personally before any outreach.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creators.map((c, i) => {
          const isSelected = selected?.has(i);
          const isUnverified = c.verified === false;
          return (
            <div key={i} className="rounded-xl p-5 border fade-in-up transition-all relative" style={{ 
              background: isSelected 
                ? 'rgba(167, 139, 250, 0.15)' 
                : isUnverified 
                  ? 'rgba(254, 243, 199, 0.5)' 
                  : 'rgba(255,255,255,0.55)',
              borderColor: isSelected 
                ? 'rgba(139, 92, 246, 0.5)' 
                : isUnverified
                  ? 'rgba(217, 119, 6, 0.35)'
                  : 'rgba(255,255,255,0.6)',
              borderWidth: isUnverified ? '1.5px' : '1px',
              borderStyle: isUnverified ? 'dashed' : 'solid',
              animationDelay: `${i * 0.08}s`
            }}>
              {isUnverified && (
                <div className="absolute top-3 right-3 text-[9px] tracking-[0.2em] uppercase font-bold flex items-center gap-1 px-2 py-0.5 rounded" style={{
                  background: 'rgba(217, 119, 6, 0.15)',
                  color: '#b45309',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  <AlertCircle className="w-2.5 h-2.5" />
                  Unverified
                </div>
              )}
              <div className="flex items-start justify-between mb-3 gap-2">
                <div>
                  <div className="text-lg font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#7c3aed', fontFamily: '"Inter", sans-serif' }}>
                    {c.handle}
                    {c.verified === true && (
                      <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    <span>{c.platform}</span>
                    <span>·</span>
                    <span>{c.followers}</span>
                    {c.growth_30d && (
                      <>
                        <span>·</span>
                        <span className="text-green-700 font-medium flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" />{c.growth_30d}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {onToggle && !isUnverified && <SelectCheckbox isSelected={isSelected} onClick={() => onToggle(i)} />}
              </div>
              <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Relevance</div>
              <div className="text-sm text-stone-700 mb-3" style={{ fontFamily: '"Inter", sans-serif' }}>{c.relevance}</div>
              <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Collab idea</div>
              <div className="text-sm text-stone-800 font-medium mb-3" style={{ fontFamily: '"Inter", sans-serif' }}>{c.collab_idea}</div>
              {c.safety_note && (
                <div className="flex items-start gap-2 text-xs text-stone-600 pt-3 border-t border-stone-200/60">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span style={{ fontFamily: '"Inter", sans-serif' }}>{c.safety_note}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ EXECUTIONAL STARTERS — CRAFT GRADE ============
function ExecutionalStartersSection({ starters, selected, onToggle }) {
  if (!starters?.routes?.length) return null;
  
  const platformColors = {
    TikTok: '#ff0050',
    Instagram: '#e1306c',
    YouTube: '#ff0000',
    X: '#1c1917'
  };

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Quotes size={14} weight="duotone" />} label="Executional starters" />
      
      {starters.note && (
        <div className="mb-5 text-xs italic text-stone-500 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
          {starters.note}
        </div>
      )}

      <div className="space-y-4">
        {starters.routes.map((route, i) => {
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl border overflow-hidden fade-in-up transition-all" style={{ 
              background: isSelected ? 'rgba(167, 139, 250, 0.22)' : 'rgba(255,255,255,0.6)',
              borderColor: isSelected ? 'rgba(139, 92, 246, 0.55)' : 'rgba(255,255,255,0.6)',
              animationDelay: `${i * 0.1}s`
            }}>
              <div className="px-5 py-3 border-b border-stone-200/50 flex items-center justify-between flex-wrap gap-2" style={{
                background: 'linear-gradient(90deg, rgba(232,253,245,0.5), rgba(255,255,255,0.4))'
              }}>
                <div className="flex items-center gap-3">
                  <div className="text-xs tracking-[0.2em] uppercase text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    Route {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="text-base text-stone-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
                    {route.route_name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {route.platform && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ 
                      background: (platformColors[route.platform] || '#78716c') + '20',
                      color: platformColors[route.platform] || '#78716c',
                      fontFamily: '"JetBrains Mono", monospace'
                    }}>
                      {route.platform}
                    </span>
                  )}
                  {onToggle && <SelectCheckbox isSelected={isSelected} onClick={() => onToggle(i)} />}
                </div>
              </div>
            
            <div className="p-5">
              {route.trend_used && (
                <div className="text-xs text-stone-500 mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  Rides: <span className="text-stone-700">{route.trend_used}</span>
                </div>
              )}
              
              {/* The copy — displayed with reverence */}
              <div className="relative my-4 py-4 px-6 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08))',
                borderLeft: '3px solid #1a1a1a'
              }}>
                <div className="absolute top-2 left-2 text-stone-300 text-4xl leading-none" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>"</div>
                <div className="text-lg text-stone-900 leading-relaxed pl-6 whitespace-pre-wrap" style={{ 
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontStyle: route.copy.length < 80 ? 'italic' : 'normal',
                  fontWeight: 400
                }}>
                  {route.copy}
                </div>
              </div>

              {route.visual && (
                <div className="mb-3">
                  <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Visual</div>
                  <div className="text-sm text-stone-700" style={{ fontFamily: '"Inter", sans-serif' }}>{route.visual}</div>
                </div>
              )}

              {route.hashtags?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {route.hashtags.map((h, hi) => (
                    <span key={hi} className="text-xs px-2 py-0.5 rounded bg-cyan-50 font-medium" style={{ color: '#0891b2', fontFamily: '"JetBrains Mono", monospace' }}>
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {route.rationale && (
                <div className="mt-4 pt-3 border-t border-stone-200/60">
                  <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Rationale</div>
                  <div className="text-sm italic text-stone-600 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {route.rationale}
                  </div>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ MOVES ============
function MovesSection({ moves }) {
  if (!moves?.length) return null;
  const ownerColors = {
    Social: '#0891b2',
    Creative: '#ea580c',
    Media: '#7c3aed',
    Production: '#059669',
    Strategy: '#dc2626'
  };
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<ClockCountdown size={14} weight="duotone" />} label="This week's moves" />
      <div className="space-y-2">
        {moves.map((m, i) => (
          <div key={i} className="flex items-start gap-4 p-3 rounded-lg border border-white/60 fade-in-up" style={{
            background: 'rgba(255,255,255,0.4)',
            animationDelay: `${i * 0.08}s`
          }}>
            <div className="flex flex-col items-center justify-center min-w-[48px] h-12 rounded-md" style={{
              background: (ownerColors[m.owner] || '#78716c') + '15'
            }}>
              <div className="text-[9px] tracking-wider uppercase" style={{ color: ownerColors[m.owner] || '#78716c', fontFamily: '"JetBrains Mono", monospace' }}>
                {m.owner}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <div className="text-sm text-stone-800" style={{ fontFamily: '"Inter", sans-serif' }}>{m.action}</div>
            </div>
            <div className="text-xs text-stone-500 pt-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {m.time_estimate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ DO NOT ============
function DoNotSection({ items }) {
  if (!items?.length) return null;
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Prohibit size={14} weight="duotone" />} label="Do not" />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg fade-in-up" style={{
            background: 'rgba(254, 226, 226, 0.3)',
            borderLeft: '3px solid #dc2626',
            animationDelay: `${i * 0.08}s`
          }}>
            <div className="text-sm" style={{ fontFamily: '"Inter", sans-serif' }}>
              <span className="font-semibold text-red-800">✕ {item.item}</span>
              <span className="text-stone-600 italic"> — {item.why}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ UNEXPECTED ============
function UnexpectedSection({ ideas }) {
  if (!ideas?.length) return null;
  const gradients = [
    { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.08))', orb: '#8b5cf6' },
    { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(129, 140, 248, 0.08))', orb: '#3b82f6' },
    { bg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(236, 72, 153, 0.08))', orb: '#a78bfa' },
  ];
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<MagicWand size={14} weight="duotone" />} label="Three unexpected ideas" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ideas.slice(0, 3).map((idea, i) => {
          const g = gradients[i % 3];
          return (
            <div key={i} className="rounded-xl p-6 border border-white/60 relative overflow-hidden fade-in-up" style={{
              background: g.bg,
              animationDelay: `${i * 0.1}s`,
              minHeight: 200,
            }}>
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-40 blur-2xl pointer-events-none" style={{
                background: `radial-gradient(circle, ${g.orb}, transparent)`
              }} />
              <div className="relative">
                <div className="text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3 font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  0{i + 1} · Wildcard
                </div>
                <div className="text-base text-stone-900 mb-3 leading-snug" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', fontSize: '1.15rem' }}>
                  {idea.opportunity}
                </div>
                <div className="text-xs text-stone-600 italic leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
                  {idea.why_it_works}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ FOOTER ============
function BriefFooter({ brief }) {
  return (
    <div className="px-8 py-5 flex items-center justify-between flex-wrap gap-2 text-xs text-stone-500" style={{ 
      background: 'rgba(255,255,255,0.3)',
      fontFamily: '"JetBrains Mono", monospace'
    }}>
      <span className="tracking-[0.2em] uppercase">Pulse v3.0 · Signal, not noise</span>
      <span>{new Date().toLocaleString('en-GB')}</span>
    </div>
  );
}
