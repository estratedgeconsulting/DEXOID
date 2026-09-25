/* ============================================================================
   DEXOID TECHNOLOGIES — MARKETING SITE
   Single-file React implementation. Homepage (flagship consulting page) +
   About/Company page. React + Framer Motion; nothing else at runtime.

   USAGE
   -----
   npm i framer-motion          // the only runtime dependency besides React
   import DexoidSite from './DexoidSite';
   export default function Page() { return <DexoidSite />; }

   Next.js app router: drop this file in /app/_site/DexoidSite.jsx, mark it
   'use client', and render it from app/page.jsx. Fonts are loaded from Google
   Fonts by an injected <link>; in Next.js prefer next/font and delete
   injectFonts() below.

   PORTING TO TAILWIND
   -------------------
   Every colour, type step and spacing step is declared once in `tokens` and
   emitted as CSS custom properties (:root) by CSS_TOKENS. To move to Tailwind,
   copy `tokens` into tailwind.config.js theme.extend and swap the dx-* classes
   for utilities — the values will not change.

   WHAT IS REAL AND WHAT IS PLACEHOLDER
   ------------------------------------
   Named ecosystem partners (BatX Energies, Ideas to Impacts, LOHUM) are the
   three the brief supplied. Everything marked /* PLACEHOLDER *​/ below —
   client names beyond those three, pricing, case-study deltas, KPI figures,
   leadership bios, dates — is realistic scaffolding written to the right shape
   and length. Replace before launch. Search this file for PLACEHOLDER.
   ============================================================================ */

import React, {
  useState, useEffect, useRef, useCallback, useMemo, createContext, useContext,
} from 'react';
import {
  motion, AnimatePresence, MotionConfig,
  useReducedMotion, useInView, useScroll, animate,
} from 'framer-motion';

/* ---------------------------------------------------------------------------
   SEO — meta / Open Graph / sitemap / robots
   Kept here so the single file carries the whole setup. In Next.js, move
   SEO_META into `export const metadata`, and write SITEMAP_XML / ROBOTS_TXT to
   app/sitemap.xml/route.js and app/robots.txt/route.js.
   ------------------------------------------------------------------------- */

export const SITE_URL = 'https://www.dexoid.tech'; /* PLACEHOLDER — real domain */

export const SEO_META = {
  title: 'Dexoid Technologies — Engineering the future of automotive innovation',
  description:
    'Automotive consulting, design, R&D, manufacturing and procurement under one accountable engineering team. From concept sketch to Start of Production.',
  canonical: SITE_URL,
  locale: 'en_IN',
  og: {
    type: 'website',
    siteName: 'Dexoid Technologies',
    image: SITE_URL + '/og/dexoid-og-1200x630.png',
    imageAlt: 'Dexoid Technologies — engineering the future of automotive innovation',
    imageWidth: 1200,
    imageHeight: 630,
  },
  twitter: { card: 'summary_large_image', site: '@dexoidtech' },
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Dexoid Technologies',
    description:
      'Automotive engineering consultancy covering strategy, vehicle design, R&D, manufacturing and procurement.',
    url: SITE_URL,
    areaServed: ['IN', 'DE', 'US', 'JP', 'GB'],
    serviceType: [
      'Automotive strategy consulting',
      'Vehicle and component design',
      'R&D and performance enhancement',
      'Manufacturing engineering',
      'Procurement strategy and sourcing',
    ],
  },
};

export const SITEMAP_XML = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <url><loc>' + SITE_URL + '/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>',
  '  <url><loc>' + SITE_URL + '/about</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>',
  '  <url><loc>' + SITE_URL + '/careers</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>',
  '  <url><loc>' + SITE_URL + '/partners</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>',
  '  <url><loc>' + SITE_URL + '/insights</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>',
  '  <url><loc>' + SITE_URL + '/contact</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>',
  '</urlset>',
].join('\n');

export const ROBOTS_TXT = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  '',
  'Sitemap: ' + SITE_URL + '/sitemap.xml',
].join('\n');

/* ---------------------------------------------------------------------------
   DESIGN TOKENS
   ------------------------------------------------------------------------- */

