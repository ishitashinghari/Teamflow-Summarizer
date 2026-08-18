import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { X, Check, Mail, Calendar, Camera, User } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { mongoUser, refreshProfile } = useAuth();
  const [name, setName] = useState(mongoUser?.name || '');
  const [statusMessage, setStatusMessage] = useState(mongoUser?.statusMessage || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen || !mongoUser) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('statusMessage', statusMessage);
      if (file) formData.append('file', file);

      await userAPI.updateProfile(formData);
      await refreshProfile();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-scale-in">
        <div style={styles.header}>
          <h2 style={styles.title}>Workspace Profile</h2>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        <div style={styles.avatarSection}>
          <div
            style={styles.avatarWrapper}
            onClick={() => fileInputRef.current?.click()}
            title="Change Profile Picture"
          >
            <img
              src={
                preview ||
                mongoUser.profilePicture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mongoUser.name)}`
              }
              alt={mongoUser.name}
              style={styles.avatar}
            />
            <div style={styles.avatarOverlay}>
              <Camera size={20} color="#FFF" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <h3 style={styles.name}>{mongoUser.name}</h3>
            <span style={styles.username}>@{mongoUser.username}</span>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Status Tagline</label>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="e.g. Focus Mode 🎧"
              style={styles.input}
            />
          </div>

          <div style={styles.metaBox}>
            <div style={styles.metaRow}>
              <Mail size={14} color="var(--text-muted)" />
              <span style={styles.metaText}>{mongoUser.email}</span>
            </div>
            <div style={styles.metaRow}>
              <Calendar size={14} color="var(--text-muted)" />
              <span style={styles.metaText}>
                Joined {new Date(mongoUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {saved ? (
                <>
                  <Check size={15} /> Saved!
                </>
              ) : loading ? (
                'Saving...'
              ) : (
                'Save Changes'
              )}
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
    maxWidth: '430px',
    padding: '24px',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  title: { fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { color: 'var(--text-muted)', padding: '4px' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' },
  avatarWrapper: {
    position: 'relative',
    width: '74px',
    height: '74px',
    cursor: 'pointer',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid var(--primary)',
    boxShadow: 'var(--shadow-glow)',
  },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
  name: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
  username: { fontSize: '12px', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' },
  input: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '9px',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    outline: 'none',
  },
  metaBox: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: '1px solid var(--border-color)',
  },
  metaRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  metaText: { fontSize: '12px', color: 'var(--text-secondary)' },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: '6px' },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    background: 'var(--primary-gradient)',
    color: '#FFF',
    borderRadius: '9px',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: 'var(--shadow-sm)',
  },
};