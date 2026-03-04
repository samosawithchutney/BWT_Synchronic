export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1e1e1e', padding: '40px 64px', maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#e63946" strokeWidth="1.5" fill="none" /><path d="M9 12l2 2 4-4" stroke="#e63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span style={{ fontFamily: 'Sora,sans-serif', fontSize: 12, color: '#9a9489', letterSpacing: '0.04em' }}>CampusGuard</span>
      </div>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 13, color: '#2a2a2a', fontStyle: 'italic', textAlign: 'center' }}>
        Built for the people who ask "Is this real?" — and deserve a real answer.
      </div>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 11, color: '#2a2a2a', letterSpacing: '0.04em' }}>
        Hackathon 2026 · PS-A
      </div>
    </footer>
  )
}
