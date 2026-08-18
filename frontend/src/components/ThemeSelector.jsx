import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, X } from 'lucide-react';

const THEMES = [
  { id: 'midnight', label: 'Midnight', desc: 'Dark Slate & Indigo', primary: '#6366F1', bg: '#0A0D14', accent: '#8B5CF6' },
  { id: 'light', label: 'Daylight', desc: 'Clean Minimal Light', primary: '#4F46E5', bg: '#F8FAFC', accent: '#6366F1' },
  { id: 'ocean', label: 'Oceanic', desc: 'Deep Cyan & Sapphire', primary: '#0EA5E9', bg: '#031322', accent: '#06B6D4' },
  { id: 'forest', label: 'Forest', desc: 'Nature Emerald & Mint', primary: '#10B981', bg: '#06150E', accent: '#059669' },
  { id: 'sunset', label: 'Sunset', desc: 'Warm Crimson & Rose', primary: '#F43F5E', bg: '#180A13', accent: '#FB923C' },
  { id: 'purple', label: 'Amethyst', desc: 'Royal Velvet Violet', primary: '#A855F7', bg: '#10081D', accent: '#EC4899' },
  { id: 'pastel', label: 'Pastel', desc: 'Soft Lavender Light', primary: '#9333EA', bg: '#FBF8FF', accent: '#D946EF' },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Futuristic Electric Neon', primary: '#06B6D4', bg: '#07070B', accent: '#3B82F6' },
  { id: 'abyss', label: 'Obsidian', desc: 'OLED Pure Dark', primary: '#7C3AED', bg: '#040405', accent: '#6366F1' },
  { id: 'nord', label: 'Nord Frost', desc: 'Arctic Cool-Toned Slate', primary: '#38BDF8', bg: '#181D28', accent: '#818CF8' },
];

export default function ThemeSelector({ onClose }) {
  const { theme, changeTheme } = useTheme();

  return (
    <div style={styles.card} className="animate-scale-in">
      {/* Pinned Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={styles.iconCircle}>
            <Palette size={16} color="var(--primary)" />
          </div>
          <div>
            <span style={styles.title}>Workspace Themes</span>
            <span style={styles.subtitle}>Choose your aesthetic</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Scrollable Theme Options */}
      <div style={styles.grid}>
        {THEMES.map((t) => {
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                changeTheme(t.id);
                if (onClose) onClose();
              }}
              style={{
                ...styles.themeOption,
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <div style={styles.palettePreview}>
                <span style={{ ...styles.swatch, backgroundColor: t.primary }} />
                <span style={{ ...styles.swatch, backgroundColor: t.accent }} />
                <span
                  style={{
                    ...styles.swatch,
                    backgroundColor: t.bg,
                    border: '1px solid rgba(128,128,128,0.4)',
                  }}
                />
              </div>

              <div style={styles.meta}>
                <span
                  style={{
                    ...styles.label,
                    fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  }}
                >
                  {t.label}
                </span>
                <span style={styles.desc}>{t.desc}</span>
              </div>

              {isSelected && (
                <div style={styles.checkBadge}>
                  <Check size={12} color="#FFF" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    width: '300px',
    maxHeight: 'calc(100vh - 40px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface)',
    flexShrink: 0,
  },
  iconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'block',
    letterSpacing: '-0.2px',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px 14px',
    overflowY: 'auto',
    flex: 1,
  },
  themeOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    textAlign: 'left',
    position: 'relative',
    transition: 'all 0.18s ease',
    width: '100%',
    flexShrink: 0,
  },
  palettePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
  },
  swatch: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  label: {
    fontSize: '13px',
    lineHeight: '1.2',
  },
  desc: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  checkBadge: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    flexShrink: 0,
  },
};