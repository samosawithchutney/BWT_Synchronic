import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { analyzeMessage, translateMessage, GROQ_API_KEY } from '../utils/analyze'
import Tesseract from 'tesseract.js'
import ResultCard from './ResultCard'

const LANGS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi']
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

export default function Analyzer() {
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState('English')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [shared, setShared] = useState(false)
  const [activeExample, setActiveExample] = useState(false)
  const [originalMsg, setOriginalMsg] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const ref = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let mounted = true;
    const translate = async () => {
      if (activeExample && msg && originalMsg) {
        if (lang === 'English') {
          setMsg(originalMsg);
        } else {
          setIsTranslating(true);
          try {
            const translated = await translateMessage(originalMsg, lang);
            if (mounted) setMsg(translated);
          } catch (err) {
            console.error("Translation error:", err);
            // Optionally could set an error state here, but falling back to English is safer
            if (mounted) setMsg(originalMsg);
          } finally {
            if (mounted) setIsTranslating(false);
          }
        }
      }
    };
    translate();
    return () => { mounted = false; };
  }, [lang]);


  const analyze = async () => {
    if (!msg.trim()) return
    if (!GROQ_API_KEY) { setError('Add your Groq API key in src/utils/analyze.js'); return }
    setLoading(true); setError(null); setResult(null)
    try { setResult(await analyzeMessage(msg.trim(), lang)) }
    catch (err) {
      console.error(err)
      setError(err.message === 'NO_KEY' ? 'Add your Groq API key in src/utils/analyze.js' : `Analysis failed: ${err.message}. Please check your connection and API key.`)
    }
    finally { setLoading(false) }
  }

  const handleFileUpload = async (file) => {
    if (!file) return;
    setActiveExample(false);

    // Handle Text Files
    if (file.type.startsWith('text/') || file.name.endsWith('.eml') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => setMsg(e.target.result);
      reader.onerror = () => setError('Failed to read the text file.');
      reader.readAsText(file);
      return;
    }

    // Handle Images using Tesseract
    if (file.type.startsWith('image/')) {
      setIsExtracting(true);
      setError(null);
      try {
        const result = await Tesseract.recognize(file, 'eng');
        if (result.data.text.trim()) {
          setMsg(result.data.text);
        } else {
          setError('Could not extract any text from the image.');
        }
      } catch (err) {
        console.error('OCR Error:', err);
        setError('Image text extraction failed.');
      } finally {
        setIsExtracting(false);
      }
      return;
    }

    setError('Unsupported file format. Please drop an image or a text file.');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const share = () => {
    const t = 'SCAM ALERT - ' + result?.verdict + ' - ' + result?.explanation
    if (navigator.share) navigator.share({ title: 'Scam Alert', text: t })
    else { navigator.clipboard.writeText(t); setShared(true); setTimeout(() => setShared(false), 2500) }
  }

  const reset = () => { setResult(null); setMsg(''); setError(null); setTimeout(() => ref.current?.focus(), 100) }

  const s = (x, y) => ({ fontFamily: 'Sora,sans-serif', ...x, ...y })

  return (
    <section id="analyze" style={{ padding: '80px 64px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 100 }}>
          <span style={s({ display: 'inline-block', border: '1px solid #1e1e1e', borderRadius: 999, padding: '4px 14px', fontSize: 11, color: '#9a9489', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 })}>Analyzer</span>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 700, color: '#f5f0e8', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Paste any<br /><em style={{ fontStyle: 'italic', color: '#e63946' }}>suspicious</em><br />message.
          </h2>
          <p style={s({ fontSize: 14, lineHeight: 1.75, color: '#9a9489', marginBottom: 32, maxWidth: 360 })}>AI-powered scam detection in seconds, in your language.</p>
          <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 28 }}>
            {['Checks URLs against Google Safe Browsing', 'Verifies domain age via WHOIS', 'Scans Google Forms for payment fields', '6 Indian languages supported', 'Explains why — not just the verdict'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #52b788', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#52b788', fontSize: 10 }}>v</span>
                </div>
                <span style={s({ fontSize: 13, color: '#9a9489' })}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={s({ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9489', marginBottom: 10 })}>Language</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {LANGS.map(l => (
                      <button key={l} onClick={() => setLang(l)} style={{ padding: '6px 16px', borderRadius: 999, fontFamily: 'Sora,sans-serif', fontSize: 12, cursor: 'pointer', border: lang === l ? '1px solid #e63946' : '1px solid #1e1e1e', background: lang === l ? 'rgba(230,57,70,0.1)' : 'transparent', color: lang === l ? '#e63946' : '#9a9489' }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={s({ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9489' })}>Message</div>
                    <button onClick={() => fileInputRef.current?.click()} style={s({ background: 'none', border: 'none', color: '#52b788', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', padding: 0 })}>+ Extract from Image/File</button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,.txt,.eml,.csv" onChange={(e) => handleFileUpload(e.target.files[0])} />
                  </div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{ position: 'relative' }}
                  >
                    <textarea ref={ref} value={isTranslating ? "Translating example..." : isExtracting ? "Extracting text from image..." : msg} onChange={e => { setMsg(e.target.value); setActiveExample(false); }} placeholder="Paste the suspicious message, or drag & drop an image or text file here..." rows={7} disabled={isTranslating || isExtracting}
                      style={{ width: '100%', background: '#0e0e0e', border: isDragging ? '2px dashed #52b788' : '1px solid #1e1e1e', borderRadius: 12, padding: 16, color: '#f5f0e8', fontSize: 14, lineHeight: 1.7, fontFamily: 'Sora,sans-serif', resize: 'vertical', transition: 'border 0.2s', opacity: isDragging ? 0.7 : 1 }} />
                    {isDragging && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,14,14,0.8)', borderRadius: 12, pointerEvents: 'none' }}>
                        <span style={s({ color: '#52b788', fontSize: 14, fontWeight: 500 })}>Drop file to extract text</span>
                      </div>
                    )}
                  </div>

                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={s({ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 })}>Try an example</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {EX.map(ex => (
                      <button key={ex.label} onClick={async () => {
                        setActiveExample(true);
                        setOriginalMsg(ex.text);
                        if (lang !== 'English') {
                          setIsTranslating(true);
                          try {
                            setMsg(await translateMessage(ex.text, lang));
                          } catch (err) {
                            setMsg(ex.text);
                          } finally {
                            setIsTranslating(false);
                          }
                        } else {
                          setMsg(ex.text);
                        }
                      }}
                        onMouseEnter={e => { e.target.style.borderColor = '#e63946'; e.target.style.background = 'rgba(230,57,70,0.08)' }}
                        onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.background = '#141414' }}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 999,
                          border: '1px solid #2a2a2a',
                          background: '#141414',
                          color: '#f5f0e8',
                          fontSize: 12,
                          fontFamily: 'Sora, sans-serif',
                          cursor: 'pointer',
                          letterSpacing: '0.02em',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}>{ex.label}</button>
                    ))}
                  </div>
                </div>
                {error && <div style={s({ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 13, marginBottom: 16 })}>{error}</div>}
                <button onClick={analyze} disabled={!msg.trim() || loading} style={{ width: '100%', padding: 16, borderRadius: 10, border: 'none', background: !msg.trim() || loading ? 'rgba(230,57,70,0.3)' : '#e63946', color: '#f5f0e8', fontSize: 13, fontFamily: 'Sora,sans-serif', fontWeight: 500, cursor: !msg.trim() || loading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />Analyzing...</> : 'Analyze Message'}
                </button>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <ResultCard result={result} onReset={reset} onShare={share} />
                {shared && <div style={s({ textAlign: 'center', color: '#52b788', fontSize: 13, marginTop: 12 })}>Copied to clipboard</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
