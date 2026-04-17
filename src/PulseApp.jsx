import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Search, TrendingUp, AlertCircle, Calendar, Users, Target, Zap, Eye, Flame, Copy, Check, Download, FileText, ArrowUpRight, Radar as RadarIcon, Clock, Quote } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SYSTEM_PROMPT = `You are PULSE v3.0, a senior social intelligence partner for creative directors and social strategists in advertising. You operate at the level of an Executive Creative Director or Head of Social Strategy at a Cannes-Grand-Prix-calibre agency. You produce sign-off-ready tactical intelligence. Your users are building campaigns — not TikToks.

OPERATING PRINCIPLES:
1. Signal over noise. Lead with the shift, not the symptom.
2. Tension, not topic. Name the cultural tension underneath every trend.
3. Whitespace mapping. Say what competitors are missing.
4. Calibrated confidence. Flag thin data.
5. Time-decay aware. Every trend gets a decay estimate in weeks.
6. Earned vs paid distinction.

PROCESS:
- If proposition/audience/market missing, ask ONE focused question before searching.
- Otherwise run between 3 and 5 web searches (no more than 5 — you are time-constrained) covering: platform-native trends, top 2-3 competitors' recent output, cultural calendar 8-12 weeks ahead, creator ecosystem + brand-safety flags. Batch queries aggressively — one search can cover multiple topics.
- Synthesise — do not paste search results.

CRITICAL OUTPUT RULE:
You MUST return your response as a single valid JSON object. No preamble, no markdown code fences, no explanation. Just the JSON. The frontend parses this directly.

If you need to ask a clarifying question before searching, return:
{"type": "question", "question": "your single focused question"}

Otherwise return the full brief in this exact schema:

{
  "type": "brief",
  "brand": "Brand name",
  "market": "Market/region",
  "executive_summary": {
    "the_read": "One sharp sentence naming the cultural shift happening around this brand/category.",
    "the_move": "One sentence on the strategic play — what the brand should do.",
    "the_risk": "One sentence flagging the single biggest risk or thing to avoid.",
    "headline_stat": {"value": "85M", "label": "views on category-relevant trend this week"}
  },
  "confidence": {
    "level": "High" | "Medium" | "Low",
    "reasoning": "One line on why",
    "freshness_days": 14,
    "coverage_notes": "What you found vs couldn't verify"
  },
  "platform_fit": [
    {"platform": "TikTok", "score": 78, "audience": 85, "format": 70, "velocity": 90, "saturation_inverse": 67, "play": "One sentence on how to play it."},
    {"platform": "Instagram", "score": 72, "audience": 80, "format": 75, "velocity": 65, "saturation_inverse": 68, "play": "..."},
    {"platform": "YouTube", "score": 55, "audience": 60, "format": 55, "velocity": 45, "saturation_inverse": 60, "play": "..."},
    {"platform": "X", "score": 42, "audience": 50, "format": 35, "velocity": 40, "saturation_inverse": 43, "play": "..."}
  ],
  "tensions": [
    {"name": "3-5 word tension name", "unpack": "One sentence unpack of this cultural tension"},
    {"name": "...", "unpack": "..."}
  ],
  "trends": [
    {
      "name": "Trend name",
      "platform": "TikTok" | "Instagram" | "YouTube" | "X" | "Cross-platform",
      "velocity": "EXPLODING" | "RISING" | "PEAKING" | "DECLINING",
      "decay_weeks": 3,
      "entry_mode": "Earned" | "Creator" | "Paid" | "Earned + Creator",
      "reach_estimate": "e.g. 40M views",
      "mechanic": "What actually makes it work — sound, edit pattern, text overlay convention, duet structure, etc.",
      "brand_angle": "Specific execution idea for this brand",
      "risk_flag": "Any brand-safety, licensing, appropriation, or saturation concern — or null",
      "example_handle": "@top_creator_using_it"
    }
  ],
  "whitespace": [
    {"space": "Name of the whitespace", "why_empty": "Why no competitor is in it", "opportunity": "How this brand could plant a flag"}
  ],
  "competitive_read": {
    "competitors": [
      {"name": "Competitor 1", "posture": "One line on what they're leaning into and avoiding"},
      {"name": "Competitor 2", "posture": "..."},
      {"name": "Competitor 3", "posture": "..."}
    ],
    "the_gap": "The gap for [brand] is..."
  },
  "calendar": [
    {
      "event": "Event name",
      "date": "DD MMM YYYY",
      "days_away": 21,
      "category": "Sports" | "Entertainment" | "Cultural" | "Industry" | "Holiday" | "Seasonal",
      "why_matters": "Why this specifically matters for this brand",
      "execution_idea": "Concrete idea tied to proposition",
      "lead_time_weeks": 4,
      "too_late": false
    }
  ],
  "creators": [
    {
      "handle": "@handle",
      "platform": "TikTok",
      "followers": "850K",
      "growth_30d": "+18%",
      "relevance": "Why they matter beyond follower count",
      "collab_idea": "Specific format native to their content",
      "safety_note": "Brand-safety note or 'Unverified — recommend audit before engagement'"
    }
  ],
  "executional_starters": {
    "note": "These are craft-grade routes informed by D&AD/Cannes-level principles. Each route is a distinct strategic angle, not a tonal variation. Each has a one-line rationale explaining the technique — not paraphrasing the copy.",
    "routes": [
      {
        "route_name": "Short descriptor of the strategic angle (e.g. 'The confession', 'The reframe', 'The cultural truth')",
        "platform": "TikTok" | "Instagram" | "X" | "YouTube",
        "trend_used": "Which trend or cultural moment this rides",
        "copy": "The actual post copy — written to the standard of D&AD Pencil / Cannes Lion work. Should work on two levels, trust the reader, could only be for this brand.",
        "visual": "Visual/format description — one sentence",
        "hashtags": ["#chosen", "#deliberately", "#three_to_five"],
        "rationale": "The strategic MOVE this route makes and WHY it works for this brief. Not a paraphrase of the copy. Names the technique (reframe, cultural truth, subversion, product absence, etc.)."
      }
    ]
  },
  "this_weeks_moves": [
    {"action": "Specific action", "owner": "Social" | "Creative" | "Media" | "Production" | "Strategy", "time_estimate": "e.g. 2 hours"}
  ],
  "do_not": [
    {"item": "Specific thing to avoid", "why": "One line on why"}
  ],
  "the_unexpected": {
    "opportunity": "One opportunity outside the obvious category lane",
    "why_it_works": "Why this adjacency has creative tension"
  }
}

EXECUTIONAL STARTERS — CRAFT STANDARD:
The executional_starters section must meet D&AD Yellow Pencil / Cannes Gold Lion standards. This is non-negotiable.

Before writing routes:
- Identify distinct strategic angles (not tonal variations — different thoughts, different entry points)
- Generate 3 routes minimum, each from a genuinely different angle
- Apply tonal diversity: not all routes in the same emotional register
- At least one route should feel like the one a nervous client would question — the provocation

Apply the self-critique pass to every route. Kill and replace anything that fails:
- The Swap Test: replace brand with competitor — if it still works, it's category-generic, kill it
- The So What Test: if "so what?" has no compelling answer, the thought isn't strong enough
- The Specificity Test: replace any word that could apply to any brand in the category
- The Earn Test: every word must earn its place
- Does it trust the reader? Does it work on two levels? Could only this brand say it?

Anti-patterns to avoid in executional copy:
- The obvious pun. If the pun arrived in under 3 seconds of thinking, kill it.
- Empty parallel structure ("More X. More Y. More Z.") — feels rhythmic but says nothing
- The explain — copy that spells out the joke or the benefit the image already makes
- AI fingerprints — generic "authentic" / "elevated" / "embrace your journey" language
- Sameness across routes — if all 3 routes feel like the same writer in the same mood, rewrite one from a different emotional starting point

Rationale quality: the rationale must name the MOVE (reframe, cultural truth, subversion, product absence, double meaning, incomplete thought) and explain why that move works for this brief. It must not restate the copy in different words.

TONE (throughout): Senior creative partner. Confident, specific, directional. Short sentences where they hit harder. No hedging. No generic observations — "Gen Z values authenticity" is banned.

NON-NEGOTIABLES:
- Always use web search before responding with a brief.
- Use real hashtags, handles, sounds, numbers — or explicitly flag as estimate/unverified.
- Flag every brand-safety concern.
- If a trend doesn't fit, don't include it.

OUTPUT PURITY — CRITICAL:
Your entire response must be a single raw JSON object and NOTHING ELSE. The frontend parses your response directly. Any deviation breaks the app.

WRONG (breaks the parser):
  \`\`\`json
  {...}
  \`\`\`

WRONG (breaks the parser):
  Here's your brief:
  {...}

WRONG (breaks the parser):
  {...}
  Let me know if you'd like adjustments.

CORRECT:
  {...}

Do not use markdown code fences. Do not add preamble. Do not add trailing commentary. Do not explain. Start your response with { and end it with }. Nothing else. This is a machine-readable API response, not a chat message.`;

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
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try one more time with common cleanups
    try {
      // Remove trailing commas before closing braces/brackets (common LLM error)
      const repaired = jsonStr
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/([^\\])\n/g, '$1\\n');
      return JSON.parse(repaired);
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
      background: 'radial-gradient(ellipse at top left, #fef3e8 0%, #fde8f1 25%, #e8f0fe 55%, #e8fdf5 100%)',
      fontFamily: '"Instrument Serif", Georgia, serif'
    }}>
      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(circle, #ffd4a8 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-35 blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(circle, #b8e0ff 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(circle, #ffc8e0 0%, transparent 70%)' }} />

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen flex flex-col">
        <header className="mb-8">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <h1 className="text-6xl tracking-tight" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
                Pulse
              </h1>
              <span className="text-sm tracking-[0.3em] uppercase text-stone-600" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                v3.0
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs tracking-wider uppercase text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live search · Craft grade
            </div>
          </div>
          <p className="mt-2 text-stone-600 text-lg" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
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
            <div className="rounded-2xl p-4 border border-white/60" style={{
              background: 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px rgba(180, 160, 200, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Brief: brand, market, proposition, audience, competitors…"
                className="w-full bg-transparent resize-none outline-none text-stone-800 placeholder-stone-400 text-base"
                style={{ fontFamily: '"Inter", sans-serif', minHeight: '56px', maxHeight: '200px' }}
                rows={2}
                disabled={loading}
              />
              <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                <div className="flex items-center gap-2 text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  <Search className="w-3 h-3" />
                  <span className="tracking-wider uppercase">web search · structured output</span>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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

        <footer className="mt-8 text-center text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          <span className="tracking-[0.2em] uppercase">Claude Sonnet 4 · Live web · D&AD/Cannes craft standard</span>
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
      <div className="rounded-3xl p-8 sm:p-10 border border-white/60" style={{
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow: '0 12px 48px rgba(180, 160, 200, 0.18), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl text-stone-900 mb-3" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
            What brand are we reading?
          </h2>
          <p className="text-stone-600 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
            Give me the brand, market, proposition, audience, and competitors. I'll return a designed brief with an executive summary, platform radar, cultural calendar, whitespace map, and craft-grade executional routes. Export as PDF when you're ready to present.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelect(prompt.value)}
              className="text-left p-4 rounded-xl border border-white/70 hover:border-stone-300 transition-all duration-200 hover:scale-[1.01] group"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #fef3e8, #fde8f1)'
                }}>
                  <Sparkles className="w-3 h-3 text-stone-700" />
                </div>
                <div>
                  <div className="font-medium text-stone-900 text-sm mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {prompt.label}
                  </div>
                  <div className="text-xs text-stone-500 line-clamp-2 leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
                    {prompt.value}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200/60 grid grid-cols-4 gap-4 text-center">
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
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700" style={{
        background: 'rgba(255,255,255,0.6)'
      }}>
        {icon}
      </div>
      <span className="text-xs text-stone-600 tracking-wider uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        {label}
      </span>
    </div>
  );
}

