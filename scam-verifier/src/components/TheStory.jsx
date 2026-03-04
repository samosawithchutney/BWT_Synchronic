export default function TheStory() {
    return (
        <section style={{ padding: '80px 64px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 64 }}>
                <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>

                    <span style={{
                        display: 'inline-block', border: '1px solid #1e1e1e',
                        borderRadius: 999, padding: '4px 14px', fontSize: 11,
                        color: '#9a9489', fontFamily: 'Sora, sans-serif',
                        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28
                    }}>
                        Why We Built This
                    </span>

                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(26px, 3vw, 38px)',
                        fontWeight: 700, color: '#f5f0e8',
                        lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 28
                    }}>
                        This scam already happened.<br />
                        <em style={{ fontStyle: 'italic', color: '#e63946' }}>At our college.</em>
                    </h2>

                    <p style={{
                        fontFamily: 'Sora, sans-serif', fontSize: 15,
                        lineHeight: 1.85, color: '#9a9489', marginBottom: 20
                    }}>
                        In our first semester, a stranger added our entire batch to a WhatsApp group called
                        <span style={{ color: '#f5f0e8', fontWeight: 500 }}> "Google Internship 2025"</span>.
                        Our friends were already in it. It looked real. A Google Form was shared.
                        The internship was free — but there was a ₹999 registration fee to secure your slot.
                        The admin kept sending messages: <span style={{ color: '#f4a261' }}>"Only 3 slots left."</span> Students paid.
                        The group went silent the next morning.
                    </p>

                    <p style={{
                        fontFamily: 'Sora, sans-serif', fontSize: 15,
                        lineHeight: 1.85, color: '#9a9489', marginBottom: 36
                    }}>
                        No existing tool caught it. Not because the technology didn't exist —
                        but because no one had trained it on the specific way scammers target Indian college students.
                        So we did.
                    </p>

                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'rgba(230,57,70,0.07)',
                        border: '1px solid rgba(230,57,70,0.2)',
                        borderRadius: 10, padding: '14px 24px',
                        fontFamily: 'Sora, sans-serif', fontSize: 13, color: '#f5f0e8'
                    }}>
                        <span style={{ fontSize: 18 }}>🛡️</span>
                        <span>CampusGuard is built on the attacks our campus already survived.</span>
                    </div>

                </div>
            </div>
        </section>
    )
}
