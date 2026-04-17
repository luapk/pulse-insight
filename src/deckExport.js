// Lazy-loaded deck generator. Called only when user clicks Export Deck.
// Keeps pptxgenjs (~500KB) out of the initial bundle.

import PptxGenJS from 'pptxgenjs';

// Design tokens — aligned with the app's glass aesthetic but tuned for print/presentation
const TOKENS = {
  colors: {
    ink: '1A1A1A',
    paper: 'FFFFFF',
    cream: 'FEF3E8',
    peach: 'FFD4A8',
    pink: 'FFC8E0',
    blue: 'B8E0FF',
    mint: 'E8FDF5',
    stone900: '1C1917',
    stone700: '44403C',
    stone500: '78716C',
    stone300: 'D6D3D1',
    stone200: 'E7E5E4',
    stone100: 'F5F5F4',
    accent_read: 'EA580C',
    accent_move: '0891B2',
    accent_risk: 'DC2626',
    accent_tiktok: 'FF0050',
    accent_instagram: 'E1306C',
    accent_youtube: 'FF0000',
    accent_x: '1C1917',
  },
  fonts: {
    display: 'Georgia',      // stand-in for Instrument Serif
    body: 'Calibri',         // safe cross-platform sans
    mono: 'Consolas',
  },
};

const SLIDE_W = 13.333; // 16:9 widescreen
const SLIDE_H = 7.5;

// ============ HELPERS ============

function addHeader(slide, { section, brandName }) {
  slide.addText(section.toUpperCase(), {
    x: 0.5, y: 0.3, w: 10, h: 0.3,
    fontFace: TOKENS.fonts.mono,
    fontSize: 9,
    color: TOKENS.colors.stone500,
    charSpacing: 4,
    bold: false,
  });
  slide.addText(brandName || '', {
    x: SLIDE_W - 3.5, y: 0.3, w: 3, h: 0.3,
    fontFace: TOKENS.fonts.mono,
    fontSize: 9,
    color: TOKENS.colors.stone500,
    align: 'right',
  });
  // Hairline divider
  slide.addShape('line', {
    x: 0.5, y: 0.7, w: SLIDE_W - 1, h: 0,
    line: { color: TOKENS.colors.stone200, width: 0.5 },
  });
}

