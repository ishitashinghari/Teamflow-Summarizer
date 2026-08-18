import React, { useState } from 'react';
import { groupAPI } from '../services/api';
import { X, KeyRound } from 'lucide-react';

export default function JoinGroupModal({ isOpen, onClose, onGroupJoined }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await groupAPI.joinGroup(inviteCode);
      onGroupJoined(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code or already a member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-scale-in">
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconBadge}>
              <KeyRound size={18} color="var(--primary)" />
            </div>
            <div>
              <h2 style={styles.title}>Join Channel</h2>
              <span style={styles.subtitle}>Enter the channel invite code</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleJoin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Invite Code</label>
            <input
              type="text"
              required
              placeholder="e.g. TF-7X92K"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Validating...' : 'Join Workspace'}
            </button>
          </div>
        </form>
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
    zIndex: 100,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  iconBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
  },
  errorBox: {
    fontSize: '13px',
    color: 'var(--accent-danger)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--accent-danger)',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--primary)',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelBtn: {
    padding: '9px 16px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  submitBtn: {
    padding: '9px 20px',
    background: 'var(--primary-gradient)',
    color: '#FFF',
    borderRadius: '9px',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: 'var(--shadow-sm)',
  },
};