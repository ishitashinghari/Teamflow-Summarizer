import React, { useState } from 'react';
import { messageAPI } from '../services/api';
import { Search, X, MessageSquare, Clock } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, groupId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await messageAPI.searchMessages(groupId, query);
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-scale-in">
        <div style={styles.header}>
          <div style={styles.searchBar}>
            <Search size={17} color="var(--text-muted)" />
            <input
              type="text"
              autoFocus
              placeholder="Search conversation records..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              style={styles.input}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); }} style={styles.clearBtn}>
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        <div style={styles.resultsList}>
          {loading ? (
            <div style={styles.emptyState}>
              <p style={styles.statusText}>Searching channel logs...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((m) => (
              <div key={m._id} style={styles.resultItem}>
                <div style={styles.meta}>
                  <span style={styles.sender}>{m.sender?.name}</span>
                  <div style={styles.dateBadge}>
                    <Clock size={11} color="var(--text-muted)" />
                    <span style={styles.date}>
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p style={styles.text}>{m.text}</p>
              </div>
            ))
          ) : query && !loading ? (
            <div style={styles.emptyState}>
              <MessageSquare size={32} color="var(--text-muted)" />
              <p style={styles.statusText}>No matching messages found for "{query}"</p>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Search size={32} color="var(--text-muted)" />
              <p style={styles.statusText}>Type a keyword and press Enter to search</p>
            </div>
          )}
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
    zIndex: 105,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '560px',
    height: '480px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 18px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-input)',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    outline: 'none',
  },
  clearBtn: {
    color: 'var(--text-muted)',
    padding: '2px',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
  },
  resultsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  resultItem: {
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  sender: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  date: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  text: {
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    lineHeight: '1.45',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '10px',
  },
  statusText: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
};