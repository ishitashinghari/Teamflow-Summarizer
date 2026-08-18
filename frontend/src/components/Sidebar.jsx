import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Plus,
  KeyRound,
  Bot,
  Palette,
  LogOut,
  Search,
  Sparkles,
  Hash,
  X,
} from 'lucide-react';
import ThemeSelector from './ThemeSelector';

export default function Sidebar({
  groups,
  activeGroup,
  onSelectGroup,
  onOpenCreateGroup,
  onOpenJoinGroup,
  onOpenAIChat,
  onOpenProfile,
}) {
  const { mongoUser, logoutUser } = useAuth();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoBadge}>
          <MessageSquare size={19} color="#FFF" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={styles.brandTitle}>TeamFlow AI</h1>
            <span style={styles.aiPill}>PRO</span>
          </div>
          <span style={styles.workspaceName}>Engineering Workspace</span>
        </div>
      </div>

      {/* Quick Action Controls */}
      <div style={styles.quickActions}>
        <button onClick={onOpenCreateGroup} style={styles.actionBtn} title="Create new team channel">
          <Plus size={15} />
          <span>New Channel</span>
        </button>
        <button onClick={onOpenJoinGroup} style={styles.actionBtnSecondary} title="Join channel with invite code">
          <KeyRound size={15} />
        </button>
      </div>

      {/* Channel Search / Filter */}
      <div style={styles.searchWrapper}>
        <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Filter channels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Channels Roster */}
      <div style={styles.channelList}>
        <div style={styles.sectionHeader}>
          <span>ACTIVE CHANNELS</span>
          <span style={styles.counter}>{filteredGroups.length}</span>
        </div>

        {filteredGroups.length === 0 ? (
          <div style={styles.emptyList}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {searchTerm ? 'No channels match query' : 'No channels created yet'}
            </p>
          </div>
        ) : (
          filteredGroups.map((g) => {
            const isSelected = activeGroup?._id === g._id;
            return (
              <button
                key={g._id}
                onClick={() => onSelectGroup(g)}
                style={{
                  ...styles.channelItem,
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                }}
              >
                {/* Active Indicator Bar */}
                <div
                  style={{
                    ...styles.activeIndicator,
                    opacity: isSelected ? 1 : 0,
                    backgroundColor: 'var(--primary)',
                  }}
                />

                <div
                  style={{
                    ...styles.channelIcon,
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  {g.groupImage ? (
                    <img src={g.groupImage} alt={g.name} style={styles.channelImg} />
                  ) : (
                    <Hash size={14} />
                  )}
                </div>

                <div style={styles.channelMeta}>
                  <span
                    style={{
                      ...styles.channelName,
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {g.name}
                  </span>
                  {g.latestMessage && (
                    <span style={styles.latestPreview}>
                      <span style={{ fontWeight: '600' }}>
                        {g.latestMessage.sender?.name?.split(' ')[0]}:
                      </span>{' '}
                      {g.latestMessage.text || 'Shared a file'}
                    </span>
                  )}
                </div>

                {g.unreadCount > 0 && (
                  <span style={styles.unreadBadge}>
                    {g.unreadCount > 99 ? '99+' : g.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* AI Copilot Launcher Card */}
      <div style={styles.aiBanner}>
        <button onClick={onOpenAIChat} style={styles.aiBtn}>
          <div style={styles.aiIconWrapper}>
            <Bot size={18} color="#FFF" />
          </div>
          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={styles.aiTitle}>AI Copilot</span>
              <Sparkles size={12} color="#FFF" />
            </div>
            <p style={styles.aiSub}>Instant brainstorm & answers</p>
          </div>
        </button>
      </div>

      {/* User Footer Profile */}
      <div style={styles.footer}>
        <button onClick={onOpenProfile} style={styles.profileSection} title="Edit workspace profile">
          <div style={styles.avatarWrapper}>
            <img
              src={
                mongoUser?.profilePicture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mongoUser?.name || 'User')}`
              }
              alt={mongoUser?.name}
              style={styles.userAvatar}
            />
            <span style={styles.presenceDot} />
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{mongoUser?.name}</span>
            <span style={styles.userStatus}>@{mongoUser?.username}</span>
          </div>
        </button>

        <div style={styles.footerControls}>
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            title="Workspace Themes"
            style={{
              ...styles.iconButton,
              backgroundColor: showThemePicker ? 'var(--primary-light)' : 'transparent',
              color: showThemePicker ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <Palette size={17} />
          </button>

          <button onClick={logoutUser} title="Sign Out" style={styles.iconButton}>
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* Theme Selector Popover (Popping out to the right of the sidebar) */}
      {showThemePicker && (
        <>
          <div onClick={() => setShowThemePicker(false)} style={styles.backdrop} />
          <div style={styles.themeFloatingMenu}>
            <ThemeSelector onClose={() => setShowThemePicker(false)} />
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '290px',
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    userSelect: 'none',
    position: 'relative',
  },
  brand: {
    padding: '18px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    background: 'var(--primary-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow)',
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  aiPill: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 5px',
    borderRadius: '4px',
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    letterSpacing: '0.5px',
  },
  workspaceName: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '1px',
  },
  quickActions: {
    padding: '14px 16px 8px 16px',
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'var(--primary-gradient)',
    color: '#FFF',
    borderRadius: '10px',
    fontSize: '12.5px',
    fontWeight: '600',
    boxShadow: 'var(--shadow-sm)',
  },
  actionBtnSecondary: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    margin: '8px 16px',
    padding: '0 10px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    height: '34px',
    gap: '6px',
  },
  searchInput: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '12.5px',
    outline: 'none',
  },
  clearSearchBtn: {
    color: 'var(--text-muted)',
    padding: '2px',
  },
  channelList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 8px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px 6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.6px',
  },
  counter: {
    fontSize: '10.5px',
    fontWeight: '700',
    backgroundColor: 'var(--bg-card)',
    padding: '1px 6px',
    borderRadius: '999px',
  },
  emptyList: {
    padding: '24px 16px',
    textAlign: 'center',
  },
  channelItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '10px',
    textAlign: 'left',
    color: 'var(--text-primary)',
    position: 'relative',
    margin: '2px 0',
  },
  activeIndicator: {
    position: 'absolute',
    left: '2px',
    top: '8px',
    bottom: '8px',
    width: '3px',
    borderRadius: '4px',
    transition: 'opacity 0.2s ease',
  },
  channelIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  channelImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  channelMeta: {
    flex: 1,
    overflow: 'hidden',
  },
  channelName: {
    display: 'block',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '-0.1px',
  },
  latestPreview: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '1px',
  },
  unreadBadge: {
    backgroundColor: 'var(--primary)',
    color: '#FFF',
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '999px',
    boxShadow: 'var(--shadow-glow)',
  },
  aiBanner: {
    padding: '10px 14px',
    borderTop: '1px solid var(--border-color)',
  },
  aiBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '12px',
    background: 'var(--ai-gradient)',
    color: '#FFF',
    boxShadow: 'var(--shadow-glow)',
  },
  aiIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiTitle: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '-0.1px',
  },
  aiSub: {
    fontSize: '10.5px',
    opacity: 0.9,
  },
  footer: {
    padding: '12px 14px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-main)',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    overflow: 'hidden',
    flex: 1,
    padding: '4px',
    borderRadius: '8px',
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  userAvatar: {
    width: '34px',
    height: '34px',
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
    backgroundColor: 'var(--accent-online)',
    border: '2px solid var(--bg-surface)',
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userStatus: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  footerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  iconButton: {
    color: 'var(--text-muted)',
    padding: '7px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 190,
    background: 'transparent',
  },
  themeFloatingMenu: {
    position: 'absolute',
    left: 'calc(100% + 12px)',
    bottom: '16px',
    zIndex: 200,
  },
};