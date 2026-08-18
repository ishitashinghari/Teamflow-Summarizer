import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import EmojiPicker from 'emoji-picker-react';
import { Bot, Send, Trash2, X, Sparkles, Smile, MessageSquareQuote } from 'lucide-react';

const SUGGESTIONS = [
  'Draft a channel sprint update',
  'Summarize today’s blockers',
  'Explain API rate limiting architecture',
];

export default function AIChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey there! I am your TeamFlow AI Copilot. Need help drafting updates, brainstorming solutions, or summarizing discussions?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e, customText) => {
    e?.preventDefault();
    const query = (customText || input).trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setShowEmoji(false);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiAPI.chatWithBot(historyPayload, userMessage.content);
      setMessages([...newHistory, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([
        ...newHistory,
        { role: 'assistant', content: '⚠️ AI Service Error: Unable to complete your request right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation history cleared. What else can I assist with today?',
      },
    ]);
  };

  return (
    <div style={styles.container} className="animate-slide-right">
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={styles.botIcon}>
            <Bot size={18} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={styles.title}>TeamFlow AI Copilot</h3>
              <Sparkles size={13} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={styles.statusDot} />
              <span style={styles.status}>Standalone Assistant</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleClear} title="Clear Context" style={styles.actionBtn}>
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} title="Close" style={styles.actionBtn}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={{
                ...styles.bubbleWrapper,
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
              className="animate-fade-in"
            >
              {!isUser && (
                <div style={styles.avatarBot}>
                  <Sparkles size={13} color="#FFF" />
                </div>
              )}
              <div
                style={{
                  ...styles.bubble,
                  background: isUser ? 'var(--bubble-me)' : 'var(--bg-card)',
                  color: isUser ? '#FFF' : 'var(--text-primary)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={styles.bubbleWrapper} className="animate-fade-in">
            <div style={styles.avatarBot}>
              <Sparkles size={13} color="#FFF" />
            </div>
            <div style={{ ...styles.bubble, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={styles.thinkingWrapper}>
                <span style={styles.thinkingDot} />
                <span style={{ ...styles.thinkingDot, animationDelay: '0.2s' }} />
                <span style={{ ...styles.thinkingDot, animationDelay: '0.4s' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggestion Starter Chips */}
        {messages.length === 1 && !loading && (
          <div style={styles.suggestionsContainer}>
            <span style={styles.suggestionHeader}>Suggested prompts:</span>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={(e) => handleSend(e, s)} style={styles.suggestionChip}>
                <MessageSquareQuote size={13} color="var(--primary)" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        {/* Emoji Button & Picker */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            style={{
              ...styles.iconBtn,
              color: showEmoji ? 'var(--primary)' : 'var(--text-muted)',
            }}
            title="Emoji"
          >
            <Smile size={18} />
          </button>

          {showEmoji && (
            <div style={styles.emojiPickerBox} className="animate-scale-in">
              <EmojiPicker
                theme="auto"
                width={300}
                height={350}
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
          placeholder="Ask TeamFlow AI Copilot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || loading ? 0.45 : 1,
          }}
          title="Send"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '390px',
    backgroundColor: 'var(--bg-surface)',
    borderLeft: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 90,
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-surface)',
  },
  botIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--ai-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow)',
  },
  title: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-online)',
  },
  status: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  actionBtn: {
    color: 'var(--text-muted)',
    padding: '6px',
    borderRadius: '8px',
  },
  chatArea: {
    flex: 1,
    padding: '18px 16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bubbleWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  avatarBot: {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    background: 'var(--ai-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  bubble: {
    padding: '10px 14px',
    fontSize: '13.5px',
    lineHeight: '1.5',
    maxWidth: '84%',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxShadow: 'var(--shadow-sm)',
  },
  thinkingWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  thinkingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    animation: 'bounceDots 1.4s infinite',
  },
  suggestionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
  },
  suggestionHeader: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginLeft: '4px',
  },
  suggestionChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '12.5px',
    textAlign: 'left',
    transition: 'all 0.18s ease',
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-main)',
  },
  iconBtn: {
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPickerBox: {
    position: 'absolute',
    bottom: '44px',
    left: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-lg)',
  },
  input: {
    flex: 1,
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '9px 12px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    resize: 'none',
    outline: 'none',
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
  },
};