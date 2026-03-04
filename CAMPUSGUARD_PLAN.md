# CampusGuard — Ultimate Product & Technical Plan

> *"Every other team built a scam detector. We built a campus threat intelligence system trained on the exact attacks our college has already survived."*

---

## The Problem No One Else Is Solving

### Three real attacks. One campus. Zero protection.

**Attack 1 — The WhatsApp Group Scam** *(your first semester)*
A stranger adds you and your friends to a group named "Google Internship 2024" or "TCS Campus Drive." The credibility comes from seeing familiar faces already in the group. A Google Form is shared. Payment is required to "secure your slot." The admin spams urgency: *"Only 3 slots left."* Students pay. The group goes silent.

**Attack 2 — The Fake Internship Email**
An official-looking email arrives in your college inbox. Subject: *"Shortlisted for Microsoft Internship — Action Required."* The email asks you to complete a paid certification course before onboarding. The domain was registered 6 days ago.

**Attack 3 — The KYC/Arrest Message**
A WhatsApp message from an unknown number. *"Your Aadhaar has been linked to a money laundering case. You are under digital arrest. Transfer ₹50,000 to avoid imprisonment."*

**What these three attacks have in common:**
- They all target students specifically
- They all exploit trust (familiar names, known company brands, authority figures)
- They all use urgency to prevent the victim from thinking clearly
- They have all happened at Indian colleges and will keep happening

No existing product — not Truecaller, not any Chrome extension, not any email filter — is trained on this specific threat model. That is our gap. That is our product.

---

## What CampusGuard Is

CampusGuard is a **campus-specific threat intelligence layer** that intercepts student-targeted fraud before money moves — across every digital surface students use: WhatsApp, email, and web forms.

### The Core Insight

Generic scam detectors ask: *"Is this a scam?"*

CampusGuard asks: *"Is this the specific kind of scam that targets Indian college students?"*

That specificity is the entire moat. Our AI is not a general fraud classifier. It is trained on the anatomy of campus fraud — the exact language patterns, the exact social engineering techniques, the exact payment extraction methods that are used against students in India right now.

---

## The Scam Anatomy Engine

### Attack Pattern 1 — WhatsApp Group Scam (NEW)

This is the most underdetected pattern because it exploits social proof. The victim joins a group, sees friends there, and assumes legitimacy. The scam has 5 distinct phases:

```
Phase 1 — SEEDING
  Unknown number adds victim + acquaintances to group
  Group name: "[Company] Internship 2025" / "Campus Drive [College Name]"
  Signal: Unknown admin + group name contains brand + internship keyword

Phase 2 — CREDIBILITY
  First few messages seem professional
  Fake offer letter or JD shared as image
  Signal: Image-only content (avoids text detection), no official domain

Phase 3 — HOOK
  Google Form link dropped in group
  Form collects: Name, College, Branch, Phone, Email
  Signal: Google Form used for official company recruitment (red flag)

Phase 4 — PAYMENT EXTRACTION
  Form has payment section OR separate UPI/bank link sent
  Amount: ₹500–₹5,000 (small enough to not trigger alarm)
  Framed as: "Refundable security deposit" / "Course kit fee" / "Slot booking"
  Signal: Any payment requirement in an internship context

Phase 5 — URGENCY SPAM
  Admin sends repeated messages: "Only 2 slots left"
  Countdown timer language: "Offer closes tonight at 11:59 PM"
  Signal: Scarcity + urgency + repetition = manufactured pressure
```

**Detection signals we will train on:**
- Google Form links in internship context + payment mention
- Unknown sender + MNC brand name + payment in same message
- Scarcity language density (how many urgency words per message)
- Group message patterns (same sender, high frequency, escalating urgency)

---

### Attack Pattern 2 — Fake Internship Email

**Detection signals:**
- Subject line contains: shortlisted / selected / congratulations + internship/job/placement
- Sender domain ≠ company domain (gmail/yahoo/outlook.com for supposed MNC)
- Domain age < 90 days (WHOIS check)
- URL in email flagged by Google Safe Browsing
- Body contains: course fee / certification / training fee / registration fee / deposit
- Stipend mentioned is unrealistic (> ₹20,000/month for fresher)
- No interview mentioned — direct "offer" with payment requirement

---

### Attack Pattern 3 — KYC / Digital Arrest / Bank Fraud

