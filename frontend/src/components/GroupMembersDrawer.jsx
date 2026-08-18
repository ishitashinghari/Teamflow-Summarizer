import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { groupAPI } from '../services/api';
import { Users, Crown, Shield, UserMinus, X, Copy, Check } from 'lucide-react';

export default function GroupMembersDrawer({ group, isOpen, onClose, onMemberRemoved }) {
  const { onlineUsers } = useSocket();
  const { mongoUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !group) return null;

  const isOwner = group.owner?._id === mongoUser?._id;
  const isAdmin = isOwner || group.admins?.some((a) => a._id === mongoUser?._id || a === mongoUser?._id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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