function addFooter(slide, { pageNum, total, brand }) {
  slide.addShape('line', {
    x: 0.5, y: SLIDE_H - 0.5, w: SLIDE_W - 1, h: 0,
    line: { color: TOKENS.colors.stone200, width: 0.5 },
  });
  slide.addText('PULSE', {
    x: 0.5, y: SLIDE_H - 0.4, w: 2, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(`${brand || ''} · ${new Date().toLocaleDateString('en-GB')}`, {
    x: SLIDE_W / 2 - 2, y: SLIDE_H - 0.4, w: 4, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, align: 'center',
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: SLIDE_W - 1.5, y: SLIDE_H - 0.4, w: 1, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, align: 'right',
  });
}

function velocityColor(velocity) {
  switch (velocity) {
    case 'EXPLODING': return 'DC2626';
    case 'RISING': return 'EA580C';
    case 'PEAKING': return 'CA8A04';
    case 'DECLINING': return '64748B';
    default: return '78716C';
  }
}

function platformColor(platform) {
  switch (platform) {
    case 'TikTok': return TOKENS.colors.accent_tiktok;
    case 'Instagram': return TOKENS.colors.accent_instagram;
    case 'YouTube': return TOKENS.colors.accent_youtube;
    case 'X': return TOKENS.colors.accent_x;
    default: return TOKENS.colors.stone500;
  }
}

// ============ SLIDE BUILDERS ============

function buildCoverSlide(pptx, brief) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };

  // Gradient atmosphere band (top)
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_W, h: 2.5,
    fill: { color: TOKENS.colors.cream },
    line: { type: 'none' },
  });
  slide.addShape('ellipse', {
    x: -2, y: -1.5, w: 6, h: 6,
    fill: { color: TOKENS.colors.peach, transparency: 40 },
    line: { type: 'none' },
  });
  slide.addShape('ellipse', {
    x: SLIDE_W - 3, y: -2, w: 6, h: 6,
    fill: { color: TOKENS.colors.pink, transparency: 45 },
    line: { type: 'none' },
  });

  // PULSE mark
  slide.addText('PULSE', {
    x: 0.7, y: 0.6, w: 4, h: 0.4,
    fontFace: TOKENS.fonts.mono, fontSize: 11,
    color: TOKENS.colors.stone900, charSpacing: 8, bold: true,
  });
  slide.addText('SOCIAL INTELLIGENCE BRIEF', {
    x: 0.7, y: 1.0, w: 6, h: 0.3,
    fontFace: TOKENS.fonts.mono, fontSize: 9,
    color: TOKENS.colors.stone500, charSpacing: 4,
  });

  // Brand name — hero
  slide.addText(brief.brand || 'Brief', {
    x: 0.7, y: 2.8, w: SLIDE_W - 1.4, h: 1.8,
    fontFace: TOKENS.fonts.display, fontSize: 80,
    color: TOKENS.colors.stone900, italic: true, bold: false,
  });

  // Market & date
  if (brief.market) {
    slide.addText(brief.market, {
      x: 0.7, y: 4.7, w: SLIDE_W - 1.4, h: 0.4,
      fontFace: TOKENS.fonts.body, fontSize: 16,
      color: TOKENS.colors.stone700,
    });
  }

  slide.addText(
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    {
      x: 0.7, y: SLIDE_H - 1.2, w: 4, h: 0.3,
      fontFace: TOKENS.fonts.mono, fontSize: 10,
      color: TOKENS.colors.stone500, charSpacing: 3,
    }
  );

  // Hairline bottom accent
  slide.addShape('line', {
    x: 0.7, y: SLIDE_H - 0.8, w: 2, h: 0,
    line: { color: TOKENS.colors.ink, width: 2 },
  });
}