export const tokens = {
  color: {
    ink: '#0A0A0A',          // header / footer / dark panels
    inkSoft: '#141416',      // raised dark surfaces
    // Sky-blue scale, paired against beige. No navy anywhere: skyDeep is the
    // darkest step and exists only so chart marks and small type still clear
    // 3:1 on a light ground. Everything above it is a fill.
    skyDeep: '#2E96D4',
    skyMid: '#7FC1E9',
    sky: '#B7DCF3',          // sky blue — gradient body
    skyPale: '#DCEDF9',
    skyWash: '#F0F7FC',      // sky tint for section grounds
    // Red is the identity accent — it carries the logo mark, the primary CTA
    // and the chapter ribbon, so the mark and the page read as one system.
    // `red` is sampled from the supplied Dexoid mark: a pure red, no blue.
    red: '#D90000',
    redDeep: '#AD0500',      // hover / text-on-light (7.3:1 on white)
    redSoft: '#F4AAAA',      // light red — fills, glows, dark-panel accents
    redWash: '#FDEDED',
    beige: '#D8C4A0',        // warm secondary accent
    beigeLite: '#EFE4CE',
    beigeDeep: '#B79C71',
    beigeInk: '#7C6334',     // beige family, dark enough for type on light blue
    paper: '#F5F4EF',        // warm off-white — standard content ground
    paperAlt: '#EDEBE3',
    line: '#DCD9CE',         // hairline on light
    lineDark: 'rgba(216,196,160,0.20)', // hairline on dark
    body: '#5F5E58',         // warm mid grey — body copy, never pure black
    bodyDark: '#A9A79E',
    white: '#FFFFFF',
  },
  font: {
    display: '"Inter Tight", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    body: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  // Fluid type scale — clamp(min, preferred, max)
  type: {
    eyebrow: 'clamp(10px, 0.72vw, 11.5px)',
    micro: '12px',
    small: '14px',
    body: 'clamp(15.5px, 1.05vw, 17px)',
    lead: 'clamp(17px, 1.3vw, 20px)',
    h3: 'clamp(20px, 1.7vw, 25px)',
    h2: 'clamp(30px, 3.4vw, 50px)',
    h1: 'clamp(42px, 6.2vw, 88px)',
    stat: 'clamp(44px, 6vw, 92px)',
  },
  space: { xs: '8px', sm: '14px', md: '24px', lg: '40px', xl: '64px', xxl: '96px', section: 'clamp(84px, 10vw, 158px)' },
  radius: { sm: '6px', md: '12px', lg: '20px', pill: '999px' },
  shell: '1300px',
  measure: '760px', // centred headline column
  ease: 'cubic-bezier(0.22, 0.72, 0.24, 1)',
};

/* ---------------------------------------------------------------------------
   CONTENT MODEL
   Everything a non-developer edits lives in these objects. Wired to a headless
   CMS, each becomes one collection: chapters, services, capabilities,
   caseStudies, testimonials, leadership, posts, faqs, milestones, partners.
   ------------------------------------------------------------------------- */

export const CTA_LABEL = 'Contact Us';        // one label, used site-wide
export const CTA_HREF = '#contact';           // point at CRM form / booking link

/* The single place the published contact details live — footer, schema and
   anywhere else they surface. The address is as supplied; EMAIL and PHONE were
   left blank in the brief, so they are PLACEHOLDERS. Fill both before launch:
   an empty `email` or `phone` simply drops that line from the footer. */
export const CONTACT_DETAILS = {
  company: 'Dexoid Technologies',
  address: [
    'Ideas to Impacts building, Pallod Farms, Baner',
    '(behind Vijay Sales), Pune, Maharashtra, India',
  ],
  email: 'projectsinfo@dexoid.in',   // PLACEHOLDER — e.g. 'info@dexoid.com'
  phone: '7744912617',   // PLACEHOLDER — e.g. '+91 00000 00000'
};

export const NAV = [
  {
    label: 'Services',
    items: [
      { icon: 'compass', title: 'Consulting', desc: 'Market analysis, technology roadmaps and supply chain strategy.', href: '#chapter-2' },
      { icon: 'factory', title: 'Manufacturing', desc: 'Precision component manufacturing and scalable production.', href: '#chapter-2' },
      { icon: 'pen', title: 'Design', desc: 'Concept, CAD modelling, aerodynamics and ergonomics.', href: '#chapter-2' },
      { icon: 'flask', title: 'Research & Development', desc: 'Emerging technology, sustainability and performance work.', href: '#deep-dive' },
      { icon: 'building', title: 'Industrial Projects', desc: 'Land, approvals, civil execution and MEP, to handover.', href: '#industrial' },
      { icon: 'building', title: 'GCC Setup & Scale', desc: 'Stand up and scale your India capability centre, end to end.', href: '#chapter-3' },
      { icon: 'box', title: 'Sourcing & Localisation', desc: 'Should-cost models, supplier audits and India localisation.', href: '#faq' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { icon: 'doc', title: 'Insights', desc: 'Teardowns, sourcing notes and method write-ups from our engineers.', href: '#chapter-5' },
      { icon: 'layers', title: 'Programme Lifecycle', desc: 'The seven gates, and where we can join yours.', href: '#lifecycle' },
      { icon: 'chart', title: 'Common Questions', desc: 'Sourcing, quality, localisation and greenfield setup.', href: '#faq' },
    ],
  },
  {
    label: 'Partners',
    items: [
      { icon: 'link', title: 'Partner Ecosystem', desc: 'The manufacturing network behind every Dexoid programme.', href: '#clients' },
      { icon: 'plus', title: 'Apply as Partner', desc: 'Tier-1s, tooling houses and test labs — tell us your capability.', href: '#contact' },
    ],
  },
  {
    label: 'Company',
    items: [
      { icon: 'building', title: 'About Dexoid', desc: 'Who we are, how we got here and where we are going.', href: '#/about' },
      { icon: 'users', title: 'Leadership', desc: 'The engineers who will actually be on your programme.', href: '#chapter-4' },
      { icon: 'spark', title: 'Careers', desc: 'Open roles across design, simulation and manufacturing.', href: '#contact' },
    ],
  },
];

export const LANGS = ['EN', 'DE', 'JA'];

/* ---------------------------------------------------------------------------
   STYLESHEET
   One injected <style>. Class-prefixed dx-* so it cannot collide with a host
   app. Values are read from `tokens` via the :root custom properties below.
   ------------------------------------------------------------------------- */

const CSS = `
:root{
  --dx-ink:${tokens.color.ink}; --dx-ink-soft:${tokens.color.inkSoft};
  --dx-sky-deep:${tokens.color.skyDeep}; --dx-sky-mid:${tokens.color.skyMid};
  --dx-sky:${tokens.color.sky}; --dx-sky-pale:${tokens.color.skyPale};
  --dx-sky-wash:${tokens.color.skyWash};
  --dx-red:${tokens.color.red}; --dx-red-deep:${tokens.color.redDeep};
  --dx-red-soft:${tokens.color.redSoft}; --dx-red-wash:${tokens.color.redWash};
  --dx-beige:${tokens.color.beige}; --dx-beige-lite:${tokens.color.beigeLite};
  --dx-beige-deep:${tokens.color.beigeDeep}; --dx-beige-ink:${tokens.color.beigeInk};
  --dx-paper:${tokens.color.paper}; --dx-paper-alt:${tokens.color.paperAlt};
  --dx-line:${tokens.color.line}; --dx-line-dark:${tokens.color.lineDark};
  --dx-body:${tokens.color.body}; --dx-body-dark:${tokens.color.bodyDark};
  --dx-white:${tokens.color.white};
  --dx-f-display:${tokens.font.display};
  --dx-f-body:${tokens.font.body};
  --dx-f-mono:${tokens.font.mono};
  --dx-shell:${tokens.shell}; --dx-measure:${tokens.measure};
  --dx-section:${tokens.space.section};
  --dx-ease:${tokens.ease};
  --dx-hdr-h:76px;
}

/* ---- reset / base ---- */
.dx-root *,.dx-root *::before,.dx-root *::after{box-sizing:border-box;}
.dx-root{
  margin:0; font-family:var(--dx-f-body); color:var(--dx-body);
  background:var(--dx-paper);
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  font-size:${tokens.type.body}; line-height:1.62;
  /* overflow-x:hidden forces the other axis to compute to auto, which turns this
     element into its own scroll container — and if anything ever caps its height,
     the page silently stops scrolling. overflow-x:clip hides the same horizontal
     overflow without that side effect. The hidden line stays first as a fallback
     for browsers that predate clip. */
  overflow-x:hidden;
  overflow-x:clip; overflow-y:visible;
  position:relative;
}
/* h5 and h6 are in this list too — without them the browser's own heading
   margins leak into any panel that uses them. No font-size here: this selector
   out-specifies the .dx-h1/.dx-h2/.dx-h3 classes and would silently win. */
.dx-root h1,.dx-root h2,.dx-root h3,.dx-root h4,.dx-root h5,.dx-root h6,
.dx-root p,.dx-root ul,.dx-root ol,.dx-root figure{margin:0;padding:0;}
.dx-root ul,.dx-root ol{list-style:none;}
.dx-root img,.dx-root svg{max-width:100%;}
/* Element resets are wrapped in :where() so they carry ZERO specificity and can
   never out-rank a dx-* component class. Without this, ".dx-root button" (one
   class + one type) beats ".dx-btn--primary" and silently strips its fill. */
:where(.dx-root button){font:inherit;color:inherit;background:none;border:0;cursor:pointer;}
:where(.dx-root a){color:inherit;text-decoration:none;}
:where(.dx-root input,.dx-root textarea,.dx-root select){font:inherit;color:inherit;}
.dx-root :focus-visible{outline:2px solid var(--dx-sky-mid);outline-offset:3px;border-radius:3px;}
.dx-dark :focus-visible{outline-color:var(--dx-beige);}
.dx-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}

/* ---- layout ---- */
.dx-shell{width:100%;max-width:var(--dx-shell);margin:0 auto;padding:0 clamp(20px,4vw,44px);}
.dx-section{padding-block:var(--dx-section);position:relative;}
.dx-section--tight{padding-block:clamp(56px,6vw,92px);}
.dx-paper{background:var(--dx-paper);}
.dx-paper-alt{background:var(--dx-paper-alt);}
.dx-wash{background:var(--dx-sky-wash);}
.dx-dark{background:var(--dx-ink);color:var(--dx-body-dark);}
.dx-measure{max-width:var(--dx-measure);}
.dx-center{margin-inline:auto;text-align:center;}

/* ---- type ---- */
.dx-eyebrow{
  font-family:var(--dx-f-mono); font-size:${tokens.type.eyebrow}; font-weight:500;
  letter-spacing:.2em; text-transform:uppercase; color:var(--dx-beige-deep);
  display:flex; align-items:center; gap:10px; line-height:1;
}
.dx-center .dx-eyebrow{justify-content:center;}
/* The eyebrow rule is the smallest, most repeated piece of red on the page. */
.dx-eyebrow::before{content:"";width:22px;height:2px;border-radius:2px;background:var(--dx-red);flex:none;}
.dx-dark .dx-eyebrow{color:var(--dx-beige);}
.dx-dark .dx-eyebrow::before{background:var(--dx-red-soft);}
.dx-h1{
  font-family:var(--dx-f-display); font-size:${tokens.type.h1}; font-weight:500;
  line-height:1.02; letter-spacing:-.038em; color:var(--dx-ink); text-wrap:balance;
}
.dx-dark .dx-h1,.dx-abhero .dx-h1{color:var(--dx-white);}
.dx-h2{
  font-family:var(--dx-f-display); font-size:${tokens.type.h2}; font-weight:500;
  line-height:1.08; letter-spacing:-.032em; color:var(--dx-ink); text-wrap:balance;
}
.dx-dark .dx-h2,.dx-h2--light{color:var(--dx-white);}
.dx-h3{
  font-family:var(--dx-f-display); font-size:${tokens.type.h3}; font-weight:550;
  line-height:1.2; letter-spacing:-.022em; color:var(--dx-ink);
}
.dx-dark .dx-h3{color:var(--dx-white);}
.dx-lead{font-size:${tokens.type.lead};line-height:1.55;color:var(--dx-body);}
.dx-dark .dx-lead,.dx-dark p{color:var(--dx-body-dark);}
.dx-small{font-size:${tokens.type.small};line-height:1.55;}
.dx-micro{font-family:var(--dx-f-mono);font-size:${tokens.type.micro};letter-spacing:.06em;}
.dx-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;}

/* ---- buttons ---- */
.dx-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:9px;
  height:50px;padding:0 28px;border-radius:999px;
  font-family:var(--dx-f-body);font-size:15px;font-weight:550;letter-spacing:-.005em;
  transition:transform .35s var(--dx-ease),background-color .3s,color .3s,border-color .3s,box-shadow .3s;
  white-space:nowrap;
}
/* One filled pill everywhere, in the identity red so the CTA matches the mark. */
.dx-btn--primary{background:var(--dx-red);color:#FFFFFF;box-shadow:0 6px 18px -10px rgba(173,5,0,.65);}
.dx-btn--primary:hover{background:var(--dx-red-deep);transform:translateY(-2px);box-shadow:0 10px 22px -10px rgba(173,5,0,.7);}
.dx-btn--ghost{border:1px solid rgba(10,10,10,.22);color:var(--dx-ink);}
.dx-btn--ghost:hover{border-color:var(--dx-ink);color:var(--dx-ink);transform:translateY(-2px);}
.dx-dark .dx-btn--ghost,.dx-abhero .dx-btn--ghost,.dx-hero .dx-btn--ghost{border-color:rgba(255,255,255,.3);color:var(--dx-white);}
.dx-dark .dx-btn--ghost:hover,.dx-abhero .dx-btn--ghost:hover,.dx-hero .dx-btn--ghost:hover{border-color:var(--dx-beige);color:var(--dx-beige);}
.dx-btn--sm{height:42px;padding:0 20px;font-size:14px;}
.dx-tlink{
  display:inline-flex;align-items:center;gap:7px;font-size:14.5px;font-weight:550;
  color:var(--dx-ink);border-bottom:1px solid transparent;padding-bottom:2px;
  transition:gap .3s var(--dx-ease),border-color .3s,color .3s;
}
.dx-tlink .dx-arw{transition:transform .3s var(--dx-ease);}
.dx-tlink:hover{gap:11px;border-color:var(--dx-red);color:var(--dx-red-deep);}
.dx-tlink:hover .dx-arw{transform:translateX(2px);}
.dx-dark .dx-tlink{color:var(--dx-beige);}
.dx-dark .dx-tlink:hover{border-color:var(--dx-red-soft);color:var(--dx-red-soft);}

/* ---- icon badge (rounded square, dark) ---- */
.dx-badge{
  width:38px;height:38px;flex:none;border-radius:11px;display:grid;place-items:center;
  background:var(--dx-ink);color:var(--dx-beige);
  box-shadow:0 0 0 1px rgba(255,255,255,.06) inset;
}
.dx-badge--lg{width:46px;height:46px;border-radius:13px;}
.dx-badge--beige{background:var(--dx-beige);color:#16110A;box-shadow:0 0 0 1px rgba(120,97,60,.35) inset;}
.dx-badge--red{background:var(--dx-red);color:#fff;box-shadow:none;}
.dx-badge--outline{background:transparent;color:var(--dx-beige);box-shadow:0 0 0 1px var(--dx-line-dark) inset;}

/* ---- registration ticks: the recurring structural motif (CAD drawing marks) */
.dx-reg{position:relative;}
.dx-reg::before,.dx-reg::after{
  content:"";position:absolute;width:9px;height:9px;pointer-events:none;
  border-color:var(--dx-beige-deep);opacity:.55;
}
.dx-reg::before{top:0;left:0;border-top:1px solid;border-left:1px solid;}
.dx-reg::after{bottom:0;right:0;border-bottom:1px solid;border-right:1px solid;}
.dx-dark .dx-reg::before,.dx-dark .dx-reg::after{border-color:var(--dx-beige);opacity:.4;}
.dx-rule{height:1px;background:var(--dx-line);border:0;}
.dx-dark .dx-rule{background:var(--dx-line-dark);}

/* ---- header ---- */
.dx-hdr{
  position:fixed;inset:0 0 auto 0;z-index:80;height:var(--dx-hdr-h);
  display:flex;align-items:center;
  background:transparent;border-bottom:1px solid transparent;
  transition:background-color .4s var(--dx-ease),border-color .4s,backdrop-filter .4s,box-shadow .4s;
}
.dx-hdr__in{display:flex;align-items:center;gap:clamp(16px,2.4vw,38px);width:100%;}
.dx-hdr.is-solid{background:rgba(245,244,239,.92);backdrop-filter:saturate(1.4) blur(14px);border-bottom-color:var(--dx-line);box-shadow:0 1px 24px rgba(11,27,48,.06);}
.dx-hdr__logo{display:flex;align-items:center;gap:11px;flex:none;}
.dx-hdr__nav{display:flex;align-items:center;gap:4px;margin-inline-start:8px;}
.dx-hdr__sp{flex:1;}
.dx-hdr__util{display:flex;align-items:center;gap:6px;flex:none;}
/* Default header type is dark: it sits over the light-blue hero and over the
   solid light header alike. Only the About page's near-black hero flips it. */
.dx-navbtn{
  display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 13px;border-radius:9px;
  font-size:14.5px;font-weight:500;color:#3A3934;
  transition:color .3s,background-color .3s;
}
.dx-navbtn:hover,.dx-navbtn.is-open{color:var(--dx-ink);background:rgba(10,10,10,.06);}
.dx-navbtn__c{transition:transform .3s var(--dx-ease);}
.dx-navbtn.is-open .dx-navbtn__c{transform:rotate(180deg);}
.dx-lang{
  display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 11px;border-radius:9px;
  font-family:var(--dx-f-mono);font-size:12px;letter-spacing:.08em;color:#575650;
}
.dx-lang:hover{background:rgba(10,10,10,.06);color:var(--dx-ink);}
.dx-hdr .dx-btn--ghost{border-color:rgba(10,10,10,.22);color:var(--dx-ink);}
.dx-hdr .dx-btn--ghost:hover{border-color:var(--dx-ink);}

.dx-hdr--ondark:not(.is-solid) .dx-navbtn{color:rgba(255,255,255,.86);}
.dx-hdr--ondark:not(.is-solid) .dx-navbtn:hover,
.dx-hdr--ondark:not(.is-solid) .dx-navbtn.is-open{color:var(--dx-white);background:rgba(255,255,255,.1);}
.dx-hdr--ondark:not(.is-solid) .dx-lang{color:rgba(255,255,255,.72);}
.dx-hdr--ondark:not(.is-solid) .dx-lang:hover{background:rgba(255,255,255,.1);color:#fff;}
.dx-hdr--ondark:not(.is-solid) .dx-btn--ghost{border-color:rgba(255,255,255,.3);color:var(--dx-white);}
.dx-hdr--ondark:not(.is-solid) .dx-btn--ghost:hover{border-color:var(--dx-beige);color:var(--dx-beige);}

/* ---- mega menu ---- */
.dx-megawrap{position:relative;}
/* Headings only. With the descriptions gone each row is one line, so the panel
   is narrower and the rows are centred on their icon rather than top-aligned. */
.dx-mega{
  position:absolute;top:calc(100% + 12px);left:-14px;z-index:90;
  min-width:min(548px,86vw);padding:12px;border-radius:18px;
  background:var(--dx-ink-soft);border:1px solid var(--dx-line-dark);
  box-shadow:0 30px 70px -24px rgba(0,0,0,.6);
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;
}
.dx-mega--1{grid-template-columns:minmax(0,1fr);min-width:min(292px,86vw);}
.dx-mega__i{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;transition:background-color .25s;}
.dx-mega__i:hover{background:rgba(216,196,160,.09);}
.dx-mega__t{display:block;font-family:var(--dx-f-display);font-size:14.5px;font-weight:600;color:var(--dx-white);letter-spacing:-.015em;line-height:1.25;}

/* ---- mobile nav ---- */
.dx-burger{display:none;width:42px;height:42px;border-radius:10px;place-items:center;color:inherit;}
.dx-hdr .dx-burger{color:var(--dx-ink);}
.dx-hdr--ondark:not(.is-solid) .dx-burger{color:#fff;}
.dx-mnav{
  position:fixed;inset:var(--dx-hdr-h) 0 0 0;z-index:79;background:var(--dx-ink);
  overflow-y:auto;padding:24px clamp(20px,5vw,32px) 60px;
}
.dx-mnav__g{border-bottom:1px solid var(--dx-line-dark);padding:18px 0;}
.dx-mnav__h{font-family:var(--dx-f-mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--dx-beige);margin-bottom:12px;}
.dx-mnav__i{display:flex;align-items:center;gap:12px;padding:10px 0;color:#fff;}
`;

const CSS2 = `
/* ---- hero -------------------------------------------------------------
   Near-black stage, photograph clipped on a diagonal down the right, one red
   slash running parallel to that edge. Everything left of the slash is type.
   ----------------------------------------------------------------------- */
.dx-hero{
  position:relative;isolation:isolate;overflow:hidden;
  background:var(--dx-ink);color:rgba(255,255,255,.78);
  padding-top:calc(var(--dx-hdr-h) + clamp(56px,7vw,104px));
  padding-bottom:clamp(56px,7vw,96px);
  min-height:min(92vh,920px);display:flex;flex-direction:column;justify-content:center;
}
.dx-hero .dx-h1{color:var(--dx-white);}
.dx-hero__media{position:absolute;top:0;right:0;bottom:0;width:min(52%,900px);z-index:-2;}
.dx-hero__media img{width:100%;height:100%;object-fit:cover;object-position:60% center;display:block;}
.dx-hero__media::after{
  content:"";position:absolute;inset:0;
  background:linear-gradient(97deg,#0A0A0A 0%,rgba(10,10,10,.97) 40%,rgba(10,10,10,.66) 70%,rgba(10,10,10,.18) 100%);
}
/* starts below the header so it never runs behind the nav buttons */
.dx-hero__slash{
  position:absolute;top:var(--dx-hdr-h);left:0;right:0;bottom:0;
  z-index:-1;pointer-events:none;background:var(--dx-red);
  clip-path:polygon(80% 0,86% 0,72% 100%,66% 100%);
  -webkit-mask-image:linear-gradient(180deg,transparent 0,#000 9%);
  mask-image:linear-gradient(180deg,transparent 0,#000 9%);
}
.dx-hero__wedge{
  position:absolute;right:0;bottom:0;width:22%;height:34%;z-index:-1;pointer-events:none;
  background:var(--dx-paper);opacity:.9;clip-path:polygon(100% 0,100% 100%,0 100%);
}
.dx-hero__in{position:relative;display:grid;gap:clamp(20px,2.4vw,32px);max-width:var(--dx-shell);}
.dx-hero__cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}

/* stat row, hairline-separated as in the brand mock */
.dx-hero__meta{display:flex;flex-wrap:wrap;margin-top:6px;}
.dx-hero__meta div{display:grid;gap:4px;padding-right:clamp(20px,3vw,46px);}
.dx-hero__meta div + div{padding-left:clamp(20px,3vw,46px);border-left:1px solid rgba(255,255,255,.16);}
.dx-hero__meta b{font-family:var(--dx-f-display);font-size:clamp(20px,1.9vw,26px);font-weight:600;color:#fff;letter-spacing:-.025em;}
.dx-hero__meta span{font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.52);}

.dx-hero__foot{display:grid;gap:14px;margin-top:clamp(18px,3vw,40px);max-width:560px;}
.dx-hero__bar{height:2px;border-radius:2px;background:rgba(255,255,255,.14);position:relative;overflow:hidden;}
.dx-hero__bar i{position:absolute;inset:0 auto 0 0;width:22%;background:var(--dx-red);border-radius:2px;}
.dx-hero__words{
  display:flex;flex-wrap:wrap;gap:10px 18px;
  font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.55);
}
.dx-hero__words i{color:var(--dx-red);font-style:normal;}

/* looping final word */
.dx-loop{position:relative;display:inline-grid;vertical-align:top;}
/* AnimatePresence mode="wait" swaps the words, so they never double-expose. */
.dx-loop__w{grid-area:1/1;color:var(--dx-red);}

/* ---- partner logo wall (lives in the Clients section at the foot) ---- */
.dx-trust__line{
  font-family:var(--dx-f-display);font-size:clamp(15px,1.15vw,17.5px);font-weight:500;
  line-height:1.45;letter-spacing:-.014em;color:var(--dx-ink);max-width:580px;
}
.dx-logos{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;background:var(--dx-line);border:1px solid var(--dx-line);}
.dx-logos__c{background:var(--dx-white);min-height:96px;display:grid;place-items:center;padding:18px 14px;}
.dx-logo{display:block;max-height:38px;width:auto;max-width:100%;object-fit:contain;
  opacity:.82;transition:opacity .35s var(--dx-ease);}
.dx-logos__c:hover .dx-logo{opacity:1;}

/* ---- lifecycle navigator ---- */
.dx-life{position:relative;}
.dx-life__track{position:relative;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0;margin-top:44px;}
.dx-life__line{position:absolute;top:23px;left:7%;right:7%;height:1px;background-image:linear-gradient(90deg,var(--dx-beige-deep) 50%,transparent 0);background-size:9px 1px;opacity:.6;}
.dx-life__n{position:relative;display:grid;justify-items:center;gap:12px;text-align:center;padding:0 6px;}
.dx-life__d{
  width:46px;height:46px;border-radius:14px;display:grid;place-items:center;
  background:var(--dx-paper);color:var(--dx-sky-deep);
  box-shadow:0 0 0 1px var(--dx-line) inset;transition:background-color .4s,color .4s,box-shadow .4s;
}
.dx-life__n:hover .dx-life__d{background:var(--dx-ink);color:var(--dx-beige);box-shadow:none;}
.dx-life__k{font-family:var(--dx-f-mono);font-size:10px;letter-spacing:.16em;color:var(--dx-red-deep);}
.dx-life__t{font-family:var(--dx-f-display);font-size:14px;font-weight:600;color:var(--dx-ink);letter-spacing:-.015em;line-height:1.25;}
.dx-life__s{font-size:12.5px;line-height:1.4;color:var(--dx-body);}

/* ---- chapter ribbon + chapters ----------------------------------------
   The ribbon is not pinned. Each chapter owns one segment of it, so the
   segments butt together into a single line running the height of the
   narrative. The segment fills red as its chapter is read, and the marker
   bead sits opaque on top of the line. --dx-chap-pt keeps the bead level with
   the chapter's own eyebrow.
   ----------------------------------------------------------------------- */
.dx-narr{position:relative;}
.dx-chap{
  --dx-chap-pt:clamp(64px,7.4vw,120px);
  display:grid;grid-template-columns:168px minmax(0,1fr);
  gap:clamp(18px,2.4vw,38px);align-items:stretch;
}
.dx-chap:first-child{--dx-chap-pt:clamp(24px,3vw,44px);}
.dx-chap__body{padding-top:var(--dx-chap-pt);padding-bottom:clamp(64px,7.4vw,120px);}
.dx-chap + .dx-chap .dx-chap__body{border-top:1px solid var(--dx-line);}

.dx-chap__rail{position:relative;padding-right:14px;}
.dx-chap__ribbon{position:absolute;left:13px;top:0;bottom:0;width:2px;border-radius:2px;background:var(--dx-line);}
.dx-chap:first-child .dx-chap__ribbon{top:calc(var(--dx-chap-pt) + 14px);}
.dx-chap:last-child .dx-chap__ribbon{background:linear-gradient(180deg,var(--dx-line) 62%,transparent);}
/* scaleY is driven straight from the chapter's own scroll progress */
.dx-chap__fill{
  position:absolute;inset:0;border-radius:2px;
  background:linear-gradient(180deg,var(--dx-red-deep),var(--dx-red));
}
.dx-chap__mark{
  position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;
  margin-top:calc(var(--dx-chap-pt) + 1px);
}
.dx-chap__markd{
  width:28px;height:28px;border-radius:9px;flex:none;display:grid;place-items:center;
  font-family:var(--dx-f-mono);font-size:10.5px;font-weight:500;color:#9B998F;
  background:var(--dx-paper);box-shadow:0 0 0 1px var(--dx-line) inset;
  transition:background-color .45s var(--dx-ease),color .45s,box-shadow .45s;
}
.dx-chap__markl{font-size:13px;font-weight:500;color:#9B998F;letter-spacing:-.005em;opacity:.8;transition:color .45s,opacity .45s;}
.dx-chap__rail.is-done .dx-chap__markd{background:var(--dx-red-wash);color:var(--dx-red-deep);box-shadow:0 0 0 1px var(--dx-red-soft) inset;}
.dx-chap__rail.is-done .dx-chap__markl{color:var(--dx-body);opacity:1;}
.dx-chap__rail.is-on .dx-chap__markd{background:var(--dx-red);color:#fff;box-shadow:none;}
.dx-chap__rail.is-on .dx-chap__markl{color:var(--dx-ink);opacity:1;font-weight:600;}
.dx-chap__mark:hover .dx-chap__markl{color:var(--dx-ink);opacity:1;}
.dx-chap__row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.02fr);gap:clamp(28px,3.6vw,60px);align-items:center;}
.dx-chap__row.is-flip .dx-chap__txt{order:2;}
.dx-chap__txt{display:grid;gap:18px;align-content:start;max-width:520px;}
.dx-chap__row.is-start{align-items:start;}
.dx-chap__pts{display:grid;gap:13px;margin-top:2px;}
.dx-chap__pt{display:flex;gap:11px;align-items:flex-start;font-size:15px;color:var(--dx-body);}
.dx-chap__pt svg{flex:none;margin-top:5px;color:var(--dx-red);}
.dx-chap__pt b{font-weight:600;color:var(--dx-ink);}
.dx-chap__ptd{display:block;font-size:14px;line-height:1.5;color:var(--dx-body);margin-top:1px;}
.dx-dark .dx-chap__pt b{color:#fff;}
.dx-dark .dx-chap__ptd{color:var(--dx-body-dark);}

/* ---- illustration frame ---- */
.dx-ill{
  position:relative;border-radius:20px;padding:clamp(18px,2vw,26px);
  background:linear-gradient(160deg,#FFFFFF 0%,#F1EFE8 100%);
  border:1px solid var(--dx-line);
  box-shadow:0 34px 70px -44px rgba(11,27,48,.5);
  overflow:hidden;
}
.dx-ill--dark{background:linear-gradient(160deg,#131318 0%,#0A0A0A 100%);border-color:var(--dx-line-dark);color:var(--dx-body-dark);}
.dx-ill__bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;}
.dx-ill__tag{font-family:var(--dx-f-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8D8B83;}
.dx-ill--dark .dx-ill__tag{color:var(--dx-beige);}
.dx-ill__dots{display:flex;gap:5px;}
.dx-ill__dots i{width:7px;height:7px;border-radius:50%;background:var(--dx-line);}
.dx-ill--dark .dx-ill__dots i{background:rgba(216,196,160,.3);}

/* illustration internals */
.dx-gantt{display:grid;gap:9px;}
.dx-gantt__r{display:grid;grid-template-columns:112px minmax(0,1fr);gap:12px;align-items:center;}
.dx-gantt__n{font-size:12.5px;font-weight:550;color:var(--dx-ink);}
.dx-gantt__t{height:22px;border-radius:6px;background:#E8E5DB;position:relative;overflow:hidden;}
.dx-gantt__f{position:absolute;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,var(--dx-sky-deep),var(--dx-sky-mid));}
.dx-gantt__f.is-acc{background:linear-gradient(90deg,var(--dx-beige-deep),var(--dx-beige));}
.dx-gate{display:flex;justify-content:space-between;margin-top:16px;padding-top:13px;border-top:1px dashed var(--dx-line);}
.dx-gate span{font-family:var(--dx-f-mono);font-size:10px;letter-spacing:.12em;color:#8D8B83;}

.dx-pill4{display:grid;gap:10px;margin-top:16px;}
.dx-pill4__r{display:grid;grid-template-columns:minmax(0,1fr) 56px;gap:12px;align-items:center;}
.dx-pill4__n{font-size:13px;font-weight:550;color:var(--dx-ink);}
.dx-pill4__b{height:5px;border-radius:3px;background:#E8E5DB;overflow:hidden;grid-column:1/-1;margin-top:-4px;}
.dx-pill4__f{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--dx-sky-deep),var(--dx-beige-deep));transition:width 1.2s var(--dx-ease);}
.dx-pill4__v{font-family:var(--dx-f-mono);font-size:12px;color:var(--dx-sky-deep);text-align:right;}
`;

const CSS3 = `
/* ---- deep-dive dark panel ---- */
.dx-deep{position:relative;overflow:hidden;background:var(--dx-ink);color:var(--dx-body-dark);}
.dx-deep::before{
  content:"";position:absolute;inset:0;
  background:radial-gradient(80% 60% at 50% 0%,rgba(46,150,212,.34),transparent 62%),radial-gradient(60% 50% at 82% 92%,rgba(216,196,160,.16),transparent 66%);
}
.dx-deep__in{position:relative;}
.dx-mini{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--dx-line-dark);border-block:1px solid var(--dx-line-dark);margin-top:clamp(34px,4vw,54px);}
.dx-mini__c{background:var(--dx-ink);padding:24px clamp(14px,1.6vw,22px);display:grid;gap:9px;align-content:start;}
.dx-mini__k{font-family:var(--dx-f-mono);font-size:11px;letter-spacing:.16em;color:var(--dx-beige);}
.dx-mini__t{font-family:var(--dx-f-display);font-size:16px;font-weight:600;color:#fff;letter-spacing:-.018em;}
.dx-mini__d{font-size:13px;line-height:1.5;color:var(--dx-body-dark);}
.dx-schem{margin-top:clamp(34px,4.4vw,58px);border-radius:20px;border:1px solid var(--dx-line-dark);background:linear-gradient(180deg,rgba(46,150,212,.18),rgba(10,10,10,.7));padding:clamp(16px,2.4vw,34px);overflow:hidden;}
.dx-flow{stroke-dasharray:5 7;animation:dxflow 2.6s linear infinite;}
@keyframes dxflow{to{stroke-dashoffset:-48;}}
.dx-schem__cap{display:flex;flex-wrap:wrap;gap:clamp(14px,2.4vw,34px);justify-content:center;margin-top:20px;}
.dx-schem__cap span{display:flex;align-items:center;gap:7px;font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--dx-body-dark);}
.dx-schem__cap i{width:9px;height:9px;border-radius:2px;flex:none;}

/* ---- R&D focus strip (the four stages, on the dark panel) ---- */
.dx-focus{
  display:flex;flex-wrap:wrap;align-items:center;gap:14px clamp(18px,3vw,40px);
  margin-top:clamp(26px,3vw,40px);padding-top:22px;border-top:1px solid var(--dx-line-dark);
}
.dx-focus__l{font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--dx-beige);}
.dx-focus__r{display:flex;flex-wrap:wrap;gap:12px clamp(16px,2.4vw,32px);}
.dx-focus__i{display:inline-flex;align-items:baseline;gap:8px;font-size:14.5px;font-weight:550;color:#fff;}
.dx-focus__i b{font-family:var(--dx-f-mono);font-size:11px;font-weight:500;color:var(--dx-red-soft);}

/* ---- core services, four across ---- */
.dx-svcrow{
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;
  background:var(--dx-line);border:1px solid var(--dx-line);
  border-radius:18px;overflow:hidden;margin-top:clamp(32px,4vw,52px);
}
.dx-svccard{background:var(--dx-white);padding:clamp(22px,2.3vw,30px);display:grid;gap:12px;align-content:start;}
.dx-svccard__k{font-family:var(--dx-f-mono);font-size:11px;letter-spacing:.18em;color:var(--dx-red);}
.dx-svccard__t{font-family:var(--dx-f-display);font-size:18px;font-weight:620;color:var(--dx-ink);letter-spacing:-.024em;line-height:1.2;}
.dx-svccard__d{font-size:13.5px;line-height:1.6;color:var(--dx-body);}

/* ---- three proof points, side by side ---- */
.dx-pts3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,2.6vw,36px);margin-top:clamp(30px,3.6vw,50px);}
.dx-pts3__i{display:grid;gap:12px;align-content:start;padding-top:20px;border-top:2px solid var(--dx-red);}
.dx-pts3__n{font-family:var(--dx-f-mono);font-size:11px;letter-spacing:.18em;color:var(--dx-red);}
.dx-pts3__t{font-family:var(--dx-f-display);font-size:clamp(16px,1.35vw,18.5px);font-weight:560;line-height:1.35;letter-spacing:-.018em;color:var(--dx-ink);}

/* ---- leadership ---- */
.dx-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--dx-line);border:1px solid var(--dx-line);}
.dx-team--2{grid-template-columns:repeat(2,minmax(0,1fr));}
.dx-team--2 .dx-mem{padding:18px;}
.dx-team--2 .dx-mem__av{width:44px;height:44px;border-radius:13px;font-size:15px;}
.dx-team--2 .dx-mem__b{font-size:12.5px;}
.dx-mem{background:var(--dx-paper);padding:clamp(20px,2.2vw,28px);display:grid;gap:12px;align-content:start;transition:background-color .4s;}
.dx-mem:hover{background:var(--dx-white);}
.dx-mem__av{
  width:56px;height:56px;border-radius:16px;display:grid;place-items:center;
  font-family:var(--dx-f-display);font-size:19px;font-weight:600;letter-spacing:-.02em;
  background:linear-gradient(150deg,var(--dx-sky-deep),var(--dx-sky-mid));color:#06283A;
}
.dx-mem__n{display:block;font-family:var(--dx-f-display);font-size:16px;font-weight:620;color:var(--dx-ink);letter-spacing:-.02em;}
.dx-mem__r{display:block;font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--dx-beige-deep);margin-top:3px;line-height:1.35;}
.dx-mem__b{font-size:13.5px;line-height:1.5;color:var(--dx-body);}

/* ---- GCC practice grid ---- */
.dx-gcc{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;
  background:var(--dx-line);border:1px solid var(--dx-line);
  border-radius:18px;overflow:hidden;margin-top:clamp(32px,4vw,52px);
}
.dx-gccc{background:var(--dx-white);padding:clamp(22px,2.4vw,30px);display:grid;gap:11px;align-content:start;transition:background-color .4s;}
.dx-gccc:hover{background:var(--dx-red-wash);}
.dx-gccc__hd{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.dx-gccc__n{font-family:var(--dx-f-mono);font-size:12px;letter-spacing:.16em;color:var(--dx-red);}
.dx-gccc__t{font-family:var(--dx-f-display);font-size:17px;font-weight:620;color:var(--dx-ink);letter-spacing:-.022em;line-height:1.25;}
.dx-gccc__d{font-size:14px;line-height:1.55;color:var(--dx-body);}

/* ---- industrial project execution (chapter 02, second half) ---- */
.dx-ind{margin-top:clamp(52px,6vw,88px);border-top:1px solid var(--dx-line);padding-top:clamp(40px,4.6vw,68px);}
.dx-ind__hd{max-width:var(--dx-measure);}
.dx-ind__h{margin-top:16px;}
.dx-ind__hd .dx-lead{margin-top:16px;}
.dx-ind__photo{
  position:relative;margin-top:clamp(26px,3vw,40px);border-radius:20px;overflow:hidden;
  border:1px solid var(--dx-line);background:var(--dx-ink);
}
.dx-ind__photo img{display:block;width:100%;height:clamp(210px,26vw,330px);object-fit:cover;}
.dx-ind__photo figcaption{
  position:absolute;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;gap:6px 18px;
  align-items:baseline;padding:clamp(16px,2vw,24px);
  background:linear-gradient(180deg,rgba(10,10,10,0),rgba(10,10,10,.82));
  font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;
  color:rgba(255,255,255,.72);
}
.dx-ind__photo figcaption span:first-child{color:#fff;}
.dx-ind__pts{margin-top:clamp(22px,2.6vw,34px);}
.dx-ind__sub{display:flex;align-items:center;gap:18px;margin-top:clamp(40px,4.6vw,68px);}
.dx-ind__subh{font-family:var(--dx-f-display);font-size:clamp(19px,2vw,24px);font-weight:620;letter-spacing:-.028em;color:var(--dx-ink);white-space:nowrap;}
.dx-ind__rule{flex:1;height:1px;background:var(--dx-line);}
.dx-con{display:grid;gap:clamp(14px,1.6vw,20px);margin-top:clamp(22px,2.6vw,32px);}
.dx-conp{
  display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);
  gap:clamp(20px,2.6vw,40px);padding:clamp(22px,2.6vw,34px);
  background:var(--dx-white);border:1px solid var(--dx-line);border-radius:18px;
}
.dx-conp__hd{display:grid;gap:12px;align-content:start;}
.dx-conp__t{font-family:var(--dx-f-display);font-size:19px;font-weight:620;color:var(--dx-ink);letter-spacing:-.024em;line-height:1.2;}
.dx-conp__d{font-size:13.5px;line-height:1.6;color:var(--dx-body);}
.dx-conp__cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(18px,2.2vw,30px);}
.dx-conp__cols.is-2{grid-template-columns:repeat(2,minmax(0,1fr));}
.dx-cond{min-width:0;}
/* two lines' worth of height so a discipline whose name wraps does not push its
   own list out of step with the column beside it */
.dx-cond__t{
  display:flex;align-items:flex-end;min-height:2.9em;line-height:1.45;
  font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--dx-red-deep);padding-bottom:10px;border-bottom:1px solid var(--dx-line);
}
.dx-cond__l{display:grid;gap:9px;margin-top:12px;}
.dx-cond__l li{display:flex;gap:9px;font-size:13.5px;line-height:1.5;color:var(--dx-body);}
.dx-cond__b{flex:none;width:5px;height:5px;margin-top:8px;border-radius:50%;background:var(--dx-beige-deep);}

/* ---- posts ---- */
.dx-posts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,2vw,26px);margin-top:clamp(30px,3.6vw,48px);}
.dx-posts--wide{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:clamp(18px,2.2vw,30px);}
.dx-post{display:grid;gap:11px;align-content:start;min-width:0;}
.dx-post__body{display:grid;gap:11px;align-content:start;min-width:0;}
/* second-row cards lay the art beside the text rather than above it */
.dx-post--row{grid-template-columns:minmax(0,202px) minmax(0,1fr);gap:clamp(14px,1.6vw,22px);align-items:start;}
.dx-post--row .dx-post__t{font-size:17px;}
.dx-post__img{
  display:block;border-radius:14px;overflow:hidden;border:1px solid var(--dx-line);
  background:var(--dx-sky-wash);
}
.dx-post__art{display:block;width:100%;height:auto;}
.dx-post:hover .dx-post__t{color:var(--dx-red-deep);}
.dx-post__m{display:flex;flex-wrap:wrap;gap:10px;font-family:var(--dx-f-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8D8B83;margin-top:4px;}
.dx-post__m b{color:var(--dx-red-deep);font-weight:500;}
.dx-post__t{font-family:var(--dx-f-display);font-size:18px;font-weight:600;color:var(--dx-ink);letter-spacing:-.022em;line-height:1.26;transition:color .3s;}
.dx-post__x{font-size:13.5px;line-height:1.55;color:var(--dx-body);}

/* ---- contact form ---- */
.dx-contact{
  border-radius:20px;padding:clamp(20px,2.4vw,30px);min-width:0;
  background:var(--dx-white);border:1px solid var(--dx-line);
  box-shadow:0 34px 70px -46px rgba(30,52,74,.5);
}
.dx-form{display:grid;gap:14px;}
/* min-width:0 on the field and the control is what stops the native select —
   whose intrinsic width is set by its longest option — from pushing past the
   card's right edge. Grid items default to min-width:auto, which lets an
   over-wide child overflow its own column. */
.dx-field{display:grid;gap:6px;min-width:0;}
.dx-field label{font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#8D8B83;}
.dx-dark .dx-field label{color:var(--dx-beige);}
.dx-field input,.dx-field textarea,.dx-field select{
  height:50px;padding:0 15px;border-radius:11px;border:1px solid var(--dx-line);
  background:var(--dx-white);color:var(--dx-ink);outline:none;font-size:15px;
  transition:border-color .3s,box-shadow .3s;
  width:100%;min-width:0;max-width:100%;
}
.dx-field textarea{height:auto;min-height:110px;padding:13px 15px;resize:vertical;line-height:1.55;}
/* the native chevron sits differently in every browser, so it is replaced with
   one drawn to the same weight as the rest of the interface */
.dx-field select{
  appearance:none;-webkit-appearance:none;-moz-appearance:none;
  padding-right:38px;font-size:14.5px;cursor:pointer;text-overflow:ellipsis;
  background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235F5E58' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 15px center;background-size:14px 14px;
}
.dx-field input:focus,.dx-field textarea:focus,.dx-field select:focus{border-color:var(--dx-red);box-shadow:0 0 0 3px rgba(217,0,0,.15);}
.dx-form__row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
.dx-form__row>*{min-width:0;}
.dx-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}
.dx-form__ok{padding:14px 16px;border-radius:12px;background:#EAF2EC;border:1px solid #BFD9C8;color:#2F6B4F;font-size:14px;}
.dx-form__note{font-size:12.5px;color:#8D8B83;}
.dx-form__err{
  padding:12px 14px;border-radius:12px;font-size:13.5px;line-height:1.5;
  background:var(--dx-red-wash);border:1px solid var(--dx-red-soft);color:var(--dx-red-deep);
}
.dx-form__err a{text-decoration:underline;}

/* ---- published contact details ---- */
.dx-cd{display:grid;gap:18px;margin-top:clamp(28px,3vw,40px);font-style:normal;max-width:420px;}
.dx-cd__r{display:flex;gap:14px;align-items:flex-start;}
.dx-cd__r>span:last-child{display:grid;gap:2px;min-width:0;}
.dx-cd__k{font-family:var(--dx-f-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8D8B83;margin-bottom:4px;}
.dx-cd__v{font-size:14.5px;line-height:1.5;color:var(--dx-ink);}
.dx-cd__a{color:var(--dx-red-deep);transition:color .3s;}
.dx-cd__a:hover{color:var(--dx-red);}
.dx-cd__tbc{color:#A3A199;font-style:italic;}

/* ---- integrations ---- */
.dx-int{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,1.8vw,24px);}
.dx-intc{
  display:grid;gap:14px;align-content:start;padding:clamp(24px,2.6vw,34px);
  border-radius:20px;background:var(--dx-white);border:1px solid var(--dx-line);
}
.dx-intc__t{font-family:var(--dx-f-display);font-size:19px;font-weight:620;color:var(--dx-ink);letter-spacing:-.024em;}
.dx-intc__k{font-family:var(--dx-f-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dx-beige-deep);}
.dx-intc__d{font-size:14px;line-height:1.6;color:var(--dx-body);}

/* ---- faq ---- */
.dx-faq{display:grid;border-top:1px solid var(--dx-line);}
.dx-faq__i{border-bottom:1px solid var(--dx-line);}
.dx-faq__q{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;width:100%;padding:24px 0;text-align:left;}
.dx-faq__qt{font-family:var(--dx-f-display);font-size:clamp(16px,1.5vw,20px);font-weight:560;color:var(--dx-ink);letter-spacing:-.022em;line-height:1.3;}
.dx-faq__ic{width:30px;height:30px;flex:none;border-radius:9px;display:grid;place-items:center;box-shadow:0 0 0 1px var(--dx-line) inset;color:var(--dx-ink);transition:background-color .35s,color .35s,box-shadow .35s,transform .35s var(--dx-ease);}
.dx-faq__i.is-open .dx-faq__ic{background:var(--dx-red);color:#fff;box-shadow:none;transform:rotate(180deg);}
.dx-faq__a{overflow:hidden;}
.dx-faq__ai p{max-width:660px;padding-bottom:26px;font-size:15.5px;line-height:1.66;color:var(--dx-body);}
.dx-faq__ai p + p{padding-top:12px;}

/* ---- testimonials ---- */
.dx-quotes{position:relative;min-height:clamp(250px,26vw,300px);}
.dx-quote{
  position:absolute;inset:0;display:grid;gap:22px;align-content:center;justify-items:center;text-align:center;
}
.dx-quote__t{
  font-family:var(--dx-f-display);font-size:clamp(19px,2.3vw,31px);font-weight:450;
  line-height:1.32;letter-spacing:-.028em;color:var(--dx-ink);max-width:820px;text-wrap:balance;
}
.dx-dark .dx-quote__t{color:#fff;}
.dx-quote__w{display:flex;align-items:center;gap:12px;}
.dx-quote__n{font-size:14.5px;font-weight:600;color:var(--dx-ink);}
.dx-dark .dx-quote__n{color:#fff;}
.dx-quote__r{font-family:var(--dx-f-mono);font-size:11px;letter-spacing:.1em;color:#8D8B83;}
.dx-dots{display:flex;gap:8px;justify-content:center;margin-top:30px;}
.dx-dots button{width:26px;height:3px;border-radius:2px;background:var(--dx-line);transition:background-color .35s,width .35s var(--dx-ease);}
.dx-dots button.is-on{background:var(--dx-red);width:44px;}
.dx-dark .dx-dots button{background:rgba(216,196,160,.28);}
.dx-dark .dx-dots button.is-on{background:var(--dx-beige);}

/* ---- footer ---- */
.dx-ft{background:var(--dx-ink);color:var(--dx-body-dark);padding-top:clamp(56px,6vw,84px);}
.dx-ft__grid{display:grid;grid-template-columns:1.4fr repeat(4,minmax(0,1fr));gap:clamp(24px,3vw,44px);padding-bottom:clamp(40px,5vw,64px);}
.dx-ft__h{font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--dx-beige);margin-bottom:16px;}
.dx-ft__l{display:grid;gap:10px;}
.dx-ft__l a{font-size:14px;color:var(--dx-body-dark);transition:color .3s;}
.dx-ft__l a:hover{color:#fff;}
.dx-ft__brand p{font-size:14px;max-width:300px;margin-top:16px;}
.dx-ft__addr{display:grid;gap:4px;margin-top:20px;max-width:300px;font-style:normal;font-size:13.5px;line-height:1.5;color:var(--dx-body-dark);}
.dx-ft__addrh{font-family:var(--dx-f-mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--dx-beige);margin-bottom:4px;}
.dx-ft__addrl{display:inline-flex;align-items:center;gap:8px;margin-top:6px;color:#fff;transition:color .3s;}
.dx-ft__addrl:hover{color:var(--dx-beige);}
.dx-ft__soc{display:flex;gap:8px;margin-top:20px;}
.dx-ft__soc a{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;box-shadow:0 0 0 1px var(--dx-line-dark) inset;color:var(--dx-beige);transition:background-color .3s,color .3s;}
.dx-ft__soc a:hover{background:var(--dx-beige);color:var(--dx-sky-deep);}
.dx-ft__legal{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding-block:22px;border-top:1px solid var(--dx-line-dark);font-size:13px;}
.dx-ft__legal nav{display:flex;flex-wrap:wrap;gap:20px;}
.dx-ft__lang{display:flex;gap:4px;}
.dx-ft__lang button{font-family:var(--dx-f-mono);font-size:11px;letter-spacing:.1em;padding:6px 10px;border-radius:8px;color:var(--dx-body-dark);transition:color .3s,background-color .3s;}
.dx-ft__lang button.is-on{background:rgba(216,196,160,.14);color:var(--dx-beige);}

/* ---- about page ---- */
.dx-abhero{
  position:relative;overflow:hidden;background:var(--dx-ink);color:#fff;
  padding-top:calc(var(--dx-hdr-h) + clamp(72px,10vw,140px));padding-bottom:clamp(72px,10vw,140px);
  min-height:min(88vh,860px);display:flex;align-items:center;
}
.dx-abhero::before{
  content:"";position:absolute;inset:0;
  background:radial-gradient(58% 60% at 16% 22%,rgba(216,196,160,.24),transparent 64%),radial-gradient(52% 62% at 88% 78%,rgba(46,150,212,.4),transparent 66%),radial-gradient(40% 40% at 62% 6%,rgba(183,220,243,.16),transparent 70%);
}
.dx-abhero__scan{
  position:absolute;inset:0;opacity:.5;
  background-image:repeating-linear-gradient(0deg,rgba(216,196,160,.055) 0 1px,transparent 1px 5px);
  -webkit-mask-image:linear-gradient(160deg,#000 8%,transparent 62%);mask-image:linear-gradient(160deg,#000 8%,transparent 62%);
}
.dx-abhero__in{position:relative;display:grid;gap:26px;max-width:880px;}
.dx-abhero .dx-eyebrow{color:var(--dx-beige);}
.dx-abhero .dx-hero__sub{color:rgba(255,255,255,.82);}
.dx-tl{display:grid;gap:0;border-top:1px solid var(--dx-line);}
.dx-tl__r{
  display:grid;grid-template-columns:132px 240px minmax(0,1fr);gap:clamp(16px,2.6vw,44px);
  padding:clamp(22px,2.6vw,34px) 0;border-bottom:1px solid var(--dx-line);align-items:baseline;
  transition:background-color .35s;
}
.dx-tl__r:hover{background:rgba(216,196,160,.09);}
.dx-tl__y{font-family:var(--dx-f-display);font-size:clamp(22px,2.4vw,32px);font-weight:500;letter-spacing:-.03em;color:var(--dx-ink);}
.dx-tl__t{font-family:var(--dx-f-display);font-size:16px;font-weight:620;color:var(--dx-ink);letter-spacing:-.02em;}
.dx-tl__d{font-size:14.5px;line-height:1.6;color:var(--dx-body);}
.dx-split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--dx-line-dark);border:1px solid var(--dx-line-dark);border-radius:20px;overflow:hidden;}
.dx-split__c{background:var(--dx-ink);padding:clamp(26px,3.2vw,46px);display:grid;gap:16px;align-content:start;}
.dx-split__c.is-fwd{background:linear-gradient(150deg,#13202B,#0A0A0A 70%);}

/* ---- responsive ---- */
@media (max-width:1080px){
  /* ribbon narrows to the bead track; the chapter eyebrow carries the label */
  .dx-chap{grid-template-columns:34px minmax(0,1fr);gap:18px;}
  .dx-chap__rail{padding-right:0;}
  .dx-chap__markl{display:none;}
  .dx-team{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-mini{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-gcc,.dx-svcrow{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-conp{grid-template-columns:1fr;}
  .dx-conp__hd{max-width:var(--dx-measure);}
  .dx-pts3{grid-template-columns:1fr;gap:22px;}
  .dx-logos{grid-template-columns:repeat(3,minmax(0,1fr));}
  .dx-ft__grid{grid-template-columns:repeat(3,minmax(0,1fr));}
}
@media (max-width:900px){
  .dx-hdr__nav,.dx-hdr__util .dx-lang,.dx-hdr__util .dx-signin{display:none;}
  .dx-burger{display:grid;}
  .dx-chap__row{grid-template-columns:1fr;gap:30px;}
  .dx-chap__row.is-flip .dx-chap__txt{order:0;}
  .dx-chap__txt{max-width:none;}
  .dx-dash__body{grid-template-columns:1fr;}
  .dx-dash__kpi{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-posts,.dx-int,.dx-gcc,.dx-svcrow{grid-template-columns:1fr;}
  .dx-conp__cols,.dx-conp__cols.is-2{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-ind__sub{gap:14px;}
  .dx-vert{grid-template-columns:1fr;}
  .dx-life__track{grid-template-columns:repeat(4,minmax(0,1fr));row-gap:30px;}
  .dx-hero__media{width:100%;}
  .dx-hero__media::after{background:linear-gradient(180deg,rgba(10,10,10,.93) 0%,rgba(10,10,10,.84) 46%,rgba(10,10,10,.93) 100%);}
  .dx-hero__slash,.dx-hero__wedge{display:none;}
  .dx-hero__meta div + div{padding-left:18px;}
  .dx-life__line{display:none;}
  .dx-logos{grid-template-columns:repeat(3,minmax(0,1fr));}
  .dx-tl__r{grid-template-columns:82px minmax(0,1fr);row-gap:6px;}
  .dx-tl__d{grid-column:2/-1;}
  .dx-split{grid-template-columns:1fr;}
  .dx-stats{grid-template-columns:1fr;}
}
@media (max-width:640px){
  :root{--dx-hdr-h:66px;}
  .dx-svcgrid{grid-template-columns:1fr;}
  .dx-team{grid-template-columns:1fr;}
  .dx-mini,.dx-vert__specs{grid-template-columns:1fr;}
  .dx-life__track{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-ft__grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dx-form__row{grid-template-columns:1fr;}
  .dx-post--row{grid-template-columns:1fr;}
  .dx-conp__cols,.dx-conp__cols.is-2{grid-template-columns:1fr;}
  .dx-ind__subh{white-space:normal;}
  .dx-dash__kpi{grid-template-columns:1fr;}
  .dx-hero{min-height:auto;}
  .dx-chap{grid-template-columns:26px minmax(0,1fr);gap:14px;}
  .dx-chap__markd{width:24px;height:24px;border-radius:8px;font-size:9.5px;}
  .dx-chap__ribbon{left:11px;}
  .dx-btn{width:100%;}
  .dx-hero__cta .dx-btn{width:auto;}
}

/* ---- reduced motion: every animation becomes an instant state change ---- */
@media (prefers-reduced-motion:reduce){
  .dx-root *,.dx-root *::before,.dx-root *::after{
    animation-duration:.001ms !important;animation-iteration-count:1 !important;
    transition-duration:.001ms !important;scroll-behavior:auto !important;
  }
  /* Framer Motion handles its own reduced-motion via MotionConfig; these are
     the few animations still owned by CSS. */
  .dx-flow{animation:none;stroke-dasharray:none;}
  .dx-scrollcue__l{animation:none;}
}
`;

const STYLES = CSS + CSS2 + CSS3;

/* ---------------------------------------------------------------------------
   MOTION PRIMITIVES — Framer Motion

   Every animation on the site is declared here or on the component that owns
   it. <MotionConfig reducedMotion="user"> at the root (see DexoidSite) makes
   Framer collapse all of them to instant state changes when the visitor has
   asked for reduced motion, so there is no second code path to maintain.
   ------------------------------------------------------------------------- */

const EASE = [0.22, 0.72, 0.24, 1];

const revealV = {
  hidden: { opacity: 0, y: 20 },
  shown: { opacity: 1, y: 0 },
};

/** Fade + slide-up as the element crosses ~80% of the viewport, once. */
function Reveal({ as = 'div', delay = 0, className = '', style, children, ...rest }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      style={style}
      variants={revealV}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay: delay / 1000 }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Container whose children animate in sequence. Pair with `staggerItem`. */
const staggerV = (gap = 0.09, delay = 0.05) => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap, delayChildren: delay } },
});
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Lift-on-hover used by every card. */
const liftV = { rest: { y: 0 }, hover: { y: -4, transition: { duration: 0.3, ease: EASE } } };