function LoadingPanel({ stage }) {
  return (
    <div className="rounded-2xl p-6 border border-white/60" style={{
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(180, 160, 200, 0.12)'
    }}>
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-stone-800 animate-spin" />
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
          background: 'linear-gradient(135deg, rgba(255,212,168,0.5), rgba(255,200,224,0.4))',
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
        <TensionsSection tensions={brief.tensions} />
        <TrendsSection trends={brief.trends} selected={selections.trends} onToggle={(i) => toggleSelection('trends', i)} />
        <WhitespaceSection whitespace={brief.whitespace} selected={selections.whitespace} onToggle={(i) => toggleSelection('whitespace', i)} />
        <CompetitiveReadSection read={brief.competitive_read} brand={brief.brand} />
        <CalendarSection calendar={brief.calendar} selected={selections.calendar} onToggle={(i) => toggleSelection('calendar', i)} />
        <CreatorsSection creators={brief.creators} selected={selections.creators} onToggle={(i) => toggleSelection('creators', i)} />
        <ExecutionalStartersSection starters={brief.executional_starters} selected={selections.routes} onToggle={(i) => toggleSelection('routes', i)} />
        <MovesSection moves={brief.this_weeks_moves} />
        <DoNotSection items={brief.do_not} />
        <UnexpectedSection unexpected={brief.the_unexpected} />
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
            borderColor: 'rgba(255, 212, 168, 0.4)',
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
                  background: 'linear-gradient(135deg, #ffd4a8, #ffc8e0)',
                  color: '#1c1917',
                  fontFamily: '"Inter", sans-serif',
                  boxShadow: '0 4px 16px rgba(255, 212, 168, 0.3)'
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
  return (
    <div className="px-8 py-8 border-b border-stone-200/60" style={{
      background: 'linear-gradient(135deg, rgba(255,212,168,0.3), rgba(184,224,255,0.25))'
    }}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Pulse brief · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h2 className="text-5xl text-stone-900 leading-none" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
            {brief.brand}
          </h2>
          {brief.market && (
            <div className="mt-2 text-sm text-stone-600" style={{ fontFamily: '"Inter", sans-serif' }}>
              {brief.market}
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
      <SectionLabel icon={<Zap className="w-3 h-3" />} label="Executive summary" />
      
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
    <div className="flex items-center gap-2 mb-5">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-stone-900 text-white">
        {icon}
      </div>
      <h3 className="text-xs tracking-[0.3em] uppercase text-stone-700 font-medium" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        {label}
      </h3>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  );
}

// ============ PLATFORM FIT ============
function PlatformFitSection({ platforms }) {
  if (!platforms?.length) return null;

  const radarData = platforms.map(p => ({
    platform: p.platform,
    Audience: p.audience,
    Format: p.format,
    Velocity: p.velocity,
    Saturation: p.saturation_inverse
  }));

  const firstPlatform = platforms[0];
  const radarAngles = firstPlatform ? [
    { subject: 'Audience', ...Object.fromEntries(platforms.map(p => [p.platform, p.audience])) },
    { subject: 'Format', ...Object.fromEntries(platforms.map(p => [p.platform, p.format])) },
    { subject: 'Velocity', ...Object.fromEntries(platforms.map(p => [p.platform, p.velocity])) },
    { subject: 'Saturation', ...Object.fromEntries(platforms.map(p => [p.platform, p.saturation_inverse])) }
  ] : [];

  const platformColors = {
    TikTok: '#ff0050',
    Instagram: '#e1306c',
    YouTube: '#ff0000',
    X: '#1c1917'
  };

  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<RadarIcon className="w-3 h-3" />} label="Platform fit" />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-xl p-4 border border-white/60" style={{ background: 'rgba(255,255,255,0.4)' }}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarAngles}>
              <PolarGrid stroke="#d6d3d1" strokeDasharray="2 4" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#57534e', fontFamily: 'JetBrains Mono' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              {platforms.map((p) => (
                <Radar
                  key={p.platform}
                  name={p.platform}
                  dataKey={p.platform}
                  stroke={platformColors[p.platform] || '#78716c'}
                  fill={platformColors[p.platform] || '#78716c'}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 space-y-3">
          {platforms.map((p, i) => (
            <PlatformBar key={p.platform} platform={p} color={platformColors[p.platform]} delay={i * 0.1} />
          ))}
        </div>
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
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Aud', val: platform.audience },
          { label: 'Fmt', val: platform.format },
          { label: 'Vel', val: platform.velocity },
          { label: 'Sat', val: platform.saturation_inverse }
        ].map(m => (
          <div key={m.label} className="text-center">
            <div className="text-xs text-stone-500 tracking-wider uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{m.label}</div>
            <div className="text-sm font-medium text-stone-800">{m.val}</div>
          </div>
        ))}
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
      <SectionLabel icon={<Zap className="w-3 h-3" />} label="Cultural tensions in play" />
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
      <SectionLabel icon={<TrendingUp className="w-3 h-3" />} label="Trends worth riding" />
      <div className="space-y-4">
        {trends.map((t, i) => {
          const v = velocityConfig[t.velocity] || velocityConfig.RISING;
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl border overflow-hidden fade-in-up transition-all" style={{
              background: isSelected ? 'rgba(255, 248, 225, 0.75)' : 'rgba(255,255,255,0.55)',
              borderColor: isSelected ? 'rgba(28, 25, 23, 0.3)' : 'rgba(255,255,255,0.6)',
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
      <SectionLabel icon={<Target className="w-3 h-3" />} label="Whitespace" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {whitespace.map((w, i) => {
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl p-5 border-2 border-dashed fade-in-up transition-all" style={{ 
              background: isSelected ? 'rgba(255, 248, 225, 0.75)' : 'rgba(255,255,255,0.4)',
              borderColor: isSelected ? 'rgba(28, 25, 23, 0.4)' : '#d6d3d1',
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
      <SectionLabel icon={<Eye className="w-3 h-3" />} label="Competitive read" />
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
          background: 'linear-gradient(90deg, rgba(255,232,168,0.4), rgba(255,255,255,0.3))',
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
      <SectionLabel icon={<Calendar className="w-3 h-3" />} label="Cultural calendar · next 12 weeks" />
      
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
              background: isSelected ? 'rgba(255, 248, 225, 0.75)' : 'rgba(255,255,255,0.55)',
              borderColor: isSelected ? 'rgba(28, 25, 23, 0.3)' : 'rgba(255,255,255,0.6)',
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
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Users className="w-3 h-3" />} label="Rising creators" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creators.map((c, i) => {
          const isSelected = selected?.has(i);
          return (
            <div key={i} className="rounded-xl p-5 border fade-in-up transition-all" style={{ 
              background: isSelected ? 'rgba(255, 248, 225, 0.75)' : 'rgba(255,255,255,0.55)',
              borderColor: isSelected ? 'rgba(28, 25, 23, 0.3)' : 'rgba(255,255,255,0.6)',
              animationDelay: `${i * 0.08}s`
            }}>
              <div className="flex items-start justify-between mb-3 gap-2">
                <div>
                  <div className="text-lg font-semibold mb-1" style={{ color: '#7c3aed', fontFamily: '"Inter", sans-serif' }}>
                    {c.handle}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
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
                {onToggle && <SelectCheckbox isSelected={isSelected} onClick={() => onToggle(i)} />}
              </div>
              <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Relevance</div>
              <div className="text-sm text-stone-700 mb-3" style={{ fontFamily: '"Inter", sans-serif' }}>{c.relevance}</div>
              <div className="text-xs text-stone-500 tracking-wider uppercase mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Collab idea</div>
              <div className="text-sm text-stone-800 font-medium mb-3" style={{ fontFamily: '"Inter", sans-serif' }}>{c.collab_idea}</div>
              {c.safety_note && (
                <div className="flex items-start gap-2 text-xs text-stone-500 pt-3 border-t border-stone-200/60">
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
      <SectionLabel icon={<Quote className="w-3 h-3" />} label="Executional starters · craft grade" />
      
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
              background: isSelected ? 'rgba(255, 248, 225, 0.85)' : 'rgba(255,255,255,0.6)',
              borderColor: isSelected ? 'rgba(28, 25, 23, 0.35)' : 'rgba(255,255,255,0.6)',
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
                background: 'linear-gradient(135deg, rgba(255,232,168,0.3), rgba(255,200,224,0.2))',
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
      <SectionLabel icon={<Clock className="w-3 h-3" />} label="This week's moves" />
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
      <SectionLabel icon={<AlertCircle className="w-3 h-3" />} label="Do not" />
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
function UnexpectedSection({ unexpected }) {
  if (!unexpected) return null;
  return (
    <div className="px-8 py-8 border-b border-stone-200/60">
      <SectionLabel icon={<Sparkles className="w-3 h-3" />} label="The unexpected" />
      <div className="rounded-xl p-6 border border-white/60 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(255,212,168,0.4), rgba(255,200,224,0.3), rgba(184,224,255,0.3))'
      }}>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-30 blur-2xl" style={{
          background: 'radial-gradient(circle, #ffd4a8, transparent)'
        }} />
        <div className="relative">
          <div className="text-xl text-stone-900 mb-3 leading-relaxed" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
            {unexpected.opportunity}
          </div>
          <div className="text-sm text-stone-700 italic" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300 }}>
            {unexpected.why_it_works}
          </div>
        </div>
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