**Detection signals:**
- Government authority impersonation (CBI, ED, TRAI, Income Tax, RBI)
- Legal threat language (arrest, warrant, case filed, FIR)
- Urgency with financial demand
- Aadhaar / PAN / bank account mentioned with threat
- Unknown number with official-sounding name

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMPUSGUARD PIPELINE                          │
│                                                                  │
│  RAW INPUT (text / email / URL)                                  │
│       │                                                          │
│       ├─► URL EXTRACTOR                                          │
│       │      ├─► Google Safe Browsing API  → known malicious?    │
│       │      └─► WHOIS API                 → domain age?         │
│       │                                                          │
│       ├─► PATTERN PRE-SCANNER (local, zero-latency)             │
│       │      ├─► Urgency word density scorer                     │
│       │      ├─► MNC brand spoof detector                        │
│       │      ├─► Payment keyword extractor                       │
│       │      ├─► Google Form link detector                       │
│       │      └─► Known scam number lookup                        │
│       │                                                          │
│       └─► GROQ AI (llama-3.3-70b-versatile)                     │
│              Context: raw input + URL flags + pattern flags      │
│              Prompt: campus-specific threat model                │
│              Output: structured JSON verdict                     │
│                                                                  │
│  OUTPUT                                                          │
│    verdict · scam_type · threat_score · red_flags               │
│    domain_age · safe_browsing_status                            │
│    what_they_want · what_to_do · translated_summary             │
└─────────────────────────────────────────────────────────────────┘
```

### Surfaces

| Surface | How | Status |
|---|---|---|
| **Web App** | Paste any text, image (OCR), or URL | ✅ Built |
| **WhatsApp Web** | Chrome extension — auto-intercepts messages | ✅ Built |
| **Outlook Web** | Chrome extension — auto-scans emails | ✅ Built |
| **Outlook Desktop** | Office Add-in (Office.js) — ribbon button | 🔨 Next |
| **Google Form detector** | Checks if a Form URL is collecting payment data | 🔨 Next |

---

## The New Feature: Google Form Scanner

This is the feature no other team will have.

When a Google Form link is detected in a message or email, CampusGuard fetches and analyzes the form content:

```
Google Form URL detected in message
         │
         ▼
Fetch the form page (public, no auth needed)
         │
         ▼
Extract: title, description, field labels, payment mentions
         │
         ▼
Red flags:
  - Form title mentions internship + company brand
  - Payment field present (UPI, bank, QR code mentioned)
  - No official company domain linked
  - Form created recently
         │
         ▼
