# CampusGuard — Agent Build Instructions

> This file is a prompt for an AI coding agent (Trae, Cursor, Copilot, etc.).
> Read CAMPUSGUARD_PLAN.md first for full context on what this product is and why.
> Then follow every instruction in this file, in order, without skipping steps.

---

## Who You Are

You are a senior full-stack engineer building CampusGuard — a campus-specific scam detection platform for Indian college students. You write clean, minimal, production-grade React code. You never add unnecessary complexity. You never break existing functionality. You make surgical edits to existing files unless a full rewrite is explicitly requested.

---

## What This Codebase Already Has

Before touching anything, understand what is already built and working:

- `src/utils/analyze.js` — Groq API call using `llama-3.3-70b-versatile`. Has API key. Works.
- `src/components/Analyzer.jsx` — Language picker, textarea input, 3 example messages, calls `analyzeMessage()`, renders `ResultCard`
- `src/components/ResultCard.jsx` — Shows verdict, threat score circular meter, red flags, explanation, confidence bar, "Warn Others" + "Back" buttons
- `src/components/Features.jsx` — 3-column grid of 6 features
- `src/components/Extension.jsx` — Downloads a zip with manifest + content.js + outlook_content.js via JSZip
- `src/components/Navbar.jsx` — Fixed top nav
- `src/components/Footer.jsx` — Footer with tagline
- `src/App.jsx` — Hero section with phone SVG sketch, assembles all components
- `src/index.css` — Global styles, dot grid, scrollbar, Playfair Display + Sora fonts
- `content.js` — WhatsApp Web Chrome extension content script
- `outlook_content.js` — Outlook Web Chrome extension content script
- `manifest.json` — Chrome extension manifest v3

**Do not rewrite any of these files from scratch unless the instruction explicitly says "rewrite". Make targeted edits only.**

---

## Design System — Never Violate These

The entire product uses this design language. Every new UI element you add must follow it exactly.

### Colors
```
Background:   #080808
Surface:      #111111
Border:       #1e1e1e
Text primary: #f5f0e8
Text muted:   #9a9489
Text ghost:   #374151
Danger:       #e63946
Warning:      #f4a261
Safe:         #52b788
```

### Typography
```
Headings:     'Playfair Display', serif  — weights 400, 600, 700, 900
Body/UI:      'Sora', sans-serif         — weights 300, 400, 500, 600
```