/** Counts 0 → value once scrolled into view. */
function Count({ to, decimals = 0, prefix = '', suffix = '', duration = 1.5, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setN(to); return; }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: setN });
    return () => controls.stop();
  }, [inView, to, duration, reduced]);
  const text = n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} className={'dx-num ' + className}>{prefix}{text}{suffix}</span>;
}

/** Cycles an index every `ms`; pauses when `paused`. */
function useRotator(length, ms, paused) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused || reduced || length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms, paused, reduced]);
  return [i, setI];
}

/* ---------------------------------------------------------------------------
   ICONS — single stroke set, 1.5px, 24-grid
   ------------------------------------------------------------------------- */

const PATHS = {
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  pen: 'M4 20l4.5-1 9-9a2.1 2.1 0 10-3-3l-9 9L4 20zM14.5 5.5l3 3',
  flask: 'M9.5 3v5.2L4.6 17A2 2 0 006.4 20h11.2a2 2 0 001.8-3l-4.9-8.8V3M8 3h8M7.2 14h9.6',
  factory: 'M3 20h18M4 20V10l5 3.2V10l5 3.2V10l5 3.2V20M8 17h1M12 17h1M16 17h1',
  box: 'M12 3l8 4.3v9.4L12 21l-8-4.3V7.3L12 3zM4 7.3l8 4.3 8-4.3M12 11.6V21',
  code: 'M9 7l-5 5 5 5M15 7l5 5-5 5',
  doc: 'M6 3h8l4 4v14H6V3zM14 3v4h4M9 12h6M9 16h6',
  chart: 'M4 20h16M7 17V10M12 17V5M17 17v-5',
  link: 'M10 13.5a3.5 3.5 0 005 0l3-3a3.5 3.5 0 10-5-5l-1 1M14 10.5a3.5 3.5 0 00-5 0l-3 3a3.5 3.5 0 105 5l1-1',
  plus: 'M12 5v14M5 12h14',
  building: 'M4 21V5.5L13 3v18M13 9h7v12M4 21h17M7.5 8h2M7.5 12h2M7.5 16h2M16 13h1.5M16 17h1.5',
  users: 'M15.5 20v-1.6a3.4 3.4 0 00-3.4-3.4H6.9A3.4 3.4 0 003.5 18.4V20M9.5 11.6a3.3 3.3 0 100-6.6 3.3 3.3 0 000 6.6zM20.5 20v-1.6a3.4 3.4 0 00-2.5-3.3M15.5 5.2a3.3 3.3 0 010 6.4',
  spark: 'M12 3l1.9 5.4L19 10.3l-5.1 1.9L12 17.6l-1.9-5.4L5 10.3l5.1-1.9L12 3zM18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z',
  arrow: 'M5 12h13M13 6.5l5.5 5.5-5.5 5.5',
  chev: 'M6 9.5l6 6 6-6',
  check: 'M4.5 12.5l4.5 4.5L19.5 6.5',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5.5v13l11-6.5-11-6.5z',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3.5 9h17M3.5 15h17M12 3a15 15 0 010 18M12 3a15 15 0 000 18',
  gauge: 'M4.5 18a9 9 0 1115 0M12 13.5l4-4',
  bolt: 'M13.5 3L6 13.5h5L10.5 21 18 10.5h-5L13.5 3z',
  battery: 'M3 8.5h13v7H3v-7zM19 11v2M16.5 8.5h1.6v7h-1.6M6 11v2M9 11v2',
  truck: 'M3 6h11v10H3V6zM14 9.5h3.6l2.4 3V16h-6M7 19a1.8 1.8 0 100-3.6A1.8 1.8 0 007 19zM17.5 19a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z',
  layers: 'M12 3.5l8.5 4.3L12 12 3.5 7.8 12 3.5zM3.5 12.2L12 16.5l8.5-4.3M3.5 16.4L12 20.7l8.5-4.3',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  shield: 'M12 3l7 2.7v5.6c0 4.3-2.9 7.6-7 9.7-4.1-2.1-7-5.4-7-9.7V5.7L12 3zM9 12l2.2 2.2L15.5 10',
  wrench: 'M15.5 4a5 5 0 00-4.4 7.4L4 18.5 5.5 20l7.1-7.1A5 5 0 0019.5 6.4l-2.6 2.6-2.4-.6-.6-2.4L16.5 3.4A5 5 0 0015.5 4z',
  cpu: 'M8 8h8v8H8V8zM5.5 5.5h13v13h-13v-13zM9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3',
  mail: 'M3.5 6.5h17v11h-17v-11zM3.5 7l8.5 6 8.5-6',
  phone: 'M7.8 3.5l2.2 4-1.8 1.8a11 11 0 004.5 4.5l1.8-1.8 4 2.2v3.3a1.5 1.5 0 01-1.7 1.5C9.6 18.2 5.8 14.4 4.5 5.2A1.5 1.5 0 016 3.5h1.8z',
  pin: 'M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  li: 'M6.5 9.5V19M6.5 5.6v.1M11 19v-5.4a3 3 0 016 0V19',
  x: 'M4.5 4.5l15 15M19.5 4.5l-15 15',
  yt: 'M3.5 12c0-2.5.2-3.8.5-4.5.3-.7.9-1.1 1.7-1.2C7.2 6.1 9.3 6 12 6s4.8.1 6.3.3c.8.1 1.4.5 1.7 1.2.3.7.5 2 .5 4.5s-.2 3.8-.5 4.5c-.3.7-.9 1.1-1.7 1.2-1.5.2-3.6.3-6.3.3s-4.8-.1-6.3-.3c-.8-.1-1.4-.5-1.7-1.2-.3-.7-.5-2-.5-4.5zM10.5 9.5l4.5 2.5-4.5 2.5v-5z',
};