function buildExecSummarySlide(pptx, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Executive Summary', brandName: brief.brand });

  const s = brief.executive_summary || {};
  
  // The Read
  slide.addShape('rect', {
    x: 0.5, y: 1.2, w: 4.1, h: 0.08,
    fill: { color: TOKENS.colors.accent_read }, line: { type: 'none' },
  });
  slide.addText('THE READ', {
    x: 0.5, y: 1.35, w: 4, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 4,
  });
  slide.addText(s.the_read || '', {
    x: 0.5, y: 1.65, w: 4.1, h: 2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, valign: 'top',
  });

  // The Move
  slide.addShape('rect', {
    x: 4.9, y: 1.2, w: 4.1, h: 0.08,
    fill: { color: TOKENS.colors.accent_move }, line: { type: 'none' },
  });
  slide.addText('THE MOVE', {
    x: 4.9, y: 1.35, w: 4, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 4,
  });
  slide.addText(s.the_move || '', {
    x: 4.9, y: 1.65, w: 4.1, h: 2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, valign: 'top',
  });

  // The Risk
  slide.addShape('rect', {
    x: 9.3, y: 1.2, w: 3.5, h: 0.08,
    fill: { color: TOKENS.colors.accent_risk }, line: { type: 'none' },
  });
  slide.addText('THE RISK', {
    x: 9.3, y: 1.35, w: 4, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 4,
  });
  slide.addText(s.the_risk || '', {
    x: 9.3, y: 1.65, w: 3.5, h: 2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, valign: 'top',
  });

  // Headline stat
  if (s.headline_stat?.value) {
    slide.addShape('rect', {
      x: 0.5, y: 4.3, w: SLIDE_W - 1, h: 2.2,
      fill: { color: TOKENS.colors.cream },
      line: { type: 'none' },
    });
    slide.addText(s.headline_stat.value, {
      x: 0.8, y: 4.3, w: 4, h: 2.2,
      fontFace: TOKENS.fonts.display, fontSize: 90,
      color: TOKENS.colors.stone900, italic: true, valign: 'middle',
    });
    slide.addText(s.headline_stat.label || '', {
      x: 5, y: 4.8, w: SLIDE_W - 5.5, h: 1.2,
      fontFace: TOKENS.fonts.body, fontSize: 14,
      color: TOKENS.colors.stone700, valign: 'middle',
    });
  }

  // Confidence pill
  if (brief.confidence) {
    const c = brief.confidence;
    const confColors = {
      High: { bg: 'DCFCE7', text: '15803D' },
      Medium: { bg: 'FFEDD5', text: 'C2410C' },
      Low: { bg: 'FEE2E2', text: 'B91C1C' },
    };
    const cc = confColors[c.level] || confColors.Medium;
    slide.addShape('roundRect', {
      x: 0.5, y: 6.7, w: 2.5, h: 0.35,
      fill: { color: cc.bg }, line: { type: 'none' },
      rectRadius: 0.05,
    });
    slide.addText(`${c.level?.toUpperCase()} CONFIDENCE`, {
      x: 0.5, y: 6.7, w: 2.5, h: 0.35,
      fontFace: TOKENS.fonts.mono, fontSize: 9,
      color: cc.text, charSpacing: 3, align: 'center', valign: 'middle', bold: true,
    });
    if (c.reasoning) {
      slide.addText(`· ${c.reasoning}`, {
        x: 3.1, y: 6.7, w: SLIDE_W - 4, h: 0.35,
        fontFace: TOKENS.fonts.body, fontSize: 10,
        color: TOKENS.colors.stone500, italic: true, valign: 'middle',
      });
    }
  }

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildPlatformSlide(pptx, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Platform Fit', brandName: brief.brand });

  const platforms = brief.platform_fit || [];
  if (!platforms.length) {
    addFooter(slide, { pageNum, total, brand: brief.brand });
    return;
  }

  // Add chart data
  const chartData = [
    {
      name: 'Audience',
      labels: platforms.map(p => p.platform),
      values: platforms.map(p => p.audience || 0),
    },
    {
      name: 'Format',
      labels: platforms.map(p => p.platform),
      values: platforms.map(p => p.format || 0),
    },
    {
      name: 'Velocity',
      labels: platforms.map(p => p.platform),
      values: platforms.map(p => p.velocity || 0),
    },
    {
      name: 'Saturation',
      labels: platforms.map(p => p.platform),
      values: platforms.map(p => p.saturation_inverse || 0),
    },
  ];
  
  slide.addChart(pptx.ChartType.bar, chartData, {
    x: 0.5, y: 1.2, w: 6, h: 5.5,
    barDir: 'col',
    barGrouping: 'clustered',
    chartColors: [TOKENS.colors.peach, TOKENS.colors.blue, TOKENS.colors.pink, TOKENS.colors.mint],
    showLegend: true,
    legendPos: 'b',
    legendFontSize: 9,
    legendFontFace: TOKENS.fonts.mono,
    catAxisLabelFontFace: TOKENS.fonts.mono,
    catAxisLabelFontSize: 9,
    valAxisLabelFontSize: 9,
    valAxisMaxVal: 100,
    valAxisMinVal: 0,
  });

  // Per-platform list on right
  let y = 1.2;
  platforms.forEach(p => {
    slide.addShape('rect', {
      x: 6.8, y, w: 0.15, h: 0.9,
      fill: { color: platformColor(p.platform) }, line: { type: 'none' },
    });
    slide.addText(p.platform, {
      x: 7.1, y, w: 3, h: 0.3,
      fontFace: TOKENS.fonts.body, fontSize: 14,
      color: TOKENS.colors.stone900, bold: true,
    });
    slide.addText(`${p.score}/100`, {
      x: SLIDE_W - 1.8, y, w: 1.3, h: 0.3,
      fontFace: TOKENS.fonts.display, fontSize: 18,
      color: TOKENS.colors.stone900, italic: true, align: 'right',
    });
    slide.addText(p.play || '', {
      x: 7.1, y: y + 0.3, w: SLIDE_W - 7.6, h: 0.65,
      fontFace: TOKENS.fonts.body, fontSize: 10,
      color: TOKENS.colors.stone700, italic: true, valign: 'top',
    });
    y += 1.1;
  });

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildTrendSlide(pptx, trend, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Trend worth riding', brandName: brief.brand });

  // Velocity pill
  const vColor = velocityColor(trend.velocity);
  slide.addShape('roundRect', {
    x: 0.5, y: 1.1, w: 1.5, h: 0.35,
    fill: { color: vColor + '22' }, line: { color: vColor, width: 0.5 },
    rectRadius: 0.05,
  });
  slide.addText(trend.velocity || '', {
    x: 0.5, y: 1.1, w: 1.5, h: 0.35,
    fontFace: TOKENS.fonts.mono, fontSize: 9,
    color: vColor, charSpacing: 3, align: 'center', valign: 'middle', bold: true,
  });

  // Platform tag
  slide.addText(trend.platform || '', {
    x: 2.1, y: 1.1, w: 2, h: 0.35,
    fontFace: TOKENS.fonts.mono, fontSize: 10,
    color: platformColor(trend.platform), valign: 'middle',
  });

  // Decay
  slide.addText(`~${trend.decay_weeks || '?'} wks to saturate`, {
    x: SLIDE_W - 4, y: 1.1, w: 3.5, h: 0.35,
    fontFace: TOKENS.fonts.mono, fontSize: 10,
    color: TOKENS.colors.stone500, align: 'right', valign: 'middle',
  });

  // Trend name — hero
  slide.addText(trend.name || '', {
    x: 0.5, y: 1.7, w: SLIDE_W - 1, h: 1.1,
    fontFace: TOKENS.fonts.display, fontSize: 44,
    color: TOKENS.colors.stone900, italic: true,
  });

  // Two-column layout
  const colY = 3.2;
  
  // Left col — metadata
  slide.addText('REACH', {
    x: 0.5, y: colY, w: 3, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(trend.reach_estimate || '—', {
    x: 0.5, y: colY + 0.25, w: 3, h: 0.6,
    fontFace: TOKENS.fonts.display, fontSize: 28,
    color: TOKENS.colors.stone900, italic: true,
  });

  slide.addText('ENTRY MODE', {
    x: 0.5, y: colY + 1, w: 3, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(trend.entry_mode || '—', {
    x: 0.5, y: colY + 1.25, w: 3, h: 0.3,
    fontFace: TOKENS.fonts.body, fontSize: 14,
    color: TOKENS.colors.stone900, bold: true,
  });

  if (trend.example_handle) {
    slide.addText('EXAMPLE', {
      x: 0.5, y: colY + 1.75, w: 3, h: 0.25,
      fontFace: TOKENS.fonts.mono, fontSize: 8,
      color: TOKENS.colors.stone500, charSpacing: 3,
    });
    slide.addText(trend.example_handle, {
      x: 0.5, y: colY + 2.0, w: 3, h: 0.3,
      fontFace: TOKENS.fonts.body, fontSize: 12,
      color: '7C3AED', bold: true,
    });
  }

  // Right col — mechanic + brand angle
  slide.addText('THE MECHANIC', {
    x: 4, y: colY, w: 8, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(trend.mechanic || '', {
    x: 4, y: colY + 0.25, w: 8.8, h: 1,
    fontFace: TOKENS.fonts.body, fontSize: 12,
    color: TOKENS.colors.stone700, valign: 'top',
  });

  slide.addShape('rect', {
    x: 4, y: colY + 1.4, w: 8.8, h: 1.6,
    fill: { color: TOKENS.colors.cream }, line: { type: 'none' },
  });
  slide.addText('BRAND ANGLE', {
    x: 4.2, y: colY + 1.5, w: 8, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(trend.brand_angle || '', {
    x: 4.2, y: colY + 1.75, w: 8.4, h: 1.2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, bold: true, valign: 'top',
  });

  // Risk flag
  if (trend.risk_flag) {
    slide.addText(`⚠ ${trend.risk_flag}`, {
      x: 0.5, y: SLIDE_H - 0.95, w: SLIDE_W - 1, h: 0.3,
      fontFace: TOKENS.fonts.body, fontSize: 10,
      color: 'B45309', italic: true,
    });
  }

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildWhitespaceSlide(pptx, whitespace, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Whitespace opportunity', brandName: brief.brand });

  slide.addText('OPEN TERRITORY', {
    x: 0.5, y: 1.2, w: 4, h: 0.3,
    fontFace: TOKENS.fonts.mono, fontSize: 9,
    color: TOKENS.colors.stone500, charSpacing: 4,
  });

  slide.addText(whitespace.space || '', {
    x: 0.5, y: 1.7, w: SLIDE_W - 1, h: 1.4,
    fontFace: TOKENS.fonts.display, fontSize: 42,
    color: TOKENS.colors.stone900, italic: true,
  });

  // Dashed-feel separator with rounded rect
  slide.addShape('rect', {
    x: 0.5, y: 3.5, w: SLIDE_W - 1, h: 0.04,
    fill: { color: TOKENS.colors.stone300 }, line: { type: 'none' },
  });

  slide.addText('WHY IT\'S EMPTY', {
    x: 0.5, y: 3.8, w: 6, h: 0.3,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(whitespace.why_empty || '', {
    x: 0.5, y: 4.1, w: 6, h: 2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone700, italic: true, valign: 'top',
  });

  slide.addShape('rect', {
    x: 6.8, y: 3.8, w: SLIDE_W - 7.3, h: 2.5,
    fill: { color: TOKENS.colors.cream }, line: { type: 'none' },
  });
  slide.addText('THE OPPORTUNITY', {
    x: 7, y: 3.95, w: 6, h: 0.3,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(whitespace.opportunity || '', {
    x: 7, y: 4.25, w: SLIDE_W - 7.5, h: 2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, bold: true, valign: 'top',
  });

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildCalendarSlide(pptx, event, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Cultural moment', brandName: brief.brand });

  // Category pill
  const categoryColors = {
    Sports: '059669', Entertainment: '7C3AED', Cultural: 'EA580C',
    Industry: '0891B2', Holiday: 'DC2626', Seasonal: 'CA8A04',
  };
  const catColor = categoryColors[event.category] || '78716C';
  slide.addShape('roundRect', {
    x: 0.5, y: 1.1, w: 2, h: 0.35,
    fill: { color: catColor + '22' }, line: { type: 'none' },
    rectRadius: 0.05,
  });
  slide.addText(event.category?.toUpperCase() || '', {
    x: 0.5, y: 1.1, w: 2, h: 0.35,
    fontFace: TOKENS.fonts.mono, fontSize: 9,
    color: catColor, charSpacing: 3, align: 'center', valign: 'middle', bold: true,
  });

  // Days away — dramatic
  slide.addText(String(event.days_away || 0), {
    x: SLIDE_W - 4, y: 1.0, w: 3.5, h: 1.2,
    fontFace: TOKENS.fonts.display, fontSize: 64,
    color: TOKENS.colors.stone900, italic: true, align: 'right',
  });
  slide.addText('DAYS AWAY', {
    x: SLIDE_W - 4, y: 2.15, w: 3.5, h: 0.3,
    fontFace: TOKENS.fonts.mono, fontSize: 9,
    color: TOKENS.colors.stone500, charSpacing: 3, align: 'right',
  });

  // Event name
  slide.addText(event.event || '', {
    x: 0.5, y: 1.7, w: SLIDE_W - 4.5, h: 1.1,
    fontFace: TOKENS.fonts.display, fontSize: 40,
    color: TOKENS.colors.stone900, italic: true,
  });

  slide.addText(event.date || '', {
    x: 0.5, y: 2.85, w: 6, h: 0.3,
    fontFace: TOKENS.fonts.mono, fontSize: 11,
    color: TOKENS.colors.stone500,
  });

  // Why matters
  slide.addText('WHY IT MATTERS FOR THIS BRAND', {
    x: 0.5, y: 3.5, w: 8, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(event.why_matters || '', {
    x: 0.5, y: 3.8, w: SLIDE_W - 1, h: 1.2,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone700, valign: 'top',
  });

  // Execution
  slide.addShape('rect', {
    x: 0.5, y: 5.1, w: SLIDE_W - 1, h: 1.6,
    fill: { color: TOKENS.colors.cream }, line: { type: 'none' },
  });
  slide.addText('EXECUTION IDEA', {
    x: 0.7, y: 5.2, w: 6, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(event.execution_idea || '', {
    x: 0.7, y: 5.5, w: SLIDE_W - 1.4, h: 1.1,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, bold: true, valign: 'top',
  });

  // Lead time
  slide.addText(
    `Lead time: ${event.lead_time_weeks} weeks${event.too_late ? ' · TOO LATE' : ''}`,
    {
      x: 0.5, y: SLIDE_H - 0.95, w: SLIDE_W - 1, h: 0.3,
      fontFace: TOKENS.fonts.mono, fontSize: 10,
      color: event.too_late ? 'DC2626' : TOKENS.colors.stone500,
      italic: true,
    }
  );

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildCreatorSlide(pptx, creator, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Rising creator', brandName: brief.brand });

  // Handle
  slide.addText(creator.handle || '', {
    x: 0.5, y: 1.2, w: SLIDE_W - 1, h: 1.2,
    fontFace: TOKENS.fonts.display, fontSize: 60,
    color: '7C3AED', italic: true,
  });

  // Stats row
  const stats = [
    { label: 'PLATFORM', value: creator.platform },
    { label: 'FOLLOWERS', value: creator.followers },
    { label: '30-DAY GROWTH', value: creator.growth_30d },
  ];
  stats.forEach((s, i) => {
    const x = 0.5 + i * 4.2;
    slide.addText(s.label, {
      x, y: 2.6, w: 4, h: 0.25,
      fontFace: TOKENS.fonts.mono, fontSize: 8,
      color: TOKENS.colors.stone500, charSpacing: 3,
    });
    slide.addText(s.value || '—', {
      x, y: 2.85, w: 4, h: 0.5,
      fontFace: TOKENS.fonts.display, fontSize: 22,
      color: TOKENS.colors.stone900, italic: true,
    });
  });

  // Relevance
  slide.addText('RELEVANCE', {
    x: 0.5, y: 3.8, w: 6, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(creator.relevance || '', {
    x: 0.5, y: 4.1, w: SLIDE_W - 1, h: 1,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone700, valign: 'top',
  });

  // Collab idea
  slide.addShape('rect', {
    x: 0.5, y: 5.3, w: SLIDE_W - 1, h: 1.4,
    fill: { color: TOKENS.colors.cream }, line: { type: 'none' },
  });
  slide.addText('COLLAB IDEA', {
    x: 0.7, y: 5.4, w: 6, h: 0.25,
    fontFace: TOKENS.fonts.mono, fontSize: 8,
    color: TOKENS.colors.stone500, charSpacing: 3,
  });
  slide.addText(creator.collab_idea || '', {
    x: 0.7, y: 5.7, w: SLIDE_W - 1.4, h: 1,
    fontFace: TOKENS.fonts.body, fontSize: 13,
    color: TOKENS.colors.stone900, bold: true, valign: 'top',
  });

  // Safety note
  if (creator.safety_note) {
    slide.addText(`ⓘ ${creator.safety_note}`, {
      x: 0.5, y: SLIDE_H - 0.95, w: SLIDE_W - 1, h: 0.3,
      fontFace: TOKENS.fonts.body, fontSize: 9,
      color: TOKENS.colors.stone500, italic: true,
    });
  }

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildExecutionalSlide(pptx, route, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: 'Executional route', brandName: brief.brand });

  // Route name — italic display
  slide.addText(route.route_name || '', {
    x: 0.5, y: 1.1, w: SLIDE_W - 1, h: 0.7,
    fontFace: TOKENS.fonts.display, fontSize: 32,
    color: TOKENS.colors.stone900, italic: true,
  });

  // Meta line
  const metaParts = [];
  if (route.platform) metaParts.push(route.platform);
  if (route.trend_used) metaParts.push(`rides: ${route.trend_used}`);
  if (metaParts.length) {
    slide.addText(metaParts.join(' · '), {
      x: 0.5, y: 1.85, w: SLIDE_W - 1, h: 0.3,
      fontFace: TOKENS.fonts.mono, fontSize: 10,
      color: TOKENS.colors.stone500,
    });
  }

  // The copy — hero pull-quote treatment
  slide.addShape('rect', {
    x: 0.5, y: 2.4, w: 0.08, h: 2.8,
    fill: { color: TOKENS.colors.ink }, line: { type: 'none' },
  });
  slide.addShape('rect', {
    x: 0.5, y: 2.4, w: SLIDE_W - 1, h: 2.8,
    fill: { color: TOKENS.colors.cream }, line: { type: 'none' },
  });
  slide.addShape('rect', {
    x: 0.5, y: 2.4, w: 0.08, h: 2.8,
    fill: { color: TOKENS.colors.ink }, line: { type: 'none' },
  });
  
  const copyText = route.copy || '';
  const copyFontSize = copyText.length < 60 ? 28 : copyText.length < 120 ? 22 : 18;
  slide.addText(copyText, {
    x: 0.9, y: 2.6, w: SLIDE_W - 1.4, h: 2.4,
    fontFace: TOKENS.fonts.display, fontSize: copyFontSize,
    color: TOKENS.colors.stone900, italic: copyText.length < 80, valign: 'middle',
  });

  // Visual & hashtags
  let y = 5.45;
  if (route.visual) {
    slide.addText('VISUAL', {
      x: 0.5, y, w: 2, h: 0.2,
      fontFace: TOKENS.fonts.mono, fontSize: 8,
      color: TOKENS.colors.stone500, charSpacing: 3,
    });
    slide.addText(route.visual, {
      x: 2.3, y, w: SLIDE_W - 2.8, h: 0.5,
      fontFace: TOKENS.fonts.body, fontSize: 10,
      color: TOKENS.colors.stone700, valign: 'top',
    });
    y += 0.55;
  }

  if (route.hashtags?.length) {
    slide.addText(route.hashtags.join('  '), {
      x: 0.5, y, w: SLIDE_W - 1, h: 0.3,
      fontFace: TOKENS.fonts.mono, fontSize: 10,
      color: '0891B2',
    });
  }

  // Rationale
  if (route.rationale) {
    slide.addText(`Rationale: ${route.rationale}`, {
      x: 0.5, y: SLIDE_H - 0.95, w: SLIDE_W - 1, h: 0.4,
      fontFace: TOKENS.fonts.body, fontSize: 9,
      color: TOKENS.colors.stone500, italic: true,
    });
  }

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

function buildMovesSlide(pptx, brief, pageNum, total) {
  const slide = pptx.addSlide();
  slide.background = { color: TOKENS.colors.paper };
  addHeader(slide, { section: "This week's moves", brandName: brief.brand });

  slide.addText('Call Sheet', {
    x: 0.5, y: 1.1, w: SLIDE_W - 1, h: 0.8,
    fontFace: TOKENS.fonts.display, fontSize: 36,
    color: TOKENS.colors.stone900, italic: true,
  });

  const moves = brief.this_weeks_moves || [];
  const ownerColors = {
    Social: '0891B2', Creative: 'EA580C', Media: '7C3AED',
    Production: '059669', Strategy: 'DC2626',
  };

  let y = 2.3;
  moves.forEach((m) => {
    const oc = ownerColors[m.owner] || '78716C';
    slide.addShape('rect', {
      x: 0.5, y, w: 1.5, h: 0.55,
      fill: { color: oc + '22' }, line: { type: 'none' },
    });
    slide.addText(m.owner?.toUpperCase() || '', {
      x: 0.5, y, w: 1.5, h: 0.55,
      fontFace: TOKENS.fonts.mono, fontSize: 9,
      color: oc, align: 'center', valign: 'middle', charSpacing: 3, bold: true,
    });
    slide.addText(m.action || '', {
      x: 2.15, y, w: SLIDE_W - 4, h: 0.55,
      fontFace: TOKENS.fonts.body, fontSize: 12,
      color: TOKENS.colors.stone900, valign: 'middle',
    });
    slide.addText(m.time_estimate || '', {
      x: SLIDE_W - 1.8, y, w: 1.3, h: 0.55,
      fontFace: TOKENS.fonts.mono, fontSize: 10,
      color: TOKENS.colors.stone500, align: 'right', valign: 'middle',
    });
    y += 0.7;
  });

  addFooter(slide, { pageNum, total, brand: brief.brand });
}

// ============ MAIN EXPORT FUNCTION ============

export async function generateDeck({ brief, selections }) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = `PULSE Brief — ${brief.brand || 'Untitled'}`;
  pptx.author = 'PULSE';
  pptx.company = 'adam&eveTBWA';

  // Count total slides for footer pagination
  const selectedTrends = (brief.trends || []).filter((_, i) => selections.trends.has(i));
  const selectedWhitespace = (brief.whitespace || []).filter((_, i) => selections.whitespace.has(i));
  const selectedCalendar = (brief.calendar || []).filter((_, i) => selections.calendar.has(i));
  const selectedCreators = (brief.creators || []).filter((_, i) => selections.creators.has(i));
  const selectedRoutes = ((brief.executional_starters?.routes) || []).filter((_, i) => selections.routes.has(i));

  // Slide count: cover + summary + platforms + selections + moves
  const hasMoves = (brief.this_weeks_moves || []).length > 0;
  const total = 3 // cover + summary + platforms
    + selectedTrends.length
    + selectedWhitespace.length
    + selectedCalendar.length
    + selectedCreators.length
    + selectedRoutes.length
    + (hasMoves ? 1 : 0);

  let page = 1;

  // 1. Cover
  buildCoverSlide(pptx, brief);
  page++;

  // 2. Executive Summary (always)
  buildExecSummarySlide(pptx, brief, page, total);
  page++;

  // 3. Platform Fit (always)
  buildPlatformSlide(pptx, brief, page, total);
  page++;

  // 4. Selected trends
  selectedTrends.forEach(t => {
    buildTrendSlide(pptx, t, brief, page, total);
    page++;
  });

  // 5. Selected whitespace
  selectedWhitespace.forEach(w => {
    buildWhitespaceSlide(pptx, w, brief, page, total);
    page++;
  });

  // 6. Selected calendar
  selectedCalendar.forEach(e => {
    buildCalendarSlide(pptx, e, brief, page, total);
    page++;
  });

  // 7. Selected creators
  selectedCreators.forEach(c => {
    buildCreatorSlide(pptx, c, brief, page, total);
    page++;
  });

  // 8. Selected executional routes
  selectedRoutes.forEach(r => {
    buildExecutionalSlide(pptx, r, brief, page, total);
    page++;
  });

  // 9. Moves (always if present)
  if (hasMoves) {
    buildMovesSlide(pptx, brief, page, total);
  }

  const filename = `pulse-deck-${(brief.brand || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${new Date().toISOString().split('T')[0]}.pptx`;
  await pptx.writeFile({ fileName: filename });
}