### Rules
- No Tailwind utility classes for spacing/color — use inline styles only (existing pattern)
- No shadows heavier than `0 4px 16px rgba(0,0,0,0.25)`
- No border-radius above 16px on cards, 999px on pills
- All section labels: `font-size: 11px, letter-spacing: 0.1em, text-transform: uppercase, color: #9a9489`
- All section headings: Playfair Display, `font-size: clamp(28px, 3vw, 42px)`, `letter-spacing: -0.02em`
- Accent color (#e63946) used only for primary CTAs, danger verdicts, and decorative italic text
- Animations: Framer Motion only. Keep subtle — `duration: 0.4–0.8s`, `ease: [0.25, 0.46, 0.45, 0.94]`
- New UI cards: `background: #111, border: 1px solid #1e1e1e, border-radius: 10–12px, padding: 16–20px`

---

## Step 1 — Add API Keys

Open `src/utils/analyze.js`. At the top of the file, add these constants below the existing `GROQ_API_KEY`:

```javascript
export const SAFE_BROWSING_API_KEY = "" // Google Safe Browsing API key
export const WHOIS_API_KEY = ""         // whoisxmlapi.com API key
```

Do not remove or change `GROQ_API_KEY`. Do not change the existing `analyzeMessage` or `translateMessage` functions yet — you will extend them in Step 3.

---

## Step 2 — Add Utility Functions to `analyze.js`

Add the following four functions to `analyze.js` **below** the existing exports. Do not modify anything above them.

### 2a. URL Extractor

```javascript
export function extractUrls(text) {
  const regex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|forms\.gle\/[^\s]+|docs\.google\.com\/forms\/[^\s]+)/gi
  return [...new Set((text.match(regex) || []).map(u => u.replace(/[.,;)]+$/, '')))]
}
```

### 2b. Google Safe Browsing Check

```javascript
export async function checkSafeBrowsing(urls) {
  if (!SAFE_BROWSING_API_KEY || !urls.length) return []
  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'campusguard', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: urls.map(u => ({ url: u }))
          }
        })
      }
    )
    const data = await res.json()
    return (data.matches || []).map(m => m.threat.url)
  } catch {
    return []
  }
}
```

### 2c. WHOIS Domain Age Check

```javascript
export async function checkDomainAge(urls) {
  if (!WHOIS_API_KEY || !urls.length) return []
  const results = []
  for (const url of urls.slice(0, 3)) { // max 3 to save quota
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      const res = await fetch(
        `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`
      )
      const data = await res.json()
      const created = data?.WhoisRecord?.createdDate || data?.WhoisRecord?.registryData?.createdDate
      if (created) {
        const ageInDays = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24))
        results.push({ domain, ageInDays, created })
      }
    } catch {
      // skip this URL
    }
  }
  return results
}
```

### 2d. Google Form Scanner

```javascript
export async function analyzeGoogleForm(url) {
  if (!url) return null
  try {
    // Use a CORS proxy to fetch the public form
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl)
    const data = await res.json()
    const html = data?.contents || ''

    const paymentKeywords = [
      'payment', 'pay now', 'upi', 'gpay', 'phonepe', 'paytm',
      'registration fee', 'course fee', 'security deposit',
      'refundable', 'slot booking', 'bank transfer', 'neft', 'imps',
      '₹', 'inr', 'rs.', 'rupee'
    ]

    const text = html.toLowerCase()
    const foundKeywords = paymentKeywords.filter(k => text.includes(k))
    const hasPayment = foundKeywords.length > 0

    // Extract form title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].replace(' - Google Forms', '').trim() : 'Unknown Form'

    return { url, title, hasPayment, foundKeywords }
  } catch {
    return null
  }
}
```

---

## Step 3 — Update `analyzeMessage()` in `analyze.js`

Find the existing `analyzeMessage` function. **Replace it entirely** with this version. It runs all checks in parallel before calling Groq, then passes the enriched context to the AI:

```javascript
export async function analyzeMessage(msg, lang) {
  if (!GROQ_API_KEY) throw new Error('NO_KEY')

  // ── Step 1: Extract URLs ──────────────────────────────────
  const urls = extractUrls(msg)
  const googleFormUrls = urls.filter(u =>
    u.includes('docs.google.com/forms') || u.includes('forms.gle')
  )

  // ── Step 2: Run all external checks in parallel ───────────
  const [safeBrowsingFlagged, domainAgeResults, formResults] = await Promise.all([
    checkSafeBrowsing(urls),
    checkDomainAge(urls.filter(u => !u.includes('google.com') && !u.includes('forms.gle'))),
    googleFormUrls.length ? analyzeGoogleForm(googleFormUrls[0]) : Promise.resolve(null),
  ])

  // ── Step 3: Build enriched context ───────────────────────
  const contextParts = []

  if (safeBrowsingFlagged.length) {
    contextParts.push(`ALERT: The following URLs are confirmed malicious by Google Safe Browsing: ${safeBrowsingFlagged.join(', ')}`)
  }

  const youngDomains = domainAgeResults.filter(d => d.ageInDays < 90)
  if (youngDomains.length) {
    youngDomains.forEach(d => {
      contextParts.push(`ALERT: Domain "${d.domain}" was registered only ${d.ageInDays} days ago. This is a strong scam signal.`)
    })
  }

  if (formResults?.hasPayment) {
    contextParts.push(`ALERT: The Google Form in this message ("${formResults.title}") contains payment-related fields: ${formResults.foundKeywords.join(', ')}. Legitimate companies never collect payment via Google Forms.`)
  } else if (formResults && !formResults.hasPayment) {
    contextParts.push(`NOTE: A Google Form was found ("${formResults.title}") but no payment fields were detected.`)
  }

  const enrichedMsg = contextParts.length
    ? `${msg}\n\n[Pre-analysis findings:\n${contextParts.join('\n')}]`
    : msg

  const SYS = `You are a cybersecurity expert protecting Indian college students from scams.

You specialize in detecting these campus-specific attacks:
1. WhatsApp group scams — unknown admin adds students to a group, shares a Google Form for a fake internship, asks for payment to "secure a slot", spams urgency messages ("only 3 slots left")
2. Fake internship emails — impersonates TCS/Infosys/Google/Microsoft, asks for course/certification/registration fee before onboarding
3. KYC/Digital arrest scams — impersonates CBI/ED/TRAI/RBI/police, threatens legal action unless money is transferred immediately
4. Bank fraud — fake SBI/HDFC/Aadhaar messages threatening account suspension

Key red flags you always check:
- Any payment required for an internship (legitimate companies NEVER charge candidates)
- Google Form used for official company recruitment
- Urgency language: "limited slots", "expires tonight", "only X left"
- Domain age < 90 days (pre-analysis will flag this if detected)
- Google Safe Browsing matches (pre-analysis will flag this if detected)
- Sender email is gmail/yahoo for a supposed MNC HR
- Unrealistic stipend for freshers (> ₹25,000/month with no skills required)

Return ONLY valid JSON. All string values in ${lang}:
{
  "verdict": "SCAM or SUSPICIOUS or SAFE",
  "confidence": 0-100,
  "scam_type": "specific category string or null",
  "threat_score": 0-100,
  "red_flags": ["concise flag 1", "concise flag 2", "concise flag 3"],
  "explanation": "2-3 plain sentences a student can immediately understand",
  "what_they_want": "one line — what the scammer is after",
  "what_to_do": "one line — clear action for the student right now"
}`

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + GROQ_API_KEY },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: 'Analyze this message:\n\n' + enrichedMsg }
      ],
      temperature: 0.1,
      max_tokens: 900
    })
  })

  if (!r.ok) throw new Error('ERR_' + r.status)
  const d = await r.json()
  const result = JSON.parse(d.choices[0].message.content.trim().replace(/```json|```/g, '').trim())

  // ── Step 4: Attach URL intelligence to result ─────────────
  result.urlIntelligence = {
    safeBrowsingFlagged,
    domainAgeResults,
    formAnalysis: formResults,
  }

  return result
}
```

---

## Step 4 — Update `ResultCard.jsx`

The result card needs two new sections to display URL intelligence data. Make these **targeted additions** only — do not change any existing layout or styling.

### 4a. After the `red_flags` section, add a URL Intelligence section

Add this block. It should only render if `result.urlIntelligence` exists and has findings:

```jsx
{/* URL Intelligence */}
{result.urlIntelligence && (() => {
  const { safeBrowsingFlagged, domainAgeResults, formAnalysis } = result.urlIntelligence
  const hasFindings = safeBrowsingFlagged?.length || domainAgeResults?.some(d => d.ageInDays < 90) || formAnalysis?.hasPayment
  if (!hasFindings) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: '#9a9489', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Sora, sans-serif' }}>
        URL Intelligence
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {safeBrowsingFlagged?.map((url, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🚫</span>
            <div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600, color: '#e63946', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Google Safe Browsing — Confirmed Malicious</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, color: '#fca5a5', wordBreak: 'break-all' }}>{url}</div>
            </div>
          </div>
        ))}

        {domainAgeResults?.filter(d => d.ageInDays < 90).map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.2)', borderRadius: 8, padding: '10px 14px' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🕐</span>
            <div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600, color: '#f4a261', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                New Domain — {d.ageInDays < 7 ? 'Created this week' : d.ageInDays < 30 ? 'Created this month' : `Only ${d.ageInDays} days old`}
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, color: '#fdba74' }}>{d.domain} — registered {new Date(d.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        ))}

        {formAnalysis?.hasPayment && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>📋</span>
            <div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600, color: '#e63946', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Google Form — Payment Fields Detected</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, color: '#fca5a5' }}>"{formAnalysis.title}" — contains: {formAnalysis.foundKeywords.slice(0, 4).join(', ')}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
})()}
```

---

## Step 5 — Update `Analyzer.jsx`

### 5a. Replace the examples array

Find the `EX` or `EXAMPLES` array in `Analyzer.jsx` and replace it with:

```javascript
const EX = [
  {
    label: 'WhatsApp Group Scam',
    text: 'Hi! You\'ve been shortlisted for the Google India Campus Internship 2025. Please fill this form to secure your slot — only 4 remaining! docs.google.com/forms/d/example Registration fee: ₹999 (fully refundable after joining). Hurry, offer closes tonight at 11:59 PM. Contact HR: +91 9876543210'
  },
  {
    label: 'Fake Job Email',
    text: 'Dear Student, Congratulations! You have been shortlisted for the TCS Digital Intern role (₹45,000/month). To confirm your onboarding, please complete the mandatory certification course at tcs-training-portal.xyz. Course fee: ₹3,500. Pay within 24 hours or the offer will be given to the next candidate.'
  },
  {
    label: 'Digital Arrest',
    text: 'This is Deputy Commissioner of CBI. A money laundering case has been filed on your Aadhaar number. You are under digital arrest. Transfer ₹2,00,000 to avoid arrest warrant. Do not disconnect or inform anyone. This call is being recorded.'
  },
]
```

### 5b. Update the section heading copy

Find the `<h2>` in the left column of the Analyzer section. Replace the text content with:

```jsx
<h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(32px,3.5vw,48px)',fontWeight:700,color:'#f5f0e8',lineHeight:1.15,marginBottom:20,letterSpacing:'-0.02em'}}>
  Paste any<br/><em style={{fontStyle:'italic',color:'#e63946'}}>suspicious</em><br/>message.
</h2>
```

### 5c. Update the features checklist copy

Find the array of feature strings in the left column and replace with:

```javascript
[
  'Checks URLs against Google Safe Browsing',
  'Verifies domain age via WHOIS',
  'Scans Google Forms for payment fields',
  '6 Indian languages supported',
  'Explains why — not just the verdict',
]
```

---

## Step 6 — Update `Features.jsx`

Replace the features data array with this updated version that reflects the new capabilities:

```javascript
const F = [
  { n: '01', t: 'Google Form Scanner', d: 'Detects payment fields inside Google Forms — the exact method used in WhatsApp group internship scams targeting college students.' },
  { n: '02', t: 'Safe Browsing Check', d: 'Every URL is cross-referenced against Google\'s database of millions of confirmed phishing and malware sites before the AI even runs.' },
  { n: '03', t: 'Domain Age Intelligence', d: 'WHOIS lookup reveals how old a domain is. A site claiming to be TCS registered 4 days ago is an immediate red flag.' },
  { n: '04', t: 'Campus Threat Model', d: 'AI trained specifically on internship fraud, fake placement drives, and WhatsApp group scams — not generic fraud patterns.' },
  { n: '05', t: '6 Indian Languages', d: 'Results delivered in Hindi, Tamil, Telugu, Bengali, Marathi, or English — built for students who think in their mother tongue.' },
  { n: '06', t: 'Three Surfaces', d: 'Web app for one-off checks. Chrome extension auto-intercepts on WhatsApp Web and Outlook. One install, everywhere you need it.' },
]
```

---

## Step 7 — Update `App.jsx` Hero Section

### 7a. Update the hero headline

Find the `<h1>` in the hero section. Replace it with:

```jsx
<h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(44px,5.5vw,72px)',fontWeight:700,lineHeight:1.08,color:'#f5f0e8',marginBottom:28,letterSpacing:'-0.02em'}}>
  Your campus.<br/><em style={{fontStyle:'italic',color:'#e63946'}}>Their target.</em><br/>Our shield.
</h1>
```

### 7b. Update the hero description

Find the `<p>` below the `<h1>` in the hero. Replace it with:

```jsx
<p style={{fontFamily:'Sora,sans-serif',fontSize:16,lineHeight:1.75,color:'#9a9489',marginBottom:40,maxWidth:440}}>
  CampusGuard detects fake internship offers, WhatsApp group scams, and phishing emails — before you pay, click, or respond. Built on real attacks from real Indian campuses.
</p>
```

### 7c. Update the stats row

Find the stats array `[{n:'1.25L Cr',...}]` and replace it with:

```javascript
[
  { n: '₹1.25L Cr', l: 'lost annually' },
  { n: '3 surfaces', l: 'protected' },
  { n: '6 langs', l: 'supported' },
]
```

### 7d. Update the navbar brand name

In `Navbar.jsx`, find the brand text `IS THIS REAL` and replace with `CAMPUSGUARD`.

---

## Step 8 — Update `Extension.jsx` Copy Only

Do not change any logic in `Extension.jsx`. Only update these text strings:

- Section label: change to `Chrome Extension v2.0`
- Heading: change to `One install.<br/><em>Two surfaces protected.</em>`
- Description paragraph: change to `Install once. CampusGuard silently watches every incoming WhatsApp message and college email — flagging scams before you read them. No manual steps. No configuration.`
- The two coverage pills: keep `💬 WhatsApp Web` and change `📧 Outlook Web` to `📧 Outlook (Web + Desktop)`

---

## Step 9 — Update `content.js` (WhatsApp Extension)

Add Google Form detection to the WhatsApp extension. Find the `analyzeText` function in `content.js` and add this check **before** the Groq API call:

```javascript
// Detect Google Form links and add to context
const formUrls = text.match(/docs\.google\.com\/forms\/[^\s]+|forms\.gle\/[^\s]+/gi) || []
let formContext = ''
if (formUrls.length > 0) {
  formContext = ' [ALERT: This message contains a Google Form link. Google Forms are commonly used in fake internship WhatsApp group scams to collect payment from students.]'
}
```

Then update the user message to include formContext:

```javascript
{ role: 'user', content: 'Analyze this WhatsApp message for campus scams: ' + text + formContext }
```

Also update the system prompt string in `content.js` to this campus-focused version:

```javascript
`You detect scams targeting Indian college students on WhatsApp.
Focus on: fake internship group scams (Google Form + payment), KYC fraud, digital arrest, bank impersonation.
Key rule: any internship message asking for money is always a SCAM.
Return ONLY JSON: {"verdict":"SCAM or SUSPICIOUS or SAFE","scam_type":"string or null","reason":"one plain sentence"}`
```

---

## Step 10 — Final Checks

After completing all steps above, verify the following before considering the build complete:

**Functionality:**
- [ ] `analyzeMessage()` runs URL extraction → Safe Browsing → WHOIS → Form scan → Groq, in that order
- [ ] If no API keys are provided for Safe Browsing or WHOIS, those checks return empty arrays gracefully — app does not crash
- [ ] `ResultCard` only shows URL Intelligence section when there are actual findings — does not show empty section
- [ ] All 3 new example messages in `Analyzer.jsx` are correctly loaded when clicked
- [ ] Extension download still produces a valid zip with all 3 files

**Design:**
- [ ] No new element uses a color outside the design system
- [ ] No new element uses a font other than Playfair Display or Sora
- [ ] All new cards/sections match the existing `background: #111, border: 1px solid #1e1e1e` pattern
- [ ] No console errors on page load

**Copy:**
- [ ] Product is referred to as CampusGuard everywhere in the UI
- [ ] Navbar says CAMPUSGUARD
- [ ] Hero headline is updated
- [ ] Features grid reflects the new capabilities

---

## What Not To Touch

Do not modify any of the following unless explicitly stated above:

- `src/main.jsx`
- `src/index.css`
- `postcss.config.js`
- `tailwind.config.js`
- `vite.config.js`
- `package.json`
- `index.html`
- `outlook_content.js`
- `manifest.json` (already updated)
- The `translateMessage()` function in `analyze.js`
- The Framer Motion animation on the hero phone sketch SVG
- The threat meter SVG in `ResultCard.jsx`
- The confidence bar in `ResultCard.jsx`
- The JSZip download logic in `Extension.jsx`

---

## API Keys Reference

Before running the app, ensure these are filled in `analyze.js`:

| Constant | Where to get it | Free tier |
|---|---|---|
| `GROQ_API_KEY` | console.groq.com | Already set |
| `SAFE_BROWSING_API_KEY` | console.cloud.google.com → Safe Browsing API | 10,000/day free |
| `WHOIS_API_KEY` | whoisxmlapi.com → sign up | 500/month free |

---

## Done

When all 10 steps are complete, the product is CampusGuard — a campus threat intelligence platform that:

1. Detects the WhatsApp group internship scam (Google Form + payment)
2. Verifies every URL against Google Safe Browsing
3. Checks domain age via WHOIS
4. Scans Google Forms for payment extraction
5. Runs all of the above through a campus-tuned AI model
6. Displays enriched results with URL intelligence badges
7. Auto-intercepts on WhatsApp Web and Outlook via Chrome extension
8. Supports 6 Indian languages

No other team at this hackathon has this combination. Ship it.
