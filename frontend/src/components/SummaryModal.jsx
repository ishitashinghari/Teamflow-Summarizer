import React from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';

export default function SummaryModal({ isOpen, onClose, summary, count, loading, onRegenerate }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-scale-in">
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.badge}>
              <Sparkles size={18} color="#FFF" />
            </div>
            <div>
              <h2 style={styles.title}>AI Conversation Digest</h2>
              <p style={styles.subtitle}>
                {count > 0 ? `Synthesized from ${count} missed messages` : 'Synthesized channel summary'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Digest Content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} className="spin-animation" />
              <p style={styles.loadingTitle}>Analyzing dialogue context...</p>
              <p style={styles.loadingSub}>Extracting key decisions, updates, and pending action items.</p>
            </div>
          ) : (
            <div style={styles.markdownContainer}>
              {summary ? (
                summary.split('\n').map((line, idx) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={idx} style={styles.mdHeading}>{line.replace(/\*\*/g, '')}</h4>;
                  }
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return (
                      <div key={idx} style={styles.mdBullet}>
                        <span style={styles.bulletDot}>•</span>
                        <span>{line.substring(2)}</span>
                      </div>
                    );
                  }
                  return line.trim() ? <p key={idx} style={styles.mdParagraph}>{line}</p> : null;
                })
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  No messages to summarize yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onRegenerate} disabled={loading} style={styles.regenBtn}>
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Regenerate Summary</span>
          </button>
          <button onClick={onClose} style={styles.doneBtn}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '580px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  header: {
    padding: '18px 22px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-surface)',
  },
  badge: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    background: 'var(--ai-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow)',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '1px',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: '6px',
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  spinner: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--primary)',
    marginBottom: '16px',
  },
  loadingTitle: {
    color: 'var(--text-primary)',
    fontSize: '14.5px',
    fontWeight: '600',
  },
  loadingSub: {
    color: 'var(--text-muted)',
    fontSize: '12.5px',
    marginTop: '4px',
  },
  markdownContainer: {
    lineHeight: '1.6',
    fontSize: '13.5px',
  },
  mdHeading: {
    color: 'var(--primary)',
    fontSize: '13px',
    fontWeight: '700',
    marginTop: '16px',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  mdParagraph: {
    marginBottom: '10px',
    color: 'var(--text-primary)',
  },
  mdBullet: {
    display: 'flex',
    gap: '8px',
    marginBottom: '6px',
    color: 'var(--text-primary)',
    alignItems: 'flex-start',
  },
  bulletDot: {
    color: 'var(--primary)',
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '1',
  },
  footer: {
    padding: '14px 22px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-card)',
  },
  regenBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-secondary)',
    fontSize: '12.5px',
    fontWeight: '500',
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface)',
  },
  doneBtn: {
    padding: '8px 22px',
    background: 'var(--primary-gradient)',
    color: '#FFF',
    borderRadius: '9px',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: 'var(--shadow-sm)',
  },
};