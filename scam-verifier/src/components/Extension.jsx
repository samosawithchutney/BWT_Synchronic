import { useState } from 'react'
const STEPS = ['Download the zip', 'Unzip the file', 'Open chrome://extensions', 'Enable Developer Mode', 'Click Load unpacked', 'Open WhatsApp Web']
export default function Extension() {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const dl = async () => {
    setBusy(true)
    try {
      const { default: Z } = await import('jszip')
      const z = new Z()
      z.file('manifest.json', '{"manifest_version":3,"name":"ScamVerifier","version":"1.0","host_permissions":["https://web.whatsapp.com/*","https://api.groq.com/*"],"content_scripts":[{"matches":["https://web.whatsapp.com/*"],"js":["content.js"]}]}')
      z.file('content.js', '/* Add your Groq key and paste detection logic here */')
      const b = await z.generateAsync({ type: 'blob' })
      const u = URL.createObjectURL(b), a = document.createElement('a')
      a.href = u; a.download = 'scam-verifier-ext.zip'; a.click(); URL.revokeObjectURL(u)
      setDone(true); setTimeout(() => setDone(false), 3000)
    } catch (e) { alert('Install jszip: npm install jszip') }
    finally { setBusy(false) }
  }
  return (
    <section id="extension" style={{ padding: '80px 64px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <span style={{ display: 'inline-block', border: '1px solid #1e1e1e', borderRadius: 999, padding: '4px 14px', fontSize: 11, color: '#9a9489', fontFamily: 'Sora,sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Chrome Extension v2.0</span>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(28px,3vw,42px)', fontWeight: 700, color: '#f5f0e8', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            One install.<br /><em style={{ fontStyle: 'italic', color: '#e63946' }}>Two surfaces protected.</em>
          </h2>
          <p style={{ fontFamily: 'Sora,sans-serif', fontSize: 14, lineHeight: 1.75, color: '#9a9489', marginBottom: 32, maxWidth: 380 }}>Install once. CampusGuard silently watches every incoming WhatsApp message and college email — flagging scams before you read them. No manual steps. No configuration.</p>
          <button onClick={dl} disabled={busy} style={{ padding: '14px 32px', borderRadius: 8, border: 'none', background: done ? '#52b788' : busy ? 'rgba(230,57,70,0.4)' : '#e63946', color: '#f5f0e8', fontSize: 13, fontFamily: 'Sora,sans-serif', fontWeight: 500, cursor: busy ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}>
            {done ? 'Downloaded!' : busy ? 'Packaging...' : 'Download Extension'}
          </button>
        </div>
        <div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 10, color: '#9a9489', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>How to install</div>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #1e1e1e', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display,serif', fontSize: 12, color: '#9a9489' }}>{i + 1}</div>
                {i < STEPS.length - 1 && <div style={{ width: 1, height: 22, background: '#1e1e1e', margin: '3px 0' }} />}
              </div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 13, color: i === 0 ? '#f5f0e8' : '#9a9489', lineHeight: 1.55, paddingTop: 5, paddingBottom: i < STEPS.length - 1 ? 20 : 0 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
