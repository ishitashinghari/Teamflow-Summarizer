import React, { useState } from 'react';
import { FileText, Download, Edit2, Trash2, Check, X, Ban } from 'lucide-react';

export default function MessageItem({ message, isMe, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');

  if (message.messageType === 'system') {
    return (
      <div style={styles.systemMessage}>
        <div style={styles.systemDivider} />
        <span style={styles.systemText}>{message.text}</span>
        <div style={styles.systemDivider} />
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onEdit(message._id, editText);
    setEditing(false);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        ...styles.wrapper,
        justifyContent: isMe ? 'flex-end' : 'flex-start',
      }}
      className="message-row"
    >
      {!isMe && (
        <img
          src={
            message.sender?.profilePicture ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(message.sender?.name || 'User')}`
          }
          alt={message.sender?.name}
          style={styles.avatar}
        />
      )}

      <div style={{ ...styles.bubbleContainer, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        {!isMe && <span style={styles.senderName}>{message.sender?.name}</span>}

        <div
          style={{
            ...styles.bubble,
            background: isMe ? 'var(--bubble-me)' : 'var(--bubble-them)',
            color: isMe ? 'var(--bubble-me-text)' : 'var(--bubble-them-text)',
            border: isMe ? 'none' : '1px solid var(--border-color)',
            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          }}
        >
          {/* Deleted State */}
          {message.isDeleted ? (
            <div style={styles.deletedRow}>
              <Ban size={14} color="var(--text-muted)" />
              <span style={styles.deletedText}>This message was deleted</span>
            </div>
          ) : editing ? (
            <div style={styles.editBox}>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={styles.editInput}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditing(false);
                }}
              />
              <div style={styles.editControls}>
                <button onClick={handleSaveEdit} style={styles.saveEditBtn} title="Save">
                  <Check size={13} color="#FFF" />
                </button>
                <button onClick={() => setEditing(false)} style={styles.cancelEditBtn} title="Cancel">
                  <X size={13} color="#FFF" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              {message.messageType === 'image' && (
                <div style={styles.mediaContainer}>
                  <img src={message.fileUrl} alt={message.fileName} style={styles.imagePreview} />
                </div>
              )}

              {/* Video Player */}
              {message.messageType === 'video' && (
                <div style={styles.mediaContainer}>
                  <video src={message.fileUrl} controls style={styles.videoPlayer} />
                </div>
              )}

              {/* Document File Card */}
              {message.messageType === 'document' && (
                <div
                  style={{
                    ...styles.docBox,
                    backgroundColor: isMe ? 'rgba(0,0,0,0.15)' : 'var(--bg-input)',
                  }}
                >
                  <div style={styles.docIconWrapper}>
                    <FileText size={20} color={isMe ? '#FFF' : 'var(--primary)'} />
                  </div>
                  <div style={styles.docInfo}>
                    <span style={{ ...styles.docName, color: isMe ? '#FFF' : 'var(--text-primary)' }}>
                      {message.fileName || 'Attached Document'}
                    </span>
                    <span style={{ ...styles.docSize, color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                      {message.fileSize ? `${(message.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'File'}
                    </span>
                  </div>
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    style={{ ...styles.downloadLink, color: isMe ? '#FFF' : 'var(--primary)' }}
                    title="Download File"
                  >
                    <Download size={16} />
                  </a>
                </div>
              )}

              {/* Text Message */}
              {message.text && <p style={styles.messageText}>{message.text}</p>}
            </>
          )}

          {/* Timestamp & Edited Indicator */}
          {!message.isDeleted && (
            <div style={styles.metaRow}>
              {message.isEdited && <span style={styles.editedLabel}>edited</span>}
              <span style={styles.timestamp}>{formattedTime}</span>
            </div>
          )}
        </div>

        {/* Floating Action Controls on Hover */}
        {isMe && !message.isDeleted && !editing && (
          <div style={styles.actionsOverlay}>
            <button onClick={() => setEditing(true)} title="Edit Message" style={styles.actionBtn}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => onDelete(message._id)} title="Delete Message" style={styles.actionBtn}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    gap: '10px',
    margin: '10px 0',
    position: 'relative',
  },
  systemMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '16px 0',
    gap: '12px',
  },
  systemDivider: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--border-color)',
  },
  systemText: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 12px',
    borderRadius: '999px',
    border: '1px solid var(--border-color)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    objectFit: 'cover',
    marginTop: '2px',
    flexShrink: 0,
  },
  bubbleContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '68%',
    position: 'relative',
  },
  senderName: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: 'var(--primary)',
    marginBottom: '4px',
    marginLeft: '2px',
  },
  bubble: {
    padding: '10px 14px',
    boxShadow: 'var(--shadow-sm)',
    wordBreak: 'break-word',
    position: 'relative',
  },
  messageText: {
    fontSize: '13.5px',
    lineHeight: '1.45',
    whiteSpace: 'pre-wrap',
  },
  deletedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  deletedText: {
    fontSize: '12.5px',
    fontStyle: 'italic',
    color: 'var(--text-muted)',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    marginTop: '4px',
  },
  editedLabel: {
    fontSize: '10px',
    opacity: 0.75,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: '10px',
    opacity: 0.75,
  },
  mediaContainer: {
    marginBottom: '6px',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '320px',
    borderRadius: '10px',
    objectFit: 'cover',
    display: 'block',
  },
  videoPlayer: {
    maxWidth: '100%',
    maxHeight: '280px',
    borderRadius: '10px',
  },
  docBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '10px',
    marginBottom: '6px',
    border: '1px solid var(--border-color)',
  },
  docIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  docName: {
    fontSize: '12.5px',
    fontWeight: '600',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  docSize: {
    fontSize: '10.5px',
  },
  downloadLink: {
    marginLeft: 'auto',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  editInput: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 10px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    minWidth: '180px',
  },
  editControls: {
    display: 'flex',
    gap: '4px',
  },
  saveEditBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: '#10B981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: '#EF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsOverlay: {
    display: 'flex',
    gap: '4px',
    marginTop: '3px',
    opacity: 0.8,
  },
  actionBtn: {
    color: 'var(--text-muted)',
    padding: '3px 6px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
  },
};