function Icon({ name, size = 18, stroke = 1.5, className = '', ...rest }) {
  const d = PATHS[name] || PATHS.arrow;
  return (
    <svg
      className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      <path d={d} />
    </svg>
  );
}

const Arrow = () => <Icon name="arrow" size={15} className="dx-arw" />;

/* ---------------------------------------------------------------------------
   LOGO — full wordmark and compact mark (the header swaps between them)
   The mark is a hexagonal "D" cut from a drivetrain axis; drawn, not imported.
   ------------------------------------------------------------------------- */

/* The supplied mark, traced from the brand artwork: an isometric square
   bracket. The red is the lit pair of faces (top + right), the solid colour is
   the shadowed pair (left + bottom) with the fold between them left open as a
   hairline, and the square counter is the ground showing through.
   `tone="light"` means the mark sits on a dark ground, so the shadowed faces
   invert to white and the crease takes the dark ground colour. */
function Mark({ size = 32, tone = 'light' }) {
  const face = tone === 'light' ? '#FFFFFF' : tokens.color.ink;
  const ground = tone === 'light' ? tokens.color.ink : tokens.color.paper;
  return (
    <svg width={size} height={size} viewBox="0 0 45 48" fill="none" aria-hidden="true" focusable="false">
      {/* lit faces: top, then down the right */}
      <path fill={tokens.color.red} d="M3 2 L32 2 L43 13 L43 34 L31 46 L31 13 L14 13 Z" />
      {/* shadowed faces: left, then along the bottom */}
      <path fill={face} d="M2 5 L13 16 L13 34 L2 46 Z" />
      <path fill={face} d="M13 34 L29 34 L29 46 L2 46 Z" />
      {/* the fold between them */}
      <path stroke={ground} strokeWidth="0.7" d="M2 46 L13 34" />
    </svg>
  );
}

function Wordmark({ tone = 'light', compact = false }) {
  const fg = tone === 'light' ? '#FFFFFF' : tokens.color.ink;
  return (
    <>
      <Mark size={34} tone={tone} />
      {/* "Technologies" is tracked out to sit flush with "Dexoid" above it,
          as it does in the supplied artwork. */}
      <span
        style={{
          display: compact ? 'none' : 'grid', gap: '2px', lineHeight: 1,
          transition: 'opacity .35s ' + tokens.ease,
        }}
      >
        <span style={{
          fontFamily: tokens.font.display, fontSize: '19px', fontWeight: 700,
          letterSpacing: '-.03em', color: fg,
        }}>Dexoid</span>
        <span style={{
          fontFamily: tokens.font.display, fontSize: '10.5px', fontWeight: 600,
          letterSpacing: '.075em', color: fg,
        }}>Technologies</span>
      </span>
    </>
  );
}

/* ---------------------------------------------------------------------------
   CONTENT — CMS collections
   ------------------------------------------------------------------------- */

/* The programme lifecycle Dexoid runs. Genuinely sequential, so it is numbered. */
const LIFECYCLE = [
  { k: 'L1', icon: 'compass', t: 'Concept', s: 'Requirements, benchmark teardown, target cost.' },
  { k: 'L2', icon: 'pen', t: 'Design', s: 'Packaging, CAD modelling, DFM release.' },
  { k: 'L3', icon: 'cpu', t: 'Simulate', s: 'CAE, thermal, NVH and crash correlation.' },
  { k: 'L4', icon: 'wrench', t: 'Prototype', s: 'Soft tooling, A/B builds, rig instrumentation.' },
  { k: 'L5', icon: 'gauge', t: 'Validate', s: 'Durability, homologation and field cycles.' },
  { k: 'L6', icon: 'factory', t: 'Industrialise', s: 'Line layout, PPAP, supplier readiness.' },
  { k: 'L7', icon: 'truck', t: 'Start of Production', s: 'Ramp support, yield and warranty watch.' },
];

/* Six chapters of the homepage narrative. Numbered because a reader moves
   through them in order; the ribbon tracks that position. */
const CHAPTERS = [
  { id: 'chapter-1', n: '01', rail: 'Overview', eyebrow: 'Chapter 01 · Who we are' },
  { id: 'chapter-2', n: '02', rail: 'Core services', eyebrow: 'Chapter 02 · Core services' },
  { id: 'chapter-3', n: '03', rail: 'GCC setup', eyebrow: 'Chapter 03 · Automotive GCC setup & scale' },
  { id: 'chapter-4', n: '04', rail: 'Leadership', eyebrow: 'Chapter 04 · Leadership' },
  { id: 'chapter-5', n: '05', rail: 'Insights', eyebrow: 'Chapter 05 · Insights' },
  { id: 'chapter-6', n: '06', rail: 'Contact', eyebrow: 'Chapter 06 · Contact' },
];

/* Chapter 01 — differentiators */
const OVERVIEW_POINTS = [
  { t: 'Multi-Sector Expertise', d: 'Experience across all automotive sectors and vehicle types.' },
  { t: 'End-to-End Solutions', d: 'From concept to production and beyond.' },
  { t: 'Innovation-Driven', d: 'Leveraging latest technologies and methodologies.' },
  { t: 'Global Standards', d: 'Maintaining international quality and compliance benchmarks.' },
];

/* Chapter 02 — core services */
const SERVICES = [
  {
    k: 'S1', icon: 'compass', t: 'Consulting',
    d: 'Strategic automotive consulting for market analysis, technology roadmap development, supply chain optimisation, and industry-specific solutions tailored to your business needs.',
  },
  {
    k: 'S2', icon: 'factory', t: 'Manufacturing',
    d: 'State-of-the-art precision manufacturing of automotive components with strict quality control, advanced processes, and scalable production capabilities for all vehicle types.',
  },
  {
    k: 'S3', icon: 'pen', t: 'Design',
    d: 'Innovative automotive design services covering conceptual design, CAD modelling, aerodynamics, ergonomics, and aesthetic development for next-generation vehicles.',
  },
  {
    k: 'S4', icon: 'flask', t: 'Research & Development',
    d: 'Cutting-edge R&D initiatives focusing on emerging technologies, sustainability, performance enhancement, and breakthrough innovations in automotive engineering.',
  },
];

/* Chapter 02, second half — industrial project execution. Copy supplied by the
   client verbatim; only the punctuation has been normalised. */
const INDUSTRIAL_POINTS = [
  {
    n: '01', icon: 'target', t: 'Land & Site Identification',
    d: 'Site identification and evaluation matched precisely to industrial project requirements — location, connectivity, utility access, and scalability.',
  },
  {
    n: '02', icon: 'shield', t: 'Regulatory Licence',
    d: 'End-to-end government and statutory approvals, managed to remove compliance bottlenecks and keep projects on schedule.',
  },
  {
    n: '03', icon: 'building', t: 'Civil Execution',
    d: 'Design-to-handover construction delivery, engineered for cost efficiency and quality without compromising timelines.',
  },
  {
    n: '04', icon: 'link', t: 'Local Network',
    d: 'Direct access to vetted contractors, suppliers, and Dexoid’s established automotive base — reducing sourcing risk and execution lead time.',
  },
];

/* The construction offer, in three groups. Each group carries two or three
   disciplines; every discipline is a scope list, so the whole offer reads as a
   capability matrix rather than prose. */
