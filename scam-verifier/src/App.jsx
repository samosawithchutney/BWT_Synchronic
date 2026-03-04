import { useRef } from 'react'
import Navbar from './components/Navbar'
import Analyzer from './components/Analyzer'
import Features from './components/Features'
import Extension from './components/Extension'
import Footer from './components/Footer'

export default function App() {
  const ref = useRef(null)
  const go = () => ref.current?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#f5f0e8' }}>
      <Navbar onAnalyze={go} />
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 64px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #1e1e1e 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.6 }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #1e1e1e', borderRadius: 999, padding: '5px 14px', fontSize: 11, color: '#9a9489', fontFamily: 'Sora,sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e63946', display: 'inline-block' }} />Cyber Threat Detection
              </span>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(44px,5.5vw,72px)', fontWeight: 700, lineHeight: 1.08, color: '#f5f0e8', marginBottom: 28, letterSpacing: '-0.02em' }}>
              Your campus.<br /><em style={{ fontStyle: 'italic', color: '#e63946' }}>Their target.</em><br />Our shield.
            </h1>
            <p style={{ fontFamily: 'Sora,sans-serif', fontSize: 16, lineHeight: 1.75, color: '#9a9489', marginBottom: 40, maxWidth: 440 }}>
              CampusGuard detects fake internship offers, WhatsApp group scams, and phishing emails — before you pay, click, or respond. Built on real attacks from real Indian campuses.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={go} style={{ background: '#e63946', color: '#f5f0e8', border: 'none', borderRadius: 8, padding: '14px 32px', fontSize: 13, fontFamily: 'Sora,sans-serif', fontWeight: 500, cursor: 'pointer' }}>Analyze a Message</button>
              <a href="#extension" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #1e1e1e', borderRadius: 8, padding: '14px 28px', fontSize: 13, fontFamily: 'Sora,sans-serif', color: '#9a9489', textDecoration: 'none' }}>Get Extension</a>
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 56, paddingTop: 32, borderTop: '1px solid #1e1e1e', flexWrap: 'wrap' }}>
              {[{ n: '₹1.25L Cr', l: 'lost annually' }, { n: '3 surfaces', l: 'protected' }, { n: '6 langs', l: 'supported' }].map(s => (
                <div key={s.n}>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: '#f5f0e8', fontWeight: 600 }}>{s.n}</div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 11, color: '#9a9489', marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 340 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: 440 }}>
              <rect x="90" y="40" width="160" height="360" rx="22" stroke="#f5f0e8" strokeWidth="1.5" strokeDasharray="4 2" fill="none" opacity="0.7" />
              <rect x="100" y="68" width="140" height="284" rx="4" stroke="#f5f0e8" strokeWidth="0.8" fill="#111" opacity="0.5" />
              <rect x="155" y="50" width="30" height="9" rx="4" stroke="#f5f0e8" strokeWidth="0.7" fill="none" opacity="0.5" />
              <line x1="150" y1="385" x2="190" y2="385" stroke="#f5f0e8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              {[88, 130, 172].map((y, i) => (
                <g key={i}>
                  <rect x="107" y={y} width="126" height="32" rx="6" stroke="#f5f0e8" strokeWidth="0.7" fill="#1a1a1a" opacity="0.8" />
                  <line x1="116" y1={y + 11} x2="222" y2={y + 11} stroke="#9a9489" strokeWidth="0.6" opacity="0.6" />
                  <line x1="116" y1={y + 20} x2="205" y2={y + 20} stroke="#9a9489" strokeWidth="0.6" opacity="0.4" />
                  <line x1={221} y1={y + 7} x2={229} y2={y + 15} stroke="#e63946" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
                  <line x1={229} y1={y + 7} x2={221} y2={y + 15} stroke="#e63946" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
                </g>
              ))}
              <g transform="translate(216,12)">
                <rect width="124" height="50" rx="10" stroke="#e63946" strokeWidth="1.2" fill="#1a0a0a" opacity="0.95" />
                <circle cx="16" cy="15" r="7" stroke="#e63946" strokeWidth="1" fill="none" />
                <line x1="16" y1="11" x2="16" y2="17" stroke="#e63946" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="16" cy="20" r="1" fill="#e63946" />
                <line x1="29" y1="12" x2="112" y2="12" stroke="#e63946" strokeWidth="0.8" opacity="0.9" />
                <text x="29" y="38" fill="#e63946" fontSize="8" fontFamily="Sora,sans-serif">SCAM DETECTED</text>
                <line x1="0" y1="50" x2="-30" y2="80" stroke="#e63946" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.5" />
              </g>
              <g transform="translate(-94,148)">
                <rect width="114" height="46" rx="10" stroke="#f4a261" strokeWidth="1.2" fill="#1a1208" opacity="0.95" />
                <circle cx="14" cy="13" r="6" stroke="#f4a261" strokeWidth="1" fill="none" />
                <line x1="14" y1="9" x2="14" y2="15" stroke="#f4a261" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="14" cy="18" r="1" fill="#f4a261" />
                <line x1="26" y1="10" x2="102" y2="10" stroke="#f4a261" strokeWidth="0.8" opacity="0.9" />
                <text x="26" y="34" fill="#f4a261" fontSize="8" fontFamily="Sora,sans-serif">SUSPICIOUS</text>
                <line x1="114" y1="23" x2="154" y2="28" stroke="#f4a261" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.5" />
              </g>
              <g transform="translate(208,318)">
                <rect width="114" height="46" rx="10" stroke="#e63946" strokeWidth="1.2" fill="#1a0a0a" opacity="0.95" />
                <circle cx="14" cy="13" r="6" stroke="#e63946" strokeWidth="1" fill="none" />
                <text x="26" y="34" fill="#e63946" fontSize="8" fontFamily="Sora,sans-serif">DIGITAL ARREST</text>
                <line x1="0" y1="20" x2="-18" y2="14" stroke="#e63946" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.5" />
              </g>
              <path d="M170 230 L160 239 L160 252 C160 259 165 265 170 268 C175 265 180 259 180 252 L180 239 Z" stroke="#52b788" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M165 250 L168 254 L176 246" stroke="#52b788" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
            </svg>
          </div>
        </div>
      </section>
      <div ref={ref}><Analyzer /></div>
      <Features />
      <Extension />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}><Footer /></div>
    </div>
  )
}