Result added to threat analysis before Groq call
```

**Why this matters:** The WhatsApp group scam always uses a Google Form. Every single time. This one check alone would have stopped your first-semester scam.

---

## API Integrations

### 1. Google Safe Browsing API
- **Cost:** Free up to 10,000 calls/day
- **Setup:** console.cloud.google.com → enable Safe Browsing API → get key
- **What it does:** Checks any URL against Google's database of phishing, malware, and social engineering sites
- **Integration point:** `analyze.js` — runs before Groq call, result passed as context

### 2. WHOIS / Domain Age API
- **Provider:** whoisxmlapi.com
- **Cost:** 500 free lookups (enough for hackathon + demo)
- **Setup:** Sign up → get API key → instant
- **What it does:** Returns domain creation date
- **Scoring:**
  - Created < 30 days → +40 threat score
  - Created < 90 days → +20 threat score
  - Created > 1 year → -10 threat score (reduces false positives)
- **Integration point:** `analyze.js` — runs in parallel with Safe Browsing

### 3. Google Forms Analysis
- **Cost:** Free (public fetch)
- **What it does:** Fetches the form HTML and scans for payment keywords and suspicious fields
- **Integration point:** New function `analyzeGoogleForm()` in `analyze.js`

---

## Updated `analyze.js` Flow

```javascript
export async function analyzeMessage(msg, lang) {

  // Step 1 — Extract URLs from message
  const urls = extractUrls(msg)

  // Step 2 — Run URL checks in parallel (fast)
  const [safeBrowsingResults, whoisResults, formResults] = await Promise.all([
    urls.length ? checkSafeBrowsing(urls) : [],
    urls.length ? checkDomainAge(urls) : [],
    urls.some(isGoogleForm) ? analyzeGoogleForms(urls) : [],
  ])

  // Step 3 — Build enriched context for Groq
  const enrichedContext = buildContext(msg, safeBrowsingResults, whoisResults, formResults)

  // Step 4 — Groq analysis with full context
  return await callGroq(enrichedContext, lang)
}
```

---

## What The Demo Looks Like

### Demo Scene 1 — Web App (60 seconds)

*"Let me show you a message that was sent to first-year students at our college."*

Paste: *"Hi! You've been added to our TCS Campus Internship 2025 group. Please fill this Google Form to secure your slot — only 5 remaining! Form: docs.google.com/forms/xxxxx. Registration fee: ₹999 (refundable). Hurry — offer closes tonight."*

Result appears:
- 🚨 **SCAM DETECTED** — Fake Internship + Payment Extraction
- Threat Score: **94/100**
- Red Flags: Google Form with payment · Urgency language · TCS does not charge candidates · Unknown sender
- Domain age check: N/A (Google Form)
- Form analysis: Payment field detected in internship form
- They Want: ₹999 from every student who fills the form
- What To Do: Do not pay. Report the group admin. Forward this result to your college placement cell.

### Demo Scene 2 — Outlook Extension (30 seconds)

Open a real-looking fake internship email in Outlook. The banner appears automatically before the judge even reads it.

### Demo Scene 3 — WhatsApp Extension (30 seconds)

Show the badge appearing on a WhatsApp message in real time.

---

## Pitch Script

> *"In our first semester, students from our college were added to a WhatsApp group called 'Google Internship 2025.' A Google Form was shared. A ₹999 fee was required to 'secure your slot.' The admin kept saying only 3 slots were left. Many students paid. The group went silent.*
>
> *That scam has a specific anatomy. It always uses a group. It always uses a Google Form. It always mentions a major company. It always uses urgency. And it always asks for a small enough amount that students don't think twice.*
>
> *No existing tool catches it. Truecaller doesn't scan WhatsApp groups. Email filters don't understand internship context. Generic scam detectors don't know what a fake Google Form looks like.*
>
> *CampusGuard does. Because we built it on the attacks that have already happened here. This is not a generic scam detector. It is a campus threat intelligence system — trained on the exact fraud that targets Indian students, deployed on every surface they use: WhatsApp, Outlook, and the web.*
>
> *One extension. Three surfaces. Zero excuses for any student to fall for this again."*

---

## Why No Other Team Can Match This

| What other teams have | What we have |
|---|---|
| Generic scam detection | **Campus-specific threat model** |
| One surface (usually just web) | **Three surfaces, one engine** |
| Text analysis only | **Text + URL + Domain age + Safe Browsing + Form analysis** |
| Detects known scams | **Detects the WhatsApp group scam anatomy specifically** |
| Demo: paste a fake bank message | **Demo: the exact scam that happened at our college** |
| No institutional story | **Built on a real incident. Real students. Real money lost.** |

The last point is the most important. Judges at hackathons can spot generic ideas immediately. What they cannot dismiss is a team that says *"this happened to us, here is the evidence, here is the fix."* That is not a project. That is a product.

---

## Build Order (Remaining Time)

### Priority 1 — High impact, fits in 30 min each

- [ ] Google Safe Browsing API integration in `analyze.js`
- [ ] WHOIS domain age check in `analyze.js`
- [ ] Run both in parallel before Groq call, pass results as context

### Priority 2 — High impact, 45 min

- [ ] Google Form scanner function
- [ ] Add Google Form detection to WhatsApp extension (`content.js`)

### Priority 3 — Demo polish, 30 min

- [ ] Update web app result card to show domain age + Safe Browsing status
- [ ] Update system prompt in `analyze.js` to reference URL pre-check results
- [ ] Add the WhatsApp group scam example to the web app's example messages

### Priority 4 — If time allows

- [ ] Outlook Office Add-in (replaces Chrome extension for Outlook)
- [ ] Rebrand web app header to CampusGuard

---

## File Change Summary

| File | What changes |
|---|---|
| `src/utils/analyze.js` | Add Safe Browsing + WHOIS + Form scanner. Run before Groq. |
| `src/components/ResultCard.jsx` | Show domain age + Safe Browsing badge in output |
| `src/components/Analyzer.jsx` | Add WhatsApp group scam to example messages |
| `content.js` | Detect Google Form links in WhatsApp messages |
| `outlook_content.js` | No change needed |
| `src/components/Extension.jsx` | No change needed |

---

*CampusGuard — Built for the students who got scammed, so the next batch doesn't have to be.*