const CONSTRUCTION = [
  {
    k: 'C1', icon: 'cpu', t: 'Engineering',
    d: 'Design and installation of core building systems — mechanical, electrical, and plumbing — engineered for reliability, safety, and long-term operational efficiency.',
    cols: [
      {
        t: 'Mechanical',
        items: [
          'Fire suppression, fire fighting & sprinkler systems',
          'Fire hydrant installations & fire pumps',
          'Pumps and pumping systems',
          'Process, gas & piped network systems (PVC, steel, copper, Victaulic)',
          'Water treatment, sewage & leakage detection systems',
        ],
      },
      {
        t: 'Electrical',
        items: [
          'Power distribution, control & automation systems',
          'Electrical panels, cabling & lighting systems',
          'UPS / inverter systems',
          'Fire detection & alarm systems',
          'Access control & CCTV systems',
        ],
      },
      {
        t: 'Plumbing',
        items: [
          'Sewage drainage system',
          'Stormwater system',
          'Rainwater harvesting',
          'Hydro-pneumatic system',
          'Process water systems',
        ],
      },
    ],
  },
  {
    k: 'C2', icon: 'factory', t: 'Construction',
    d: 'Ground-up civil execution and climate control infrastructure delivered with full project accountability — from planning through final handover.',
    cols: [
      {
        t: 'Civil',
        items: [
          'Planning & cost estimation',
          'Procurement & logistics',
          'Execution',
          'Quality assurance & control',
          'Final inspection & handover',
        ],
      },
      {
        t: 'HVAC',
        items: [
          'Centralised air conditioning & VRV/VRF systems',
          'Chilled water & direct expansion (DX) systems',
          'Ducting & air distribution',
          'Cold room & clean room solutions',
          'Building management system (BMS) & cooling tower operations',
        ],
      },
    ],
  },
  {
    k: 'C3', icon: 'shield', t: 'Safety & Sustainability',
    d: 'A single-window delivery model combined with rigorous health, safety, and environmental practices — ensuring projects are executed responsibly, on schedule, and with minimal risk to people and the environment.',
    cols: [
      {
        t: 'Design & Build',
        items: [
          'Innovative design development & integrated engineering',
          'Detailed cost analysis & budget management',
          'Regulatory compliance & permitting',
          'Risk assessment & mitigation',
          'Post-construction support & maintenance',
        ],
      },
      {
        t: 'Health, Safety & Environment',
        items: [
          'On-site safety audits & risk assessments',
          'PPE compliance & emergency preparedness',
          'Environmental impact management',
          'Waste management & disposal compliance',
          'Regulatory HSE compliance & reporting',
        ],
      },
    ],
  },
];

/* Chapter 03 — Global Capability Centre practice */
const GCC = [
  { n: '01', icon: 'target', t: 'GCC Strategy & Business Plan', d: 'Market entry roadmap, business case and 3–5 year plan tailored to your India ambitions.' },
  { n: '02', icon: 'building', t: 'Location & Infrastructure', d: 'Identifying the right city, facility and infrastructure fit for your GCC’s scale and function.' },
  { n: '03', icon: 'box', t: 'Vendor & Supplier Identification', d: 'Sourcing the right vendors and suppliers at the right price, vetted for quality and reliability.' },
  { n: '04', icon: 'users', t: 'Skilled Talent Acquisition', d: 'Strategic guidance on manpower allocation, capacity building, and talent pipeline development.' },
  { n: '05', icon: 'shield', t: 'Legal, Compliance & Operations', d: 'End-to-end entity setup, statutory compliance and operational readiness in India.' },
  { n: '06', icon: 'battery', t: 'OEM, EV & Battery Connectivity', d: 'Direct connectivity into India’s OEM, EV and battery raw-material ecosystem.' },
];

/* Client marks, as supplied. `img` is a key into ASSETS. Confirm each
   relationship is approved for public use before launch. */
const CLIENT_LOGOS = [
  { n: 'Tata Motors', img: 'logo_tata' },
  { n: 'Mahindra', img: 'logo_mahindra' },
  { n: 'Hero Motors', img: 'logo_hero' },
  { n: 'BatX Energies', img: 'logo_batx' },
  { n: 'LOHUM', img: 'logo_lohum' },
];

/* PLACEHOLDER — replace with approved, attributable quotes. */
const TESTIMONIALS = [
  { q: 'They arrived for a six-week packaging study and stayed through Start of Production. The weekly cost-and-mass report is the only document our steering committee actually reads.', n: 'Ananya Raghavan', r: 'VP Engineering · Commercial vehicle OEM' },
  { q: 'We had been told the range shortfall was a cell problem. Dexoid instrumented the vehicle, found it in the thermal loop, and had a fix on the rig inside seven weeks.', n: 'Marcus Feld', r: 'Head of Propulsion · E-axle supplier' },
  { q: 'The should-cost model they built is now how we open every supplier negotiation. It has paid for the engagement several times over.', n: 'Priya Deshmukh', r: 'Director, Sourcing · Tier-1 machining' },
  { q: 'What we bought was accountability. One team owned design, simulation and the supplier conversation, so nothing fell into a gap between vendors.', n: 'Hiroshi Tanaka', r: 'Programme Director · Confidential OEM' },
];

/* PLACEHOLDER — replace with real leadership, photos and bios. */
const LEADERS = [
  { i: 'RM', n: 'Rohit Mehra', r: 'Founder & Principal Engineer', b: 'Nineteen years across vehicle architecture and industrialisation. Previously led three EV platforms from concept to Start of Production.' },
  { i: 'SK', n: 'Sneha Kulkarni', r: 'Head of Design', b: 'Class-A surfacing and packaging. Holds four patents on load-path optimisation in stamped structures.' },
  { i: 'AV', n: 'Dr. Arun Venkatesh', r: 'Head of R&D', b: 'Thermal and NVH simulation. Built the correlation methodology that keeps our CAE inside a ±4% band of rig data.' },
  { i: 'JN', n: 'Jasleen Nair', r: 'Head of Supply Chain', b: 'Supplier qualification and localisation across India, Germany and Japan. Ran sourcing for a 1.2M-unit component programme.' },
];

const LEADER_POINTS = [
  'Long-term engagement model, not one-off consulting',
  'Dedicated on-ground teams embedded with domain knowledge',
  'Proven trust with clients including BatX, LOHUM and Lico',
];

/* The five published articles. `art` selects one of the built cover graphics in
   BlogArt; swap for a real image URL when photography is ready. `src` is the
   outside report each piece is built on — link the card's footer to it once the
   article pages exist. Dates are PLACEHOLDERS pending the real publish dates. */
const POSTS = [
  {
    c: 'Engineering', d: '02 Sep 2026', art: 'software', read: '6 min',
    t: 'How OEMs can accelerate innovation with modern engineering',
    x: 'AI is in 71% of product development teams and 57% are building SDV architectures. The 2026 State of Automotive Software Development report, and what it means for how you staff a programme.',
    src: '2026 State of Automotive Software Development Report — Perforce',
  },
  {
    c: 'SDV', d: '21 Aug 2026', art: 'sdv', read: '7 min',
    t: 'Why software-defined vehicles demand a new kind of engineering',
    x: 'Hardware stays on the road for ten years; the software on it changes every few weeks. Closing that gap means designing both as one system from day one — not bolting safety on at the end.',
    src: 'SDVs Call for a Completely New Engineering Discipline — Automotive World',
  },
  {
    c: 'Batteries', d: '06 Aug 2026', art: 'battery', read: '9 min',
    t: 'What India’s battery storage boom means for recycling and reuse',
    x: 'India will generate around 43,000 tonnes of lithium-ion waste a year by 2030, and cells retiring at 70–80% of usable energy are candidates for a second life before any of it is recycled.',
    src: 'ACC Battery Reuse and Recycling Market in India — NITI Aayog & GGEF TCF',
  },
  {
    c: 'Policy', d: '24 Jul 2026', art: 'powertrain', read: '5 min',
    t: 'Why India’s auto leaders are betting on every clean technology',
    x: 'EVs, hybrids and CNG already make up about a third of passenger vehicle sales. Maruti Suzuki’s case at SIAM for treating decarbonisation as a portfolio problem rather than a single technology race.',
    src: 'Every Vehicle Sold Should Contribute Towards Carbon Reduction — Autocar Professional',
  },
  {
    c: 'Industry', d: '09 Jul 2026', art: 'grid', read: '8 min',
    t: 'Silicon, cells and the grid: India’s race to own its energy future',
    x: 'A wafer fab in Dholera, a battery tender out of Delhi and a paper on grid inverters are the same story — India trying to build the three things its clean-energy future depends on.',
    src: 'Why Energy Storage Is the Unsung Hero Keeping India’s Grids Stable — JSW Energy',
  },
];

/* PLACEHOLDER — confirm every figure and timeline before launch. */
const FAQS = [
  {
    q: 'What is Dexoid’s sourcing and vendor selection process?',
    a: [
      'Four steps, and none of them begin with a vendor list. We build a should-cost model for the part first, then shortlist on capability rather than quotation — process fit, capacity headroom, existing OEM approvals. Shortlisted suppliers get an on-site audit by a Dexoid engineer, not a questionnaire. Commercials come last, with the should-cost model open on the table.',
      'Typical elapsed time from brief to two qualified sources is six to nine weeks.',
    ],
  },
  {
    q: 'Do you only work with automotive OEMs, or other manufacturing sectors too?',
    a: [
      'Automotive is the core — OEM, Tier-1 and Tier-2 — but the method transfers. We have run programmes in battery and energy storage, off-highway equipment and industrial machining. If the part is metal-formed, machined, moulded or assembled at volume, the process applies.',
    ],
  },
  {
    q: 'Can you help with both global sourcing and India localisation?',
    a: [
      'That is most of what we do. One side is finding the right global supplier when India cannot yet make the part to spec. The other is moving a part off an imported bill of materials onto an Indian supply base without losing the qualification you already paid for.',
      'Localisation is a re-qualification, not a discount. We run the PPAP evidence, the capability studies and the dual-sourcing needed to prove the move before anyone signs it off.',
    ],
  },
  {
    q: 'What does your Cost Optimisation / VAVE process actually involve?',
    a: [
      'A teardown, a should-cost model and a function analysis, in that order. We strip the assembly, cost every part up from material and process, then ask which functions the customer actually pays for.',
      'What comes back is a ranked list of changes, each with its cost saving, tooling implication and the validation it will need — not a wish list. On recent programmes that list has returned between 8% and 22% of landed cost.',
    ],
  },
  {
    q: 'Do you support projects from design through to full-scale manufacturing?',
    a: [
      'Yes, and that span is the reason the firm exists. Around two thirds of our work ends at Start of Production, covering line layout, PPAP support, supplier readiness and the first ramp weeks. If you need only a design package or only a sourcing strategy, that is a valid scope too — we would rather do one thing properly than pad the engagement.',
    ],
  },
  {
    q: 'How do you ensure quality across your OEM, Tier-1 and Tier-2 network?',
    a: [
      'Every supplier in the network has been physically audited by a Dexoid engineer, and we hold the control plans rather than taking a supplier’s word for them. Capability studies run to a Cpk floor of 1.67 on critical characteristics, and no part stays single-sourced past qualification where a second source is technically possible.',
    ],
  },
  {
    q: 'Can you set up a greenfield manufacturing project from scratch?',
    a: [
      'Yes — site and location study, plant and line layout, equipment specification, vendor selection, statutory approvals, the hiring plan and the ramp. It is the same capability that sits behind our GCC practice, which is why a greenfield plant and a Global Capability Centre are often scoped together.',
    ],
  },
];

const PARTNERS = [
  { k: 'Cells & recycling', t: 'BatX Energies', icon: 'battery', d: 'Joint work on pack architecture and end-of-life recovery, so the recycling route is engineered in at concept rather than retrofitted at homologation.' },
  { k: 'Venture & advisory', t: 'Ideas to Impacts', icon: 'spark', d: 'Early-stage mobility ventures reach us through their portfolio. We provide the engineering diligence — architecture, should-cost, supplier readiness — before capital is committed.' },
  { k: 'Materials recovery', t: 'LOHUM', icon: 'layers', d: 'Second-life and material recovery pathways for the battery programmes we industrialise. Their downstream economics feed straight into our bill-of-materials models.' },
];

/* PLACEHOLDER — replace with the real company history. */
const MILESTONES = [
  { y: '2016', t: 'Two engineers, one contract', d: 'Founded in Pune as a two-person packaging and DFM practice serving a single Tier-1 castings client.' },
  { y: '2018', t: 'Simulation brought in house', d: 'Added CAE and thermal capability after too many programmes stalled waiting on external analysis.' },
  { y: '2020', t: 'First programme to Start of Production', d: 'Owned a commercial LCV sub-assembly from concept through PPAP and the first eight ramp weeks.' },
  { y: '2021', t: 'Electrification practice opens', d: 'Pack architecture, thermal loops and BMS calibration become a standing discipline rather than a project add-on.' },
  { y: '2023', t: 'Sourcing desk formalised', d: 'Should-cost modelling and supplier qualification split out as a service after clients kept asking to buy it alone.' },
  { y: '2024', t: 'GCC practice launched', d: 'Global OEMs began asking us to stand up their India capability centres, not just their supply base.' },
  { y: '2026', t: 'Forty programmes delivered', d: 'Across six vehicle segments and nine countries, with 94% reaching Start of Production on the original date.' },
];

/* ---------------------------------------------------------------------------
   ROUTING — two pages, hash based. Swap for next/link in a Next.js app.
   ------------------------------------------------------------------------- */

const SiteCtx = createContext(null);
const useSite = () => useContext(SiteCtx);

