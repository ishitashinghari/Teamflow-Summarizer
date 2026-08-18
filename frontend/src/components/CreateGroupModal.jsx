import React, { useState } from 'react';
import { groupAPI } from '../services/api';
import { X, Users, Sparkles, Hash } from 'lucide-react';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupImage, setGroupImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await groupAPI.createGroup({
        name,
        description,
        groupImage: groupImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      });
      onGroupCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
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
              <Users size={18} color="var(--primary)" />
            </div>
            <div>
              <h2 style={styles.title}>Create Team Channel</h2>
              <span style={styles.subtitle}>Set up a new space for collaboration</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Channel Name</label>
            <div style={styles.nameInputWrapper}>
              <Hash size={16} style={styles.hashIcon} />
              <input
                type="text"
                required
                placeholder="e.g. frontend-platform"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.nameInput}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Purpose / Topic (Optional)</label>
            <textarea
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Channel Icon / Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={groupImage}
              onChange={(e) => setGroupImage(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Creating...' : 'Create Channel'}
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
    maxWidth: '460px',
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
    gap: '16px',
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
  nameInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  hashIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  nameInput: {
    width: '100%',
    padding: '10px 12px 10px 34px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    outline: 'none',
    minHeight: '75px',
    resize: 'vertical',
  },
  input: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    outline: 'none',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px',
  },
  cancelBtn: {
    padding: '9px 16px',
    color: 'var(--text-secondary)',
    borderRadius: '9px',
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