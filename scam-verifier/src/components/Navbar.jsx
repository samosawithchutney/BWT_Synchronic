import { motion } from 'framer-motion'

export default function Navbar({ onAnalyze }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid #1e1e1e',
        background: 'rgba(8,8,8,0.9)',
        backdropFilter: 'blur(12px)',
        padding: '0 32px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'Sora, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
            stroke="#e63946" strokeWidth="1.5" fill="none" />
          <path d="M9 12l2 2 4-4" stroke="#e63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ color: '#f5f0e8', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em' }}>
          CAMPUSGUARD
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {['How it works', 'Features', 'Extension'].map(item => (
          <a key={item} href={'#' + item.toLowerCase().replace(' ', '-')}
            style={{ color: '#9a9489', fontSize: 12, textDecoration: 'none', letterSpacing: '0.04em' }}>
            {item}
          </a>
        ))}
      </div>

      <button
        onClick={onAnalyze}
        style={{
          background: '#e63946', color: '#f5f0e8',
          border: 'none', borderRadius: 6,
          padding: '8px 20px', fontSize: 12,
          fontFamily: 'Sora, sans-serif',
          fontWeight: 500, letterSpacing: '0.04em',
          cursor: 'pointer',
        }}
      >
        Verify Now
      </button>
    </motion.nav>
  )
}