function useHashRoute() {
  const read = () => {
    if (typeof window === 'undefined') return { page: 'home', hash: '' };
    const h = window.location.hash || '';
    return h.indexOf('#/about') === 0 ? { page: 'about', hash: h } : { page: 'home', hash: h };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/* ---------------------------------------------------------------------------
   HEADER + MEGA MENU
   ------------------------------------------------------------------------- */

function MegaMenu({ group, open, onOpen, onClose, id }) {
  const closeTimer = useRef(0);
  const { go } = useSite();
  const enter = () => { clearTimeout(closeTimer.current); onOpen(); };
  const leave = () => { closeTimer.current = setTimeout(onClose, 140); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return (
    <div className="dx-megawrap" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        className={'dx-navbtn' + (open ? ' is-open' : '')}
        aria-expanded={open} aria-controls={id} aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
      >
        {group.label}
        <Icon name="chev" size={14} className="dx-navbtn__c" />
      </button>
      {/* fades and drops 8px into place, and unmounts on close so the links
          leave the tab order with it */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={id} role="group" aria-label={group.label}
            className={'dx-mega' + (group.items.length < 3 ? ' dx-mega--1' : '')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            {group.items.map((it) => (
              /* headings only — the one-line descriptions were removed at the
                 client's request, so each row is now a single flush line */
              <a
                key={it.title} href={it.href} className="dx-mega__i"
                onClick={(e) => { e.preventDefault(); onClose(); go(it.href); }}
              >
                <span className="dx-badge dx-badge--outline"><Icon name={it.icon} size={17} /></span>
                <span className="dx-mega__t">{it.title}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({ solid, onDark }) {
  const { go, lang, cycleLang } = useSite();
  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') { setOpen(null); setMobile(false); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  // The homepage hero is light, so header type stays dark by default; only the
  // About page's near-black hero flips it.
  const tone = onDark && !solid ? 'light' : 'dark';

  return (
    <>
      <header className={'dx-hdr' + (solid ? ' is-solid' : '') + (onDark ? ' dx-hdr--ondark' : '')}>
        <div className="dx-shell dx-hdr__in">
          <a
            href="#top" className="dx-hdr__logo" aria-label="Dexoid Technologies — home"
            onClick={(e) => { e.preventDefault(); go('#top'); setMobile(false); }}
          >
            <Wordmark tone={tone} compact={solid} />
          </a>

          <nav className="dx-hdr__nav" aria-label="Primary">
            {NAV.map((g, i) => (
              <MegaMenu
                key={g.label} group={g} id={'dx-mega-' + i}
                open={open === i} onOpen={() => setOpen(i)} onClose={() => setOpen((v) => (v === i ? null : v))}
              />
            ))}
          </nav>

          <span className="dx-hdr__sp" />

          <div className="dx-hdr__util">
            <button type="button" className="dx-lang" onClick={cycleLang} aria-label={'Language: ' + lang + '. Change language.'}>
              <Icon name="globe" size={14} />{lang}
            </button>
            <a href="#signin" className="dx-btn dx-btn--ghost dx-btn--sm dx-signin" onClick={(e) => e.preventDefault()}>Sign In</a>
            <a href={CTA_HREF} className="dx-btn dx-btn--primary dx-btn--sm" onClick={(e) => { e.preventDefault(); go(CTA_HREF); }}>
              {CTA_LABEL}
            </a>
            <button
              type="button" className="dx-burger" aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile} onClick={() => setMobile((v) => !v)}
            >
              <Icon name={mobile ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobile && (
          <motion.div
            className="dx-mnav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {NAV.map((g) => (
              <div className="dx-mnav__g" key={g.label}>
                <div className="dx-mnav__h">{g.label}</div>
                {g.items.map((it) => (
                  <a
                    key={it.title} href={it.href} className="dx-mnav__i"
                    onClick={(e) => { e.preventDefault(); setMobile(false); go(it.href); }}
                  >
                    <span className="dx-badge dx-badge--outline"><Icon name={it.icon} size={17} /></span>
                    <span className="dx-mega__t">{it.title}</span>
                  </a>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <a href={CTA_HREF} className="dx-btn dx-btn--primary" onClick={(e) => { e.preventDefault(); setMobile(false); go(CTA_HREF); }}>{CTA_LABEL}</a>
              <button type="button" className="dx-lang" onClick={cycleLang}><Icon name="globe" size={14} />{lang}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------------------------------------------------------------------
   FOOTER
   ------------------------------------------------------------------------- */

function Footer() {
  const { go, lang, setLang } = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className="dx-ft dx-dark">
      <div className="dx-shell">
        <div className="dx-ft__grid">
          <div className="dx-ft__brand">
            <a href="#top" className="dx-hdr__logo" onClick={(e) => { e.preventDefault(); go('#top'); }} aria-label="Dexoid Technologies — home">
              <Wordmark tone="light" />
            </a>
            <p>Automotive consulting, design, R&amp;D, manufacturing and procurement under one accountable engineering team.</p>

            {/* Published contact details. Email and phone are omitted rather
                than shown empty until CONTACT_DETAILS is filled in. */}
            <address className="dx-ft__addr">
              <span className="dx-ft__addrh">{CONTACT_DETAILS.company}</span>
              {CONTACT_DETAILS.address.map((line) => <span key={line}>{line}</span>)}
              {CONTACT_DETAILS.email ? (
                <a href={'mailto:' + CONTACT_DETAILS.email} className="dx-ft__addrl">
                  <Icon name="mail" size={14} />{CONTACT_DETAILS.email}
                </a>
              ) : null}
              {CONTACT_DETAILS.phone ? (
                <a href={'tel:' + CONTACT_DETAILS.phone.replace(/[^+\d]/g, '')} className="dx-ft__addrl">
                  <Icon name="phone" size={14} />{CONTACT_DETAILS.phone}
                </a>
              ) : null}
            </address>

            <div className="dx-ft__soc">
              <a href="#linkedin" aria-label="Dexoid on LinkedIn" onClick={(e) => e.preventDefault()}><Icon name="li" size={17} /></a>
              <a href="#x" aria-label="Dexoid on X" onClick={(e) => e.preventDefault()}><Icon name="x" size={16} /></a>
              <a href="#youtube" aria-label="Dexoid on YouTube" onClick={(e) => e.preventDefault()}><Icon name="yt" size={17} /></a>
            </div>
          </div>
          {NAV.map((g) => (
            <div key={g.label}>
              <div className="dx-ft__h">{g.label}</div>
              <ul className="dx-ft__l">
                {g.items.map((it) => (
                  <li key={it.title}>
                    <a href={it.href} onClick={(e) => { e.preventDefault(); go(it.href); }}>{it.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="dx-ft__legal">
          {/* Stuttgart and Yokohama were placeholders from the original brief
              and have been dropped — add real offices back when they exist. */}
          <span>© {year} Dexoid Technologies Pvt. Ltd. Pune, India.</span>
          <div className="dx-ft__lang" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button key={l} type="button" className={l === lang ? 'is-on' : ''} onClick={() => setLang(l)} aria-pressed={l === lang}>{l}</button>
            ))}
          </div>
          <nav aria-label="Legal">
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#cookies" onClick={(e) => e.preventDefault()}>Cookies</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------------------
   HERO
   ------------------------------------------------------------------------- */

const LOOP_WORDS = ['innovation', 'manufacturing'];

/* mode="wait" retires the outgoing word before the next arrives, so the two
   never sit on top of one another. */
function LoopWord() {
  const [i] = useRotator(LOOP_WORDS.length, 2800, false);
  const longest = LOOP_WORDS.reduce((a, b) => (b.length > a.length ? b : a));
  return (
    <span className="dx-loop">
      {/* reserves the widest phrasing so the line never reflows */}
      <span aria-hidden="true" style={{ gridArea: '1/1', visibility: 'hidden' }}>{longest}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={LOOP_WORDS[i]}
          className="dx-loop__w"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.34, ease: EASE }}
        >
          {LOOP_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const HERO_WORDS = ['Global reach', 'Local expertise', 'Lasting impact'];

function Hero() {
  const { go } = useSite();
  return (
    <section className="dx-hero" id="top" aria-labelledby="dx-hero-h">
      {/* photograph, slash and corner wedge — all decorative */}
      <motion.div
        className="dx-hero__media" aria-hidden="true"
        initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <img src={ASSETS.hero} alt="" />
      </motion.div>
      <motion.span
        className="dx-hero__slash" aria-hidden="true"
        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      />
      <span className="dx-hero__wedge" aria-hidden="true" />

      <motion.div
        className="dx-shell dx-hero__in"
        variants={staggerV(0.1, 0.08)} initial="hidden" animate="shown"
      >
        <motion.h1 className="dx-h1" id="dx-hero-h" variants={staggerItem}>
          Engineering the future<br />of automotive<br /><LoopWord />
        </motion.h1>

        <motion.div className="dx-hero__cta" variants={staggerItem}>
          <a href={CTA_HREF} className="dx-btn dx-btn--primary" onClick={(e) => { e.preventDefault(); go(CTA_HREF); }}>
            {CTA_LABEL}<Arrow />
          </a>
          <a href="#chapter-2" className="dx-btn dx-btn--ghost" onClick={(e) => { e.preventDefault(); go('#chapter-2'); }}>
            See what we do<Arrow />
          </a>
        </motion.div>

        <motion.div className="dx-hero__meta" variants={staggerItem}>
          <div><b>40+</b><span>Programmes delivered</span></div>
          <div><b>94%</b><span>Reach SOP on the original date</span></div>
          <div><b>9+</b><span>Countries served</span></div>
        </motion.div>

        <motion.div className="dx-hero__foot" variants={staggerItem}>
          <span className="dx-hero__bar" aria-hidden="true"><i /></span>
          <p className="dx-hero__words">
            {HERO_WORDS.map((w, k) => (
              <React.Fragment key={w}>
                {k > 0 && <i aria-hidden="true">/</i>}
                <span>{w}</span>
              </React.Fragment>
            ))}
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}

/* The partner logo wall used to sit directly under the hero. It now lives in
   the Clients section at the foot of the page — see Clients() — so no client
   name appears above the fold. */

/* ---------------------------------------------------------------------------
   LIFECYCLE NAVIGATOR — the seven gates of a Dexoid programme
   ------------------------------------------------------------------------- */

function LifecycleNav() {
  return (
    <section className="dx-section dx-section--tight dx-paper dx-life" id="lifecycle" aria-labelledby="dx-life-h">
      <div className="dx-shell">
        <Reveal className="dx-measure">
          <p className="dx-eyebrow">The programme lifecycle</p>
          <h2 className="dx-h2" id="dx-life-h" style={{ marginTop: 16 }}>
            Seven gates. We can join at any of them and own every one after it.
          </h2>
        </Reveal>

        {/* the seven gates arrive left to right, in programme order */}
        <motion.div
          className="dx-life__track"
          variants={staggerV(0.07, 0.1)} initial="hidden" whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -14% 0px' }}
        >
          <span className="dx-life__line" aria-hidden="true" />
          {LIFECYCLE.map((s, i) => (
            <motion.div className="dx-life__n" key={s.k} variants={staggerItem} whileHover="hover" initial="rest">
              <motion.span
                className="dx-life__d"
                variants={{ rest: { y: 0 }, hover: { y: -3 } }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Icon name={s.icon} size={20} />
              </motion.span>
              <span className="dx-life__k">{String(i + 1).padStart(2, '0')}</span>
              <span className="dx-life__t">{s.t}</span>
              <span className="dx-life__s">{s.s}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   ILLUSTRATIONS — every one is built from markup. No stock photography.
   ------------------------------------------------------------------------- */

function IllFrame({ tag, dark, children, style }) {
  return (
    <div className={'dx-ill' + (dark ? ' dx-ill--dark' : '')} style={style}>
      <div className="dx-ill__bar">
        <span className="dx-ill__tag">{tag}</span>
        <span className="dx-ill__dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      {children}
    </div>
  );
}

/* 01 — scope and gate plan */
const PLAN_ROWS = [
  { n: 'Benchmark', a: 0, b: 22, acc: false },
  { n: 'Architecture', a: 14, b: 46, acc: false },
  { n: 'Design release', a: 34, b: 70, acc: true },
  { n: 'Validation', a: 54, b: 86, acc: false },
  { n: 'Industrialise', a: 70, b: 100, acc: false },
];

function IllMandate() {
  return (
    <IllFrame tag="Programme plan · concept to production">
      {/* each bar draws itself in, one gate after the next */}
      <motion.div
        className="dx-gantt"
        variants={staggerV(0.09, 0.12)} initial="hidden" whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      >
        {PLAN_ROWS.map((r) => (
          <div className="dx-gantt__r" key={r.n}>
            <span className="dx-gantt__n">{r.n}</span>
            <span className="dx-gantt__t">
              <motion.span
                className={'dx-gantt__f' + (r.acc ? ' is-acc' : '')}
                style={{ left: r.a + '%' }}
                variants={{ hidden: { width: '0%' }, shown: { width: (r.b - r.a) + '%' } }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </span>
          </div>
        ))}
      </motion.div>
      <div className="dx-gate">
        <span>G0 KICKOFF</span><span>G1 WK 6</span><span>G2 WK 14</span><span>G3 SOP</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, flexWrap: 'wrap' }}>
        <span className="dx-badge dx-badge--red"><Icon name="check" size={17} /></span>
        <span style={{ fontSize: 13, lineHeight: 1.45, color: tokens.color.body }}>
          Every gate has a written deliverable and a price agreed before it starts.
        </span>
      </div>
    </IllFrame>
  );
}

/* ---------------------------------------------------------------------------
   BLOG COVER ART — drawn, not photographed, so the page carries no external
   image requests. One graphic per published article; swap any of these for a
   real photograph when one exists.
   ------------------------------------------------------------------------- */

function BlogArt({ kind }) {
  const { skyDeep, skyMid, sky, skyWash, beige, red, ink } = tokens.color;
  const mono = tokens.font.mono;
  const disp = tokens.font.display;

  /* 01 — modern engineering: the three headline numbers from the report */
  if (kind === 'software') {
    const bars = [
      { l: 'AI IN DEVELOPMENT', v: 71, c: skyDeep },
      { l: 'BUILDING SDV ARCH.', v: 57, c: skyMid },
      { l: 'COMPLEXITY = TOP RISK', v: 53, c: red },
    ];
    return (
      <svg viewBox="0 0 480 260" className="dx-post__art" role="img" aria-label="Three bars showing 71 percent using AI, 57 percent building software-defined vehicle architectures and 53 percent citing software complexity as their top quality concern.">
        <rect width="480" height="260" fill={skyWash} />
        <text x="26" y="44" fontFamily={mono} fontSize="11" letterSpacing="1.8" fill="#7D7B74">450 DEVELOPMENT PROFESSIONALS</text>
        {bars.map((b, i) => {
          const y = 72 + i * 56;
          return (
            <g key={b.l}>
              <text x="26" y={y} fontFamily={mono} fontSize="10" letterSpacing="1.5" fill={ink}>{b.l}</text>
              <rect x="26" y={y + 9} width="360" height="14" rx="7" fill="#fff" />
              <rect x="26" y={y + 9} width={360 * b.v / 100} height="14" rx="7" fill={b.c} />
              <text x="400" y={y + 21} fontFamily={disp} fontSize="18" fontWeight="600" letterSpacing="-.6" fill={ink}>{b.v}%</text>
            </g>
          );
        })}
        <rect x="26" y="232" width="52" height="3" rx="2" fill={red} />
      </svg>
    );
  }

  /* 02 — SDV: many distributed ECUs consolidating into one zonal architecture */
  if (kind === 'sdv') {
    const scattered = [[54, 78], [92, 58], [118, 96], [70, 122], [104, 146], [140, 68], [46, 158], [132, 176], [88, 190], [156, 122]];
    const zones = [[352, 72], [416, 118], [352, 188], [288, 118]];
    return (
      <svg viewBox="0 0 480 260" className="dx-post__art" role="img" aria-label="Ten scattered electronic control units on the left consolidating into one central compute node with four zonal controllers on the right.">
        <rect width="480" height="260" fill={skyWash} />
        <text x="26" y="36" fontFamily={mono} fontSize="10" letterSpacing="1.6" fill="#7D7B74">DISTRIBUTED ECUs</text>
        <text x="288" y="36" fontFamily={mono} fontSize="10" letterSpacing="1.6" fill="#7D7B74">ZONAL + CENTRAL</text>
        {scattered.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="17" height="12" rx="3" fill={sky} />
        ))}
        {/* the consolidation itself */}
        <path d="M196 128 L250 128" stroke={beige} strokeWidth="1.6" strokeDasharray="5 5" />
        <path d="M244 122 L252 128 L244 134 Z" fill={beige} />
        {zones.map(([x, y], i) => (
          <line key={i} x1="352" y1="128" x2={x} y2={y} stroke={skyMid} strokeWidth="1.4" />
        ))}
        {zones.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="9" fill={skyDeep} />
        ))}
        <rect x="332" y="110" width="40" height="36" rx="9" fill={red} />
        <rect x="343" y="121" width="18" height="14" rx="3" fill="#fff" />
        <text x="26" y="238" fontFamily={mono} fontSize="11" letterSpacing="1.6" fill="#7D7B74">ONE SYSTEM, HARDWARE AND SOFTWARE</text>
      </svg>
    );
  }

  /* 03 — batteries: the second-life band inside a retiring cell */
  if (kind === 'battery') {
    return (
      <svg viewBox="0 0 480 260" className="dx-post__art" role="img" aria-label="A battery cell with the 70 to 80 percent band that remains usable for second-life applications highlighted.">
        <rect width="480" height="260" fill={skyWash} />
        <text x="26" y="44" fontFamily={mono} fontSize="11" letterSpacing="1.8" fill="#7D7B74">END OF FIRST LIFE</text>
        {/* cell body */}
        <rect x="26" y="70" width="300" height="104" rx="12" fill="#fff" stroke={sky} strokeWidth="2" />
        <rect x="326" y="104" width="14" height="36" rx="4" fill={sky} />
        <rect x="38" y="82" width="216" height="80" rx="7" fill={skyDeep} opacity=".9" />
        <rect x="254" y="82" width="60" height="80" rx="7" fill={beige} opacity=".85" />
        <text x="46" y="130" fontFamily={disp} fontSize="30" fontWeight="600" letterSpacing="-1.2" fill="#fff">70–80%</text>
        <text x="46" y="150" fontFamily={mono} fontSize="10" letterSpacing="1.5" fill="rgba(255,255,255,.82)">STILL USABLE · SECOND LIFE</text>
        {/* the waste stream it avoids */}
        <text x="26" y="208" fontFamily={disp} fontSize="26" fontWeight="600" letterSpacing="-1" fill={ink}>43,000 t</text>
        <text x="26" y="230" fontFamily={mono} fontSize="10.5" letterSpacing="1.5" fill="#7D7B74">LIB WASTE A YEAR BY 2030</text>
        <rect x="360" y="70" width="94" height="160" rx="10" fill="#fff" />
        <text x="374" y="102" fontFamily={mono} fontSize="9.5" letterSpacing="1.3" fill="#7D7B74">RECOVERY</text>
        <text x="374" y="134" fontFamily={disp} fontSize="26" fontWeight="600" letterSpacing="-1" fill={red}>95%</text>
        <text x="374" y="156" fontFamily={mono} fontSize="9" letterSpacing="1.2" fill="#7D7B74">OF METALS</text>
        <rect x="374" y="176" width="40" height="3" rx="2" fill={red} />
      </svg>
    );
  }

  /* 04 — powertrain portfolio: five technologies, one third of the market */
  if (kind === 'powertrain') {
    const tech = [
      { l: 'BEV', c: skyDeep },
      { l: 'HYBRID', c: skyMid },
      { l: 'CNG', c: sky },
      { l: 'BIOFUEL', c: beige },
      { l: 'H₂', c: red },
    ];
    let x = 26;
    return (
      <svg viewBox="0 0 480 260" className="dx-post__art" role="img" aria-label="Five powertrain technologies side by side above a bar showing cleaner technologies at 32 percent of passenger vehicle sales, up from 27 percent.">
        <rect width="480" height="260" fill={skyWash} />
        <text x="26" y="44" fontFamily={mono} fontSize="11" letterSpacing="1.8" fill="#7D7B74">A PORTFOLIO, NOT A RACE</text>
        {tech.map((t) => {
          const w = t.l.length > 5 ? 92 : 72;
          const el = (
            <g key={t.l}>
              <rect x={x} y="64" width={w} height="40" rx="10" fill={t.c} />
              <text x={x + w / 2} y="89" textAnchor="middle" fontFamily={mono} fontSize="11" letterSpacing="1.4" fill={t.c === sky || t.c === beige ? ink : '#fff'}>{t.l}</text>
            </g>
          );
          x += w + 8;
          return el;
        })}
        {/* share of passenger vehicle sales */}
        <text x="26" y="146" fontFamily={mono} fontSize="10" letterSpacing="1.5" fill={ink}>SHARE OF PV SALES · APR–JUL</text>
        <rect x="26" y="156" width="428" height="22" rx="11" fill="#fff" />
        <rect x="26" y="156" width={428 * 0.32} height="22" rx="11" fill={red} />
        <line x1={26 + 428 * 0.27} y1="150" x2={26 + 428 * 0.27} y2="184" stroke={ink} strokeWidth="1.4" strokeDasharray="3 3" />
        <text x={26 + 428 * 0.27} y="200" textAnchor="middle" fontFamily={mono} fontSize="9.5" letterSpacing="1.2" fill="#7D7B74">27% LAST YEAR</text>
        <text x="26" y="236" fontFamily={disp} fontSize="26" fontWeight="600" letterSpacing="-1" fill={ink}>32%</text>
        <text x="80" y="236" fontFamily={mono} fontSize="10.5" letterSpacing="1.4" fill="#7D7B74">CLEANER TECHNOLOGIES TODAY</text>
      </svg>
    );
  }

  /* 05 — silicon, cells and the grid: three layers of one dependency chain */
  const layers = [
    { l: 'SILICON', s: '28nm · Dholera', c: skyDeep, st: 'ON SCHEDULE' },
    { l: 'CELLS', s: 'ACC PLI · 50 GWh target', c: red, st: 'BEHIND' },
    { l: 'GRID', s: 'storage + inverters', c: skyMid, st: 'SCALING' },
  ];
  return (
    <svg viewBox="0 0 480 260" className="dx-post__art" role="img" aria-label="Three stacked layers — silicon, cells and the grid — linked as one dependency chain, with cell manufacturing marked as behind target.">
      <rect width="480" height="260" fill={skyWash} />
      <text x="26" y="36" fontFamily={mono} fontSize="10.5" letterSpacing="1.7" fill="#7D7B74">ONE DEPENDENCY CHAIN</text>
      {layers.map((ly, i) => {
        const y = 54 + i * 64;
        return (
          <g key={ly.l}>
            <rect x="26" y={y} width="428" height="50" rx="10" fill="#fff" />
            <rect x="26" y={y} width="5" height="50" rx="2.5" fill={ly.c} />
            <text x="48" y={y + 22} fontFamily={disp} fontSize="16" fontWeight="600" letterSpacing="-.5" fill={ink}>{ly.l}</text>
            <text x="48" y={y + 39} fontFamily={mono} fontSize="10" letterSpacing="1.2" fill="#7D7B74">{ly.s}</text>
            <text x="438" y={y + 31} textAnchor="end" fontFamily={mono} fontSize="9.5" letterSpacing="1.3" fill={ly.st === 'BEHIND' ? red : skyDeep}>{ly.st}</text>
            {i < 2 && <path d={'M240 ' + (y + 50) + ' L240 ' + (y + 64)} stroke={beige} strokeWidth="1.6" strokeDasharray="4 4" />}
          </g>
        );
      })}
      <rect x="26" y="240" width="52" height="3" rx="2" fill={red} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   POST CARD — one component, two shapes. `row` lays the cover art beside the
   text instead of above it, for the wider cards on the second row.
   ------------------------------------------------------------------------- */

function PostCard({ post: p, row }) {
  return (
    <motion.article
      className={'dx-post' + (row ? ' dx-post--row' : '')}
      variants={staggerItem} initial="rest" whileHover="hover"
    >
      <motion.a
        href="#insights" className="dx-post__img" onClick={(e) => e.preventDefault()} aria-label={p.t}
        variants={{ rest: { y: 0 }, hover: { y: -4 } }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <BlogArt kind={p.art} />
      </motion.a>
      <div className="dx-post__body">
        <div className="dx-post__m"><b>{p.c}</b><span>{p.d}</span><span>{p.read} read</span></div>
        <h3 className="dx-post__t">{p.t}</h3>
        <p className="dx-post__x">{p.x}</p>
        <a href="#insights" className="dx-tlink" onClick={(e) => e.preventDefault()}>Read the article<Arrow /></a>
      </div>
    </motion.article>
  );
}

/* ---------------------------------------------------------------------------
   INDUSTRIAL PROJECT EXECUTION — the second half of Chapter 02. Consulting
   work extended into construction delivery: four capability points, then the
   construction offer as a capability matrix rather than prose.
   ------------------------------------------------------------------------- */

function Industrial() {
  return (
    <div className="dx-ind" id="industrial">
      <Reveal className="dx-ind__hd">
        <p className="dx-eyebrow">Industrial project execution</p>
        <h3 className="dx-h3 dx-ind__h">
          Consulting extended into full-scale construction delivery
        </h3>
        <p className="dx-lead">
          Dexoid Technologies executes industrial, commercial, residential and infrastructure
          projects with a focus on quality construction, cost-effective engineering and timely
          delivery. From site selection to handover, one point of accountability — backed by
          local execution capability and our established automotive ecosystem network.
        </p>
      </Reveal>

      <Reveal delay={90}>
        <figure className="dx-ind__photo">
          <img src={ASSETS.industrial} alt="An industrial and commercial construction site at sunrise, with tower cranes over buildings under structural erection." loading="lazy" />
          <figcaption>
            <span>Site selection to handover</span>
            <span>Industrial · Commercial · Residential · Infrastructure</span>
          </figcaption>
        </figure>
      </Reveal>

      {/* the four things a client is actually buying */}
      <motion.div
        className="dx-svcrow dx-ind__pts"
        variants={staggerV(0.08, 0.1)} initial="hidden" whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -14% 0px' }}
      >
        {INDUSTRIAL_POINTS.map((p, i) => (
          <motion.article
            className="dx-svccard" key={p.n} variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.28, ease: EASE } }}
          >
            <span className={'dx-badge dx-badge--lg' + (i === 0 ? ' dx-badge--red' : '')}>
              <Icon name={p.icon} size={20} />
            </span>
            <span className="dx-svccard__k">{p.n}</span>
            <h4 className="dx-svccard__t">{p.t}</h4>
            <p className="dx-svccard__d">{p.d}</p>
          </motion.article>
        ))}
      </motion.div>

      <Reveal className="dx-ind__sub">
        <h4 className="dx-ind__subh">Construction services overview</h4>
        <span className="dx-ind__rule" aria-hidden="true" />
      </Reveal>

      {/* three groups, each one a blurb beside its disciplines */}
      <motion.div
        className="dx-con"
        variants={staggerV(0.1, 0.1)} initial="hidden" whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      >
        {CONSTRUCTION.map((g) => (
          <motion.section className="dx-conp" key={g.k} variants={staggerItem} aria-label={g.t}>
            <div className="dx-conp__hd">
              <span className="dx-badge dx-badge--lg"><Icon name={g.icon} size={20} /></span>
              <h5 className="dx-conp__t">{g.t}</h5>
              <p className="dx-conp__d">{g.d}</p>
            </div>
            <div className={'dx-conp__cols' + (g.cols.length === 2 ? ' is-2' : '')}>
              {g.cols.map((c) => (
                <div className="dx-cond" key={c.t}>
                  <h6 className="dx-cond__t">{c.t}</h6>
                  <ul className="dx-cond__l">
                    {c.items.map((it) => (
                      <li key={it}><span className="dx-cond__b" aria-hidden="true" />{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CONTACT FORM — primary conversion. Posts to /api/contact, which validates
   the submission and appends it to the Google Sheet.

   Spam protection is layered: a honeypot field and a minimum-dwell check here,
   both repeated server-side, plus per-IP rate limiting at the endpoint. None of
   the client-side checks can be trusted on their own — they only cost a bot a
   round trip — which is why the function re-runs them.
   ------------------------------------------------------------------------- */

const CRM_ENDPOINT = '/api/contact';

function ContactForm() {
  /* 'idle' | 'busy' | 'sent' | 'error' — one value, so the states cannot
     contradict each other the way two booleans can. */
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const mounted = useRef(Date.now());

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.company_website.value) return;                 // honeypot tripped
    if (Date.now() - mounted.current < 2500) return;        // submitted too fast

    setState('busy');
    setError('');

    const payload = Object.fromEntries(new FormData(form).entries());
    delete payload.company_website;
    payload.page = typeof window !== 'undefined' ? window.location.href : '';
    payload.referrer = typeof document !== 'undefined' ? document.referrer : '';

    try {
      const res = await fetch(CRM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      /* Only a 2xx carrying ok:true means the row reached the sheet. Saying
         "thank you" on anything else loses the enquiry silently, which is far
         worse than admitting the form is broken. */
      if (!res.ok || data.ok !== true) {
        setError(data.error || 'Something went wrong at our end.');
        setState('error');
        return;
      }
      setState('sent');
    } catch (err) {
      setError('We could not reach the server.');
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <div className="dx-form__ok" role="status">
        Thank you — your note is with the engineering desk. You will hear from a named engineer
        within one working day, not an autoresponder.
      </div>
    );
  }

  const busy = state === 'busy';

  return (
    <form className="dx-form" onSubmit={submit}>
      <input className="dx-hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="dx-form__row">
        <div className="dx-field">
          <label htmlFor="dx-n">Name</label>
          <input id="dx-n" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="dx-field">
          <label htmlFor="dx-e">Work email</label>
          <input id="dx-e" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="dx-form__row">
        <div className="dx-field">
          <label htmlFor="dx-c">Company</label>
          <input id="dx-c" name="company" type="text" required autoComplete="organization" />
        </div>
        <div className="dx-field">
          <label htmlFor="dx-s">What do you need?</label>
          {/* labels kept short so none of them is truncated in the control */}
          <select id="dx-s" name="topic" defaultValue="Vendor sourcing">
            <option>Vendor sourcing</option>
            <option>Cost optimisation</option>
            <option>Design &amp; CAD</option>
            <option>Manufacturing</option>
            <option>Industrial projects</option>
            <option>GCC setup in India</option>
            <option>Not sure yet</option>
          </select>
        </div>
      </div>
      <div className="dx-field">
        <label htmlFor="dx-m">Tell us the problem</label>
        <textarea id="dx-m" name="message" placeholder="Cost, quality, schedule or supply — whichever one is hurting." />
      </div>
      {/* the failure branch: say what happened and give a way through it */}
      {state === 'error' && (
        <p className="dx-form__err" role="alert">
          {error} Please try again{CONTACT_DETAILS.email ? <> — or email us directly at{' '}
            <a href={'mailto:' + CONTACT_DETAILS.email}>{CONTACT_DETAILS.email}</a></> : null}.
        </p>
      )}
      <button type="submit" className="dx-btn dx-btn--primary" disabled={busy}>
        {busy ? 'Sending…' : CTA_LABEL}<Arrow />
      </button>
      <p className="dx-form__note">
        We reply from a named engineer inside one working day. No sequence, no drip campaign — we
        will email you exactly once unless you write back.
      </p>
    </form>
  );
}

/* ---------------------------------------------------------------------------
   TESTIMONIAL CAROUSEL
   ------------------------------------------------------------------------- */

function Testimonials() {
  const [paused, setPaused] = useState(false);
  const [i, setI] = useRotator(TESTIMONIALS.length, 5500, paused);
  return (
    <div
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}
    >
      <div className="dx-quotes" aria-live="polite" aria-roledescription="carousel">
        {/* one quote is mounted at a time; mode="wait" keeps them from stacking */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={TESTIMONIALS[i].n} className="dx-quote"
            aria-label={(i + 1) + ' of ' + TESTIMONIALS.length}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: EASE }}
          >
            <blockquote className="dx-quote__t">“{TESTIMONIALS[i].q}”</blockquote>
            <figcaption className="dx-quote__w">
              <span className="dx-mem__av" style={{ width: 42, height: 42, borderRadius: 12, fontSize: 14 }}>
                {TESTIMONIALS[i].n.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </span>
              <span style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                <span className="dx-quote__n">{TESTIMONIALS[i].n}</span>
                <span className="dx-quote__r">{TESTIMONIALS[i].r}</span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="dx-dots" role="tablist" aria-label="Testimonials">
        {TESTIMONIALS.map((t, k) => (
          <button
            key={t.n} type="button" role="tab" aria-selected={k === i}
            aria-label={'Show testimonial ' + (k + 1) + ': ' + t.n}
            className={k === i ? 'is-on' : ''} onClick={() => setI(k)}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CONTACT DETAILS — the published address, email and phone. Rendered beside
   the form and again in the footer, both reading from CONTACT_DETAILS so there
   is only ever one place to edit them. A blank field drops its own line.
   ------------------------------------------------------------------------- */

function ContactDetails({ className = '' }) {
  const { address, email, phone, company } = CONTACT_DETAILS;
  return (
    <address className={'dx-cd ' + className}>
      <div className="dx-cd__r">
        <span className="dx-badge"><Icon name="pin" size={17} /></span>
        <span>
          <span className="dx-cd__k">Office</span>
          <span className="dx-cd__v">{company}</span>
          {address.map((line) => <span className="dx-cd__v" key={line}>{line}</span>)}
        </span>
      </div>
      <div className="dx-cd__r">
        <span className="dx-badge"><Icon name="mail" size={17} /></span>
        <span>
          <span className="dx-cd__k">Email</span>
          {email
            ? <a className="dx-cd__v dx-cd__a" href={'mailto:' + email}>{email}</a>
            : <span className="dx-cd__v dx-cd__tbc">To be confirmed</span>}
        </span>
      </div>
      <div className="dx-cd__r">
        <span className="dx-badge"><Icon name="phone" size={17} /></span>
        <span>
          <span className="dx-cd__k">Phone</span>
          {phone
            ? <a className="dx-cd__v dx-cd__a" href={'tel:' + phone.replace(/[^+\d]/g, '')}>{phone}</a>
            : <span className="dx-cd__v dx-cd__tbc">To be confirmed</span>}
        </span>
      </div>
    </address>
  );
}

/* ---------------------------------------------------------------------------
   CHAPTER RIBBON + THE SIX CHAPTERS

   The ribbon is a single line running the height of the narrative, assembled
   from one segment per chapter. `useRibbon` reports which chapter the reading
   line currently sits in and how far through it, so the active segment fills
   as you scroll rather than snapping.
   ------------------------------------------------------------------------- */

const READ_LINE = 0.42; // reading line, as a fraction of viewport height

/** Which chapter the reading line currently sits in. */
function useRibbonIndex(ids) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * READ_LINE;
      let next = 0;
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top > line) break;
        next = i;
      }
      setIndex((v) => (v === next ? v : next));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids.join(',')]);
  return index;
}

function Chapter({ meta, idx, active: activeIdx, headline, body, checks, link, illustration, flip, alignStart, children }) {
  const { go } = useSite();
  const sectionRef = useRef(null);

  /* The ribbon segment is driven straight off this chapter's own scroll
     progress — 0 when its top crosses the reading line, 1 when its bottom
     does — so the line advances with the scroll rather than in steps. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 42%', 'end 42%'],
  });

  const done = idx < activeIdx;
  const active = idx === activeIdx;
  const state = done ? ' is-done' : active ? ' is-on' : '';

  const text = (
    <Reveal className="dx-chap__txt">
      <p className="dx-eyebrow">{meta.eyebrow}</p>
      <h2 className="dx-h2" id={meta.id + '-h'}>{headline}</h2>
      {body.map((p, i) => <p key={i} className="dx-lead">{p}</p>)}
      {checks && (
        <ul className="dx-chap__pts">
          {checks.map((c) => (
            <li className="dx-chap__pt" key={c.t || c}>
              <Icon name="check" size={14} />
              <span>
                <b>{c.t || c}</b>{c.d ? <span className="dx-chap__ptd">{c.d}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
      {link}
    </Reveal>
  );

  return (
    <section className="dx-chap" id={meta.id} ref={sectionRef} aria-labelledby={meta.id + '-h'}>
      <div className={'dx-chap__rail' + state}>
        <span className="dx-chap__ribbon" aria-hidden="true">
          <motion.span className="dx-chap__fill" style={{ scaleY: scrollYProgress, originY: 0 }} />
        </span>
        <motion.button
          type="button" className="dx-chap__mark" onClick={() => go('#' + meta.id)}
          aria-current={active ? 'true' : undefined}
          whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <motion.span
            className="dx-chap__markd"
            animate={{ scale: active ? 1.08 : 1 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {meta.n}
          </motion.span>
          <span className="dx-chap__markl">{meta.rail}</span>
        </motion.button>
      </div>

      <div className="dx-chap__body">
        {illustration ? (
          <div className={'dx-chap__row' + (flip ? ' is-flip' : '') + (alignStart ? ' is-start' : '')}>
            {text}
            <Reveal delay={110}>{illustration}</Reveal>
          </div>
        ) : (
          <Reveal className="dx-measure">
            <p className="dx-eyebrow">{meta.eyebrow}</p>
            <h2 className="dx-h2" id={meta.id + '-h'}>{headline}</h2>
            {body.map((p, i) => <p key={i} className="dx-lead" style={{ marginTop: 16 }}>{p}</p>)}
            {link}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

function Narrative() {
  const { go } = useSite();
  const ids = useMemo(() => CHAPTERS.map((c) => c.id), []);
  const activeIdx = useRibbonIndex(ids);
  const C = (i) => CHAPTERS[i];

  return (
    <div className="dx-section dx-paper dx-narr">
      <div className="dx-shell">
        {/* 01 — who we are */}
        <Chapter
          meta={C(0)} idx={0} active={activeIdx}
          headline="One engineering partner accountable from concept to Start of Production"
          body={[
            'Dexoid Technologies is a premier automotive engineering firm delivering comprehensive solutions across consulting, manufacturing, design, and R&D. With deep industry expertise and a commitment to innovation, we partner with automotive manufacturers, suppliers, and enterprises globally.',
            'Our integrated approach combines strategic business consulting with advanced technical capabilities, ensuring our clients stay ahead in a rapidly evolving automotive landscape.',
          ]}
          checks={OVERVIEW_POINTS}
          link={<a href={CTA_HREF} className="dx-tlink" onClick={(e) => { e.preventDefault(); go(CTA_HREF); }}>Talk to the engineering desk<Arrow /></a>}
          illustration={<IllMandate />}
        />

        {/* 02 — core services */}
        <Chapter
          meta={C(1)} idx={1} active={activeIdx}
          headline="Comprehensive solutions across the automotive value chain"
          body={[]}
          link={<a href="#deep-dive" className="dx-tlink" style={{ marginTop: 20, display: 'inline-flex' }} onClick={(e) => { e.preventDefault(); go('#deep-dive'); }}>Inside the R&amp;D practice<Arrow /></a>}
        >
          <motion.div
            className="dx-svcrow"
            variants={staggerV(0.08, 0.12)} initial="hidden" whileInView="shown"
            viewport={{ once: true, margin: '0px 0px -14% 0px' }}
          >
            {SERVICES.map((sv, i) => (
              <motion.article
                className="dx-svccard" key={sv.k} variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.28, ease: EASE } }}
              >
                <span className={'dx-badge dx-badge--lg' + (i === 0 ? ' dx-badge--red' : '')}>
                  <Icon name={sv.icon} size={20} />
                </span>
                <span className="dx-svccard__k">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="dx-svccard__t">{sv.t}</h3>
                <p className="dx-svccard__d">{sv.d}</p>
              </motion.article>
            ))}
          </motion.div>

          <Industrial />
        </Chapter>

        {/* 03 — GCC setup and scale */}
        <Chapter
          meta={C(2)} idx={2} active={activeIdx}
          headline="Helping global automotive OEMs and suppliers establish, staff and scale their Global Capability Centres in India"
          body={[
            'End to end — from the business case through entity setup, location, vendors, hiring and compliance, to the day the centre is running on its own.',
          ]}
        >
          <motion.div
            className="dx-gcc"
            variants={staggerV(0.07, 0.12)} initial="hidden" whileInView="shown"
            viewport={{ once: true, margin: '0px 0px -14% 0px' }}
          >
            {GCC.map((g) => (
              <motion.article className="dx-gccc" key={g.n} variants={staggerItem}>
                <span className="dx-gccc__hd">
                  <span className="dx-badge"><Icon name={g.icon} size={17} /></span>
                  <span className="dx-gccc__n">{g.n}</span>
                </span>
                <h3 className="dx-gccc__t">{g.t}</h3>
                <p className="dx-gccc__d">{g.d}</p>
              </motion.article>
            ))}
          </motion.div>
        </Chapter>

        {/* 04 — leadership */}
        <Chapter
          meta={C(3)} idx={3} active={activeIdx}
          headline="A leadership team backed by deep industry expertise and execution capability"
          body={[]}
        >
          <motion.div
            className="dx-pts3"
            variants={staggerV(0.09, 0.12)} initial="hidden" whileInView="shown"
            viewport={{ once: true, margin: '0px 0px -14% 0px' }}
          >
            {LEADER_POINTS.map((p, i) => (
              <motion.div className="dx-pts3__i" key={p} variants={staggerItem}>
                <span className="dx-pts3__n">{String(i + 1).padStart(2, '0')}</span>
                <p className="dx-pts3__t">{p}</p>
              </motion.div>
            ))}
          </motion.div>
        </Chapter>

        {/* 05 — insights */}
        <Chapter
          meta={C(4)} idx={4} active={activeIdx}
          headline="Our team brings decades of hands-on experience across OEM, Tier-1, and Tier-2 ecosystems"
          body={[
            'Combining deep automotive manufacturing expertise with a track record of delivering results for clients like Tata, Mahindra, and Ola — and writing up what we learn along the way.',
          ]}
        >
          {/* Three lead articles across the top, the remaining two as wider
              horizontal cards beneath — five posts never divide evenly into a
              three-column grid, and a half-empty second row looks like a bug. */}
          <motion.div
            className="dx-posts"
            variants={staggerV(0.09, 0.12)} initial="hidden" whileInView="shown"
            viewport={{ once: true, margin: '0px 0px -14% 0px' }}
          >
            {POSTS.slice(0, 3).map((p) => <PostCard post={p} key={p.t} />)}
          </motion.div>
          <motion.div
            className="dx-posts dx-posts--wide"
            variants={staggerV(0.09, 0.06)} initial="hidden" whileInView="shown"
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          >
            {POSTS.slice(3).map((p) => <PostCard post={p} row key={p.t} />)}
          </motion.div>
        </Chapter>

        {/* 06 — contact */}
        <Chapter
          meta={C(5)} idx={5} active={activeIdx} alignStart
          headline="Ready to scale your business? Let’s talk."
          body={[
            'Tell us which number is hurting — cost, quality, schedule or supply. One form, one engineer, one reply inside a working day.',
          ]}
          link={<ContactDetails />}
          illustration={
            <div className="dx-contact" id="contact">
              <div className="dx-ill__bar">
                <span className="dx-ill__tag">Contact the engineering desk</span>
                <span className="dx-ill__dots" aria-hidden="true"><i /><i /><i /></span>
              </div>
              <ContactForm />
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CLIENTS & PARTNERS — moved to the end of the page
   ------------------------------------------------------------------------- */

function Clients() {
  return (
    <section className="dx-section dx-paper-alt" id="clients" aria-labelledby="dx-cl-h">
      <div className="dx-shell">
        <Reveal className="dx-measure">
          <p className="dx-eyebrow">Clients &amp; partners</p>
          <h2 className="dx-h2" id="dx-cl-h" style={{ marginTop: 16 }}>
            Partnering with industry leaders to deliver proven results
          </h2>
          <p className="dx-trust__line" style={{ marginTop: 18 }}>
            Powered by a trusted ecosystem of manufacturing partners across India and globally.
          </p>
        </Reveal>

        <motion.div
          className="dx-logos" style={{ marginTop: 'clamp(28px,3.2vw,44px)' }}
          variants={staggerV(0.05, 0.1)} initial="hidden" whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -14% 0px' }}
        >
          {CLIENT_LOGOS.map((c) => (
            <motion.div className="dx-logos__c" key={c.n} variants={staggerItem}>
              <img className="dx-logo" src={ASSETS[c.img]} alt={c.n} loading="lazy" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="dx-int" style={{ marginTop: 'clamp(18px,2.2vw,30px)' }}
          variants={staggerV(0.09, 0.12)} initial="hidden" whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -14% 0px' }}
        >
          {PARTNERS.map((p) => (
            <motion.article
              className="dx-intc" key={p.t} variants={staggerItem}
              whileHover={{ y: -4, boxShadow: '0 30px 60px -44px rgba(30,52,74,.55)' }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <span className="dx-badge dx-badge--lg"><Icon name={p.icon} size={20} /></span>
              <span className="dx-intc__k">{p.k}</span>
              <h3 className="dx-intc__t">{p.t}</h3>
              <p className="dx-intc__d">{p.d}</p>
            </motion.article>
          ))}
        </motion.div>

        <Reveal style={{ marginTop: 'clamp(44px,5vw,76px)' }} delay={110}>
          <Testimonials />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   DEEP-DIVE PANEL — R&D and performance enhancement
   ------------------------------------------------------------------------- */

const DEEP_MINI = [
  { k: '01', t: 'Cost & Time Reduction', d: 'We optimise engineering processes, materials and development cycles to reduce overall costs and accelerate time-to-market.' },
  { k: '02', t: 'Labour Cost Optimisation', d: 'We help companies access skilled engineering talent and efficient resources while optimising overall development and labour costs.' },
  { k: '03', t: 'Engineering & R&D Support', d: 'From concept development to production, we provide end-to-end engineering and R&D support to develop, test and improve products.' },
  { k: '04', t: 'Skilled Engineering Resources', d: 'We provide access to experienced engineering teams and specialised technical talent to support product development and advanced technology programs.' },
];

const RND_FOCUS = ['Concept Development', 'Engineering', 'Prototyping', 'Testing & Validation'];

function VehicleSchematic() {
  const beige = tokens.color.beige, sky = tokens.color.sky, steel = tokens.color.skyMid;
  const dot = (x, y, n) => (
    <g key={n}>
      <circle cx={x} cy={y} r="11" fill="#0A0A0A" stroke={beige} strokeWidth="1.1" />
      <text x={x} y={y + 3.6} textAnchor="middle" fontFamily={tokens.font.mono} fontSize="9.5" fill={beige}>{n}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 920 330" width="100%" style={{ height: 'auto', display: 'block' }} role="img"
      aria-label="Schematic side view of an electric light commercial vehicle showing the front thermal module, the 63 kWh underfloor battery pack, the inverter and the 48 kW rear e-axle, with coolant supply and return paths.">
      {/* drawing grid */}
      <g stroke="rgba(216,196,160,.10)" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={'h' + i} x1="40" x2="880" y1={40 + i * 42} y2={40 + i * 42} />)}
        {Array.from({ length: 11 }, (_, i) => <line key={'v' + i} y1="40" y2="292" x1={40 + i * 84} x2={40 + i * 84} />)}
      </g>

      {/* body */}
      <path
        d="M110 248 L110 202 C110 192 116 186 127 184 L252 174 L332 118 C342 108 354 102 368 102 L560 102 C576 102 589 108 597 120 L658 174 L788 184 C799 186 806 193 806 202 L806 248 Z"
        fill="rgba(46,150,212,.12)" stroke={beige} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M344 168 L372 122 L556 122 L586 168 Z" fill="rgba(183,220,243,.16)" stroke="rgba(216,196,160,.5)" strokeWidth="1.1" />
      <line x1="452" y1="122" x2="452" y2="168" stroke="rgba(216,196,160,.5)" strokeWidth="1.1" />

      {/* wheels */}
      {[210, 690].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="248" r="36" fill="#0C0C0E" stroke={beige} strokeWidth="1.6" />
          <circle cx={cx} cy="248" r="15" fill="none" stroke="rgba(216,196,160,.55)" strokeWidth="1.2" />
          <circle cx={cx} cy="248" r="3" fill={beige} />
        </g>
      ))}
      <line x1="40" y1="284" x2="880" y2="284" stroke="rgba(216,196,160,.28)" strokeWidth="1" />

      {/* thermal module (front) */}
      <rect x="140" y="194" width="66" height="36" rx="4" fill="rgba(183,220,243,.18)" stroke={sky} strokeWidth="1.3" />
      {[152, 162, 172, 182, 192].map((x) => <line key={x} x1={x} y1="199" x2={x} y2="225" stroke="rgba(183,220,243,.6)" strokeWidth="1" />)}

      {/* battery pack */}
      <rect x="252" y="208" width="392" height="30" rx="5" fill="rgba(46,150,212,.28)" stroke={steel} strokeWidth="1.4" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={252 + 32.6 * (i + 1)} y1="212" x2={252 + 32.6 * (i + 1)} y2="234" stroke="rgba(183,220,243,.45)" strokeWidth="1" />
      ))}

      {/* inverter */}
      <rect x="586" y="180" width="52" height="30" rx="4" fill="rgba(216,196,160,.16)" stroke={beige} strokeWidth="1.3" />

      {/* e-axle */}
      <circle cx="690" cy="248" r="24" fill="rgba(216,196,160,.22)" stroke={beige} strokeWidth="1.5" />
      <path d="M676 248 L704 248 M690 234 L690 262" stroke={beige} strokeWidth="1.2" />

      {/* coolant supply / return — animated flow */}
      <path className="dx-flow" d="M206 204 L252 204 L644 204 L666 214 L666 232" fill="none" stroke={beige} strokeWidth="2" strokeLinecap="round" />
      <path className="dx-flow" d="M666 258 L666 268 L252 268 L206 268 L206 226" fill="none" stroke={sky} strokeWidth="2" strokeLinecap="round" style={{ animationDirection: 'reverse' }} />

      {/* callout markers */}
      {dot(173, 176, '01')}
      {dot(448, 194, '02')}
      {dot(612, 164, '03')}
      {dot(732, 224, '04')}

      {/* overall dimension */}
      <g stroke="rgba(216,196,160,.45)" strokeWidth="1">
        <line x1="110" y1="308" x2="806" y2="308" />
        <line x1="110" y1="300" x2="110" y2="316" />
        <line x1="806" y1="300" x2="806" y2="316" />
      </g>
      <rect x="418" y="298" width="90" height="20" fill="#0A0A0A" />
      <text x="463" y="312" textAnchor="middle" fontFamily={tokens.font.mono} fontSize="10.5" letterSpacing="1.4" fill="rgba(216,196,160,.85)">4 280 mm</text>
    </svg>
  );
}

function DeepDive() {
  const { go } = useSite();
  return (
    <section className="dx-section dx-deep dx-dark" id="deep-dive" aria-labelledby="dx-deep-h">
      <div className="dx-shell dx-deep__in">
        <Reveal className="dx-measure">
          <p className="dx-eyebrow">Research &amp; Development</p>
          <h2 className="dx-h2" id="dx-deep-h" style={{ marginTop: 16 }}>
            From concept to innovation we turn ideas into real-world, scalable solutions
          </h2>
        </Reveal>

        <motion.div
          className="dx-mini"
          variants={staggerV(0.08, 0.12)} initial="hidden" whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -14% 0px' }}
        >
          {DEEP_MINI.map((m) => (
            <motion.div className="dx-mini__c" key={m.k} variants={staggerItem}>
              <span className="dx-mini__k">{m.k}</span>
              <span className="dx-mini__t">{m.t}</span>
              <span className="dx-mini__d">{m.d}</span>
            </motion.div>
          ))}
        </motion.div>

        <Reveal className="dx-schem" delay={120}>
          <VehicleSchematic />
          <div className="dx-schem__cap">
            <span><i style={{ background: tokens.color.sky }} />01 Thermal module</span>
            <span><i style={{ background: tokens.color.skyMid }} />02 Pack · 63 kWh</span>
            <span><i style={{ background: tokens.color.beige }} />03 Inverter</span>
            <span><i style={{ background: tokens.color.beige }} />04 E-axle · 48 kW</span>
          </div>
        </Reveal>

        {/* the four stages an automotive R&D programme actually runs through */}
        <Reveal className="dx-focus" delay={140}>
          <span className="dx-focus__l">Automotive R&amp;D focus</span>
          <div className="dx-focus__r">
            {RND_FOCUS.map((f, i) => (
              <span className="dx-focus__i" key={f}>
                <b>{String(i + 1).padStart(2, '0')}</b>{f}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160} style={{ marginTop: 'clamp(30px,3.4vw,46px)' }}>
          <a href={CTA_HREF} className="dx-btn dx-btn--primary" onClick={(e) => { e.preventDefault(); go(CTA_HREF); }}>
            {CTA_LABEL}<Arrow />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   FAQ
   ------------------------------------------------------------------------- */

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="dx-section dx-paper" id="faq" aria-labelledby="dx-faq-h">
      <div className="dx-shell">
        <Reveal className="dx-measure">
          <p className="dx-eyebrow">Questions we hear before every engagement</p>
          <h2 className="dx-h2" id="dx-faq-h" style={{ marginTop: 16, marginBottom: 'clamp(30px,3.4vw,48px)' }}>
            Here’s what clients want to know first
          </h2>
        </Reveal>

        <Reveal className="dx-faq" delay={70}>
          {FAQS.map((f, i) => (
            <div className={'dx-faq__i' + (open === i ? ' is-open' : '')} key={f.q}>
              <h3>
                <button
                  type="button" className="dx-faq__q" aria-expanded={open === i} aria-controls={'dx-faq-a-' + i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span className="dx-faq__qt">{f.q}</span>
                  <span className="dx-faq__ic" aria-hidden="true"><Icon name="chev" size={16} /></span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    className="dx-faq__a" id={'dx-faq-a-' + i} role="region"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.36, ease: EASE }}
                  >
                    <div className="dx-faq__ai">
                      {f.a.map((p, k) => <p key={k}>{p}</p>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>

      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   ABOUT / COMPANY PAGE
   ------------------------------------------------------------------------- */

function AboutPage({ sentinelRef }) {
  const { go } = useSite();
  return (
    <>
      <section className="dx-abhero" id="top" aria-labelledby="dx-ab-h">
        <span className="dx-abhero__scan" aria-hidden="true" />
        <div className="dx-shell dx-abhero__in">
          <p className="dx-eyebrow">About Dexoid Technologies</p>
          <h1 className="dx-h1" id="dx-ab-h">
            Thirty-one engineers who would rather be measured than described
          </h1>
          <p className="dx-hero__sub">
            We started in 2016 with one contract and a conviction that automotive consulting had
            drifted too far from the shop floor. Ten years later the test is unchanged: did the
            cost, the mass or the date actually move?
          </p>
          <div className="dx-hero__cta">
            <a href={CTA_HREF} className="dx-btn dx-btn--primary" onClick={(e) => { e.preventDefault(); go(CTA_HREF); }}>{CTA_LABEL}<Arrow /></a>
            <a href="#/" className="dx-btn dx-btn--ghost" onClick={(e) => { e.preventDefault(); go('#/'); }}>See the practice</a>
          </div>
        </div>
      </section>
      <span ref={sentinelRef} aria-hidden="true" />

      {/* who we are */}
      <section className="dx-section dx-paper" aria-labelledby="dx-who-h">
        <div className="dx-shell">
          <div className="dx-chap__row">
            <Reveal className="dx-chap__txt">
              <p className="dx-eyebrow">Who we are</p>
              <h2 className="dx-h2" id="dx-who-h">An engineering practice that happens to sell advice</h2>
              <p className="dx-lead">
                Dexoid is a consultancy in the commercial sense and a workshop in every other. Our
                people come from vehicle programmes, not from strategy houses: they have released
                CAD, argued with a tool shop, and stood on a line during a bad ramp.
              </p>
              <p className="dx-lead">
                That is why our deliverables look the way they do. A three-page report with a number
                on it beats a hundred slides, and every recommendation arrives attached to the test
                that will prove it wrong if it is wrong.
              </p>
              <a href={CTA_HREF} className="dx-tlink" onClick={(e) => { e.preventDefault(); go(CTA_HREF); }}>{CTA_LABEL}<Arrow /></a>
            </Reveal>
            <Reveal delay={110}>
              <div className="dx-ill dx-reg" style={{ display: 'grid', gap: 18, placeItems: 'start' }}>
                <span className="dx-ill__tag">The number we watch</span>
                <span style={{ fontFamily: tokens.font.display, fontSize: 'clamp(56px,7vw,104px)', fontWeight: 500, letterSpacing: '-.055em', lineHeight: .9, color: tokens.color.ink }}>
                  <Count to={94} suffix="%" />
                </span>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: tokens.color.body, maxWidth: 360 }}>
                  of programmes reach Start of Production on the date agreed at kickoff. Across 40+
                  engagements since 2016, the two that slipped both slipped on supplier tooling —
                  which is why sourcing became a standing discipline in 2023.
                </p>
                <hr className="dx-rule" style={{ width: '100%' }} />
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {[['31', 'Engineers'], ['3', 'Desks'], ['2016', 'Founded']].map(([v, l]) => (
                    <span key={l} style={{ display: 'grid', gap: 2 }}>
                      <b className="dx-num" style={{ fontFamily: tokens.font.display, fontSize: 22, fontWeight: 620, color: tokens.color.ink, letterSpacing: '-.025em' }}>{v}</b>
                      <span className="dx-micro" style={{ color: '#8D8B83', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase' }}>{l}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="dx-section dx-paper-alt" aria-labelledby="dx-tl-h">
        <div className="dx-shell">
          <Reveal className="dx-measure">
            <p className="dx-eyebrow">How we got here</p>
            <h2 className="dx-h2" id="dx-tl-h" style={{ marginTop: 16, marginBottom: 'clamp(30px,3.4vw,48px)' }}>
              Ten years, added one capability at a time — each because a programme needed it
            </h2>
          </Reveal>
          <Reveal className="dx-tl" delay={70}>
            {MILESTONES.map((m) => (
              <div className="dx-tl__r" key={m.y}>
                <span className="dx-tl__y dx-num">{m.y}</span>
                <span className="dx-tl__t">{m.t}</span>
                <span className="dx-tl__d">{m.d}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* present / future */}
      <section className="dx-section dx-dark" aria-labelledby="dx-fw-h">
        <div className="dx-shell">
          <Reveal className="dx-measure">
            <p className="dx-eyebrow">Where we are, where we are headed</p>
            <h2 className="dx-h2" id="dx-fw-h" style={{ marginTop: 16, marginBottom: 'clamp(30px,3.4vw,48px)' }}>
              The next ten years are about industrialisation, not more advice
            </h2>
          </Reveal>
          <Reveal className="dx-split" delay={80}>
            <div className="dx-split__c">
              <span className="dx-badge dx-badge--lg dx-badge--outline"><Icon name="target" size={20} /></span>
              <p className="dx-eyebrow">Present · 2026</p>
              <h3 className="dx-h3">Thirty-one engineers across three desks</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65 }}>
                Pune runs design, simulation and programme management. Stuttgart sits inside European
                supplier review cycles. Yokohama covers Japanese tooling and materials qualification.
                Nine active programmes, six of them through to Start of Production.
              </p>
              <ul className="dx-chap__pts" style={{ marginTop: 4 }}>
                {['Electrification is now 60% of the book', 'Sourcing desk qualifies 40+ suppliers a year', 'Every programme reports on the same three numbers'].map((p) => (
                  <li className="dx-chap__pt" key={p} style={{ color: tokens.color.bodyDark }}><Icon name="check" size={14} />{p}</li>
                ))}
              </ul>
            </div>
            <div className="dx-split__c is-fwd">
              <span className="dx-badge dx-badge--lg dx-badge--beige"><Icon name="bolt" size={20} /></span>
              <p className="dx-eyebrow">Next · 2027–2030</p>
              <h3 className="dx-h3">Owning the industrialisation, not just the drawing</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65 }}>
                We are building toward taking full line-side responsibility on two programmes a year —
                pilot line, PPAP and ramp under Dexoid’s own quality system — and toward a second-life
                design standard developed with our recycling partners so packs are recoverable by design.
              </p>
              <ul className="dx-chap__pts" style={{ marginTop: 4 }}>
                {['Pilot line ownership on two programmes a year', 'A published second-life design standard', 'A fourth desk in North America'].map((p) => (
                  <li className="dx-chap__pt" key={p} style={{ color: tokens.color.bodyDark }}><Icon name="check" size={14} />{p}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}

/* ---------------------------------------------------------------------------
   HOMEPAGE
   ------------------------------------------------------------------------- */

function HomePage({ sentinelRef }) {
  return (
    <>
      <Hero />
      <span ref={sentinelRef} aria-hidden="true" />
      <LifecycleNav />
      <Narrative />
      <DeepDive />
      <FAQ />
      <Clients />
    </>
  );
}

/* ---------------------------------------------------------------------------
   ROOT
   ------------------------------------------------------------------------- */

function injectOnce(id, node) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  node.id = id;
  document.head.appendChild(node);
}

export default function DexoidSite() {
  const route = useHashRoute();
  const [lang, setLang] = useState(LANGS[0]);
  const [solid, setSolid] = useState(false);
  const sentinel = useRef(null);
  const reduced = useReducedMotion();

  /* fonts + stylesheet */
  useEffect(() => {
    const pre = document.createElement('link');
    pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = '';
    injectOnce('dx-preconnect', pre);

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';
    injectOnce('dx-fonts', font);

    const style = document.createElement('style');
    style.textContent = STYLES;
    injectOnce('dx-styles', style);
  }, []);

  /* header inverts once the hero has passed under it */
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = sentinel.current;
      setSolid(el ? el.getBoundingClientRect().top <= 78 : window.scrollY > 400);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [route.page]);

  /* navigation */
  const go = useCallback((href) => {
    if (!href) return;
    if (href.indexOf('#/') === 0) {
      window.location.hash = href.slice(1) === '/' ? '' : href;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    const el = document.getElementById(href.replace('#', ''));
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [reduced]);

  const cycleLang = useCallback(() => {
    setLang((l) => LANGS[(LANGS.indexOf(l) + 1) % LANGS.length]);
  }, []);

  const ctx = useMemo(() => ({ go, lang, setLang, cycleLang, route }), [go, lang, cycleLang, route]);

  return (
    /* reducedMotion="user" makes every Framer animation on the site respect
       prefers-reduced-motion without a second code path */
    <MotionConfig reducedMotion="user" transition={{ ease: EASE }}>
    <SiteCtx.Provider value={ctx}>
      <div className="dx-root" lang={lang.toLowerCase()}>
        <a href="#main" className="dx-sr">Skip to content</a>
        <Header solid={solid} onDark />
        <main id="main">
          {route.page === 'about'
            ? <AboutPage sentinelRef={sentinel} />
            : <HomePage sentinelRef={sentinel} />}
        </main>
        <Footer />
      </div>
    </SiteCtx.Provider>
    </MotionConfig>
  );
}

/* ---------------------------------------------------------------------------
   BRAND ASSETS
   Supplied artwork, inlined as data URIs so the page makes no external image
   requests and the file stays self-contained. To serve them as files instead,
   drop the originals in /public/images and replace each value with its path —
   nothing else changes, the lookups all go through ASSETS[key].
   ------------------------------------------------------------------------- */

export const ASSETS = {
  // Automotive body-in-white on a robot line — hero photograph
  hero: 'data:image/jpeg;base64,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',
  // Client marks, trimmed and composited on white
  logo_tata: 'data:image/jpeg;base64,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',
  logo_mahindra: 'data:image/jpeg;base64,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',
  logo_hero: 'data:image/jpeg;base64,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',
  logo_batx: 'data:image/jpeg;base64,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',
  logo_lohum: 'data:image/jpeg;base64,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',

  /* Chapter 02 — industrial project execution banner, supplied by the client. */
  industrial: 'data:image/jpeg;base64,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',
};
