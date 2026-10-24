import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { groupAPI } from '../services/api';
import { Users, Crown, Shield, UserMinus, X, Copy, Check, Camera, Trash2, LogOut } from 'lucide-react';

export default function GroupMembersDrawer({ group, isOpen, onClose, onMemberRemoved, onGroupUpdated }) {
  const { onlineUsers } = useSocket();
  const { mongoUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(group?.name || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Reset the edit form whenever a different group is opened or the saved data changes
  useEffect(() => {
    setName(group?.name || '');
    setFile(null);
    setPreview('');
    setRemoveImage(false);
  }, [group?._id, group?.name, group?.groupImage]);

  if (!isOpen || !group) return null;

  const isOwner = group.owner?._id === mongoUser?._id;
  const isAdmin = isOwner || group.admins?.some((a) => a._id === mongoUser?._id || a === mongoUser?._id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentImage = removeImage ? '' : preview || group.groupImage;
  const hasChanges = name.trim() !== group.name || !!file || removeImage;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setRemoveImage(false);
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreview('');
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Group name cannot be empty');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (file) formData.append('file', file);
      if (removeImage) formData.append('removeImage', 'true');
      await groupAPI.updateGroup(group._id, formData);
      if (onGroupUpdated) onGroupUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    const warning = isOwner
      ? 'You are the owner. Leaving will transfer ownership to another member. Leave this group?'
      : 'Leave this group?';
    if (!window.confirm(warning)) return;
    try {
      await groupAPI.leaveGroup(group._id);
      onClose();
      if (onGroupUpdated) onGroupUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member from the team channel?')) return;
    try {
      await groupAPI.removeMember(group._id, userId);
      if (onMemberRemoved) onMemberRemoved(group._id, userId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div style={styles.container} className="animate-slide-right">
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={styles.headerBadge}>
            <Users size={16} color="var(--primary)" />
          </div>
          <h3 style={styles.title}>Channel Roster</h3>
        </div>
        <button onClick={onClose} style={styles.closeBtn} title="Close">
          <X size={18} />
        </button>
      </div>

      {/* Group Settings (admins only) */}
      {isAdmin && (
        <div style={styles.settingsSection}>
          <span style={styles.inviteLabel}>GROUP SETTINGS</span>
          <div style={styles.settingsRow}>
            <div style={styles.groupImgWrapper} onClick={() => fileInputRef.current?.click()} title="Change group photo">
              <img
                src={currentImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Group')}`}
                alt={group.name}
                style={styles.groupImg}
              />
              <div style={styles.groupImgOverlay}>
                <Camera size={16} color="#FFF" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="Group name"
                style={styles.nameInput}
              />
              {currentImage && (
                <button type="button" onClick={handleRemovePhoto} style={styles.removePhotoBtn}>
                  <Trash2 size={12} /> Remove photo
                </button>
              )}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || !hasChanges} style={{ ...styles.saveBtn, opacity: saving || !hasChanges ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Invite Code Box */}
      <div style={styles.inviteSection}>
        <span style={styles.inviteLabel}>INVITE CODE</span>
        <div style={styles.inviteBox}>
          <span style={styles.code}>{group.inviteCode}</span>
          <button onClick={handleCopyCode} style={styles.copyBtn} title="Copy invite code">
            {copied ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-online)', fontSize: '11px', fontWeight: '700' }}>
                <Check size={13} /> Copied
              </span>
            ) : (
              <Copy size={14} color="var(--text-secondary)" />
            )}
          </button>
        </div>
      </div>

      {/* Member Roster */}
      <div style={styles.memberList}>
        <div style={styles.listHeaderRow}>
          <span style={styles.listHeader}>MEMBERS ({group.members?.length || 0})</span>
        </div>

        {group.members?.map((m) => {
          const isOnline = onlineUsers.includes(m._id);
          const isMemberOwner = group.owner?._id === m._id;

          return (
            <div key={m._id} style={styles.memberRow}>
              <div style={styles.avatarWrapper}>
                <img
                  src={m.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name || 'User')}`}
                  alt={m.name}
                  style={styles.avatar}
                />
                <span
                  style={{
                    ...styles.presenceDot,
                    backgroundColor: isOnline ? 'var(--accent-online)' : 'var(--text-muted)',
                  }}
                />
              </div>

              <div style={styles.memberInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={styles.memberName}>{m.name}</span>
                  {isMemberOwner && <Crown size={13} color="#F59E0B" title="Channel Owner" />}
                </div>
                <span style={styles.memberMeta}>@{m.username}</span>
              </div>

              {isAdmin && !isMemberOwner && m._id !== mongoUser?._id && (
                <button
                  onClick={() => handleRemove(m._id)}
                  title="Remove Member"
                  style={styles.removeBtn}
                >
                  <UserMinus size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={handleLeave} style={styles.leaveBtn}>
          <LogOut size={15} /> Leave Group
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '330px',
    backgroundColor: 'var(--bg-surface)',
    borderLeft: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 85,
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBadge: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
  },
  settingsSection: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  settingsRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  groupImgWrapper: {
    position: 'relative',
    width: '48px',
    height: '48px',
    flexShrink: 0,
    cursor: 'pointer',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid var(--primary)',
  },
  groupImg: { width: '100%', height: '100%', objectFit: 'cover' },
  groupImgOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '9px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
  },
  removePhotoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--accent-danger)',
  },
  saveBtn: {
    padding: '8px 14px',
    background: 'var(--primary-gradient)',
    color: '#FFF',
    borderRadius: '9px',
    fontWeight: '600',
    fontSize: '12.5px',
  },
  footer: {
    padding: '14px 20px',
    borderTop: '1px solid var(--border-color)',
  },
  leaveBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '9px',
    borderRadius: '9px',
    border: '1px solid var(--accent-danger)',
    color: 'var(--accent-danger)',
    fontWeight: '600',
    fontSize: '13px',
  },
  inviteSection: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
  },
  inviteLabel: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.6px',
  },
  inviteBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '9px',
    padding: '8px 12px',
    marginTop: '6px',
  },
  code: {
    fontSize: '13.5px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '1px',
    color: 'var(--primary)',
  },
  copyBtn: {
    padding: '4px 6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
  },
  listHeader: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.6px',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 4px',
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  presenceDot: {
    position: 'absolute',
    bottom: '-1px',
    right: '-1px',
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    border: '2px solid var(--bg-surface)',
  },
  memberInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  memberName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  memberMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
  },
  removeBtn: {
    color: 'var(--accent-danger)',
    padding: '6px',
    borderRadius: '6px',
    opacity: 0.8,
  },
};