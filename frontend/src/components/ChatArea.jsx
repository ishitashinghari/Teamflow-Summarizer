import React, { useState, useEffect, useRef } from 'react';
import { messageAPI, aiAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageItem from './MessageItem';
import SummaryModal from './SummaryModal';
import SearchModal from './SearchModal';
import EmojiPicker from 'emoji-picker-react';
import GroupMembersDrawer from './GroupMembersDrawer';
import {
  Sparkles,
  Paperclip,
  Send,
  Search,
  Users,
  Smile,
  X,
  FileText,
  Hash,
  MessageSquarePlus,
} from 'lucide-react';

export default function ChatArea({ activeGroup, onGroupUpdated }) {
  const { socket } = useSocket();
  const { mongoUser } = useAuth();
  const [showEmoji, setShowEmoji] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [fileAttachment, setFileAttachment] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Modal / Drawer states
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState({ text: '', count: 0, loading: false });
  const [searchOpen, setSearchOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch Message Logs & Subscribe to Room
  useEffect(() => {
    if (!activeGroup) return;

    let isMounted = true;
    setLoading(true);

    messageAPI.getMessages(activeGroup._id).then((res) => {
      if (!isMounted) return;
      setMessages(res.data.data);
      setLoading(false);
      messageAPI.markAsRead(activeGroup._id);
    });

    if (socket) {
      socket.emit('group:join', activeGroup._id);

      const handleMsgReceived = (newMsg) => {
        if (newMsg.group === activeGroup._id) {
          setMessages((prev) => [...prev, newMsg]);
          messageAPI.markAsRead(activeGroup._id);
        }
      };

      const handleMsgUpdated = (updatedMsg) => {
        if (updatedMsg.group === activeGroup._id) {
          setMessages((prev) => prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)));
        }
      };

      const handleMsgRemoved = (removedMsg) => {
        if (removedMsg.group === activeGroup._id) {
          setMessages((prev) => prev.map((m) => (m._id === removedMsg._id ? removedMsg : m)));
        }
      };

      const handleTyping = ({ groupId, userId, name, isTyping }) => {
        if (groupId === activeGroup._id && userId !== mongoUser?._id) {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            if (isTyping) next.set(userId, name);
            else next.delete(userId);
            return next;
          });
        }
      };

      socket.on('message:received', handleMsgReceived);
      socket.on('message:updated', handleMsgUpdated);
      socket.on('message:removed', handleMsgRemoved);
      socket.on('typing:indicator', handleTyping);

      return () => {
        isMounted = false;
        socket.emit('group:leave', activeGroup._id);
        socket.off('message:received', handleMsgReceived);
        socket.off('message:updated', handleMsgUpdated);
        socket.off('message:removed', handleMsgRemoved);
        socket.off('typing:indicator', handleTyping);
      };
    }
  }, [activeGroup, socket, mongoUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileAttachment(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview('');
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() && !fileAttachment) return;

    const formData = new FormData();
    formData.append('groupId', activeGroup._id);
    if (input.trim()) formData.append('text', input.trim());
    if (fileAttachment) formData.append('file', fileAttachment);

    // Clear UI inputs immediately
    setInput('');
    setFileAttachment(null);
    setFilePreview('');
    setShowEmoji(false);

    try {
      const res = await messageAPI.sendMessage(formData);
      const savedMsg = res.data.data;
      setMessages((prev) => [...prev, savedMsg]);
      if (socket) socket.emit('message:send', savedMsg);
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTypingEvent = (e) => {
    setInput(e.target.value);
    if (!socket) return;

    socket.emit('typing:start', {
      groupId: activeGroup._id,
      username: mongoUser?.username,
      name: mongoUser?.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { groupId: activeGroup._id });
    }, 1500);
  };

  const handleSummarize = async () => {
    setSummaryOpen(true);
    setSummaryData({ text: '', count: 0, loading: true });

    try {
      const res = await aiAPI.summarizeUnread(activeGroup._id, activeGroup.unreadCount);
      setSummaryData({
        text: res.data.summary,
        count: res.data.count,
        loading: false,
      });
    } catch (err) {
      setSummaryData({
        text: 'Failed to generate summary: ' + (err.response?.data?.message || err.message),
        count: 0,
        loading: false,
      });
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    try {
      const res = await messageAPI.editMessage(messageId, newText);
      const updated = res.data.data;
      setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      if (socket) socket.emit('message:edited', updated);
    } catch (err) {
      alert('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await messageAPI.deleteMessage(messageId);
      const deleted = res.data.data;
      setMessages((prev) => prev.map((m) => (m._id === deleted._id ? deleted : m)));
      if (socket) socket.emit('message:deleted', deleted);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  if (!activeGroup) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIllustration}>
          <Sparkles size={40} color="var(--primary)" />
        </div>
        <h2 style={styles.emptyTitle}>Welcome to TeamFlow AI</h2>
        <p style={styles.emptySubtitle}>
          Select a channel from the sidebar or launch a new team workspace to start collaborating.
        </p>
      </div>
    );
  }

  // Format typing indicator
  const typingNames = Array.from(typingUsers.values());
  let typingLabel = '';
  if (typingNames.length === 1) typingLabel = `${typingNames[0]} is typing...`;
  else if (typingNames.length === 2) typingLabel = `${typingNames[0]} and ${typingNames[1]} are typing...`;
  else if (typingNames.length > 2) typingLabel = `Multiple teammates are typing...`;

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={styles.channelAvatar}>
            {activeGroup.groupImage ? (
              <img src={activeGroup.groupImage} alt="" style={styles.avatarImg} />
            ) : (
              <Hash size={18} color="var(--primary)" />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={styles.channelTitle}>{activeGroup.name}</h2>
              <span style={styles.memberBadge}>{activeGroup.members?.length || 0} members</span>
            </div>
            <span style={styles.channelDesc}>
              {activeGroup.description || 'Welcome to the channel discussion.'}
            </span>
          </div>
        </div>

        <div style={styles.headerRight}>
          {/* AI Summarize Action Trigger */}
          <button onClick={handleSummarize} style={styles.summarizeBtn} title="Generate AI Digest of unread messages">
            <Sparkles size={14} color="#FFF" />
            <span>AI Summarize</span>
          </button>

          <button onClick={() => setSearchOpen(true)} title="Search Channel Messages" style={styles.iconBtn}>
            <Search size={17} />
          </button>

          <button onClick={() => setRosterOpen(true)} title="Channel Members & Invite" style={styles.iconBtn}>
            <Users size={17} />
          </button>
        </div>
      </div>

      {/* Message Timeline */}
      <div style={styles.messageFeed}>
        {loading ? (
          <div style={styles.loadingFeed}>
            <div style={styles.loadingSpinner} className="spin-animation" />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>
              Loading conversation history...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyFeed}>
            <div style={styles.emptyFeedBadge}>
              <MessageSquarePlus size={24} color="var(--primary)" />
            </div>
            <p style={styles.emptyFeedTitle}>This is the start of #{activeGroup.name}</p>
            <p style={styles.emptyFeedSubtitle}>
              Be the first to say hello, ask a question, or share an update with the team.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageItem
              key={m._id}
              message={m}
              isMe={m.sender?._id === mongoUser?._id}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Bar */}
      {typingLabel && (
        <div style={styles.typingNotice} className="animate-fade-in">
          <div style={styles.typingDotsWrapper}>
            <span style={{ ...styles.typingDot, animation: 'bounceDots 1.4s infinite 0s' }} />
            <span style={{ ...styles.typingDot, animation: 'bounceDots 1.4s infinite 0.2s' }} />
            <span style={{ ...styles.typingDot, animation: 'bounceDots 1.4s infinite 0.4s' }} />
          </div>
          <span style={styles.typingText}>{typingLabel}</span>
        </div>
      )}

      {/* Attachment Staging Preview */}
      {fileAttachment && (
        <div style={styles.attachmentStaging} className="animate-fade-in">
          {filePreview ? (
            <img src={filePreview} alt="Preview" style={styles.stagedImg} />
          ) : (
            <div style={styles.stagedDoc}>
              <FileText size={18} color="var(--primary)" />
              <span style={styles.stagedName}>{fileAttachment.name}</span>
            </div>
          )}
          <button
            onClick={() => {
              setFileAttachment(null);
              setFilePreview('');
            }}
            style={styles.removeStagedBtn}
            title="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Input Composer */}
      <form onSubmit={handleSend} style={styles.composerWrapper}>
        <div style={styles.composer}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file or image"
            style={styles.attachBtn}
          >
            <Paperclip size={18} />
          </button>

          {/* Emoji Picker Overlay */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              title="Add Emoji"
              style={{
                ...styles.attachBtn,
                color: showEmoji ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              <Smile size={18} />
            </button>

            {showEmoji && (
              <div style={styles.emojiOverlay} className="animate-scale-in">
                <EmojiPicker
                  theme="auto"
                  width={320}
                  height={380}
                  onEmojiClick={(emojiObject) => {
                    setInput((prev) => prev + emojiObject.emoji);
                    setShowEmoji(false);
                  }}
                />
              </div>
            )}
          </div>

          <textarea
            rows={1}
            placeholder={`Message #${activeGroup.name}...`}
            value={input}
            onChange={handleTypingEvent}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={styles.inputArea}
          />

          <button
            type="submit"
            disabled={!input.trim() && !fileAttachment}
            style={{
              ...styles.sendBtn,
              opacity: !input.trim() && !fileAttachment ? 0.45 : 1,
              cursor: !input.trim() && !fileAttachment ? 'not-allowed' : 'pointer',
            }}
            title="Send message (Enter)"
          >
            <Send size={15} />
          </button>
        </div>
      </form>

      {/* Modals & Slide-outs */}
      <SummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        summary={summaryData.text}
        count={summaryData.count}
        loading={summaryData.loading}
        onRegenerate={handleSummarize}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        groupId={activeGroup._id}
      />

      <GroupMembersDrawer
        group={activeGroup}
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        onMemberRemoved={(groupId, userId) => {
          if (onGroupUpdated) onGroupUpdated();
        }}
      />
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-main)',
    height: '100vh',
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: 'var(--bg-main)',
    padding: '24px',
  },
  emptyIllustration: {
    width: '76px',
    height: '76px',
    borderRadius: '22px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    boxShadow: 'var(--shadow-glow)',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  emptySubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '13.5px',
    maxWidth: '420px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  header: {
    padding: '14px 24px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexShrink: 0,
  },
  channelAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  channelTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.2px',
  },
  memberBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-card)',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid var(--border-color)',
  },
  channelDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '460px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  summarizeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 13px',
    borderRadius: '9px',
    background: 'var(--ai-gradient)',
    color: '#FFF',
    fontSize: '12.5px',
    fontWeight: '600',
    boxShadow: 'var(--shadow-glow)',
  },
  iconBtn: {
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: '9px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageFeed: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
  },
  loadingFeed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  loadingSpinner: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--primary)',
  },
  emptyFeed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    gap: '8px',
    padding: '20px',
  },
  emptyFeedBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  emptyFeedTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  emptyFeedSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    maxWidth: '360px',
  },
  typingNotice: {
    padding: '4px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  typingDotsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  typingDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
  },
  typingText: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  attachmentStaging: {
    margin: '0 24px 8px 24px',
    padding: '6px 12px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    maxWidth: 'fit-content',
    boxShadow: 'var(--shadow-sm)',
  },
  stagedImg: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  stagedDoc: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stagedName: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  removeStagedBtn: {
    color: 'var(--text-muted)',
    padding: '3px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerWrapper: {
    padding: '0 24px 20px 24px',
  },
  composer: {
    padding: '7px 12px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: 'var(--shadow-md)',
  },
  attachBtn: {
    color: 'var(--text-muted)',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOverlay: {
    position: 'absolute',
    bottom: '48px',
    left: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-lg)',
  },
  inputArea: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    resize: 'none',
    outline: 'none',
    lineHeight: '1.4',
    maxHeight: '120px',
  },
  sendBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'var(--primary-gradient)',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)',
  },
};