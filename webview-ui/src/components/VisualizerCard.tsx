import { motion } from 'framer-motion';

/**
 * VisualizerCard — shared wrapper for every data-structure visualizer.
 * Provides consistent header, border glow on change, and spring mount animation.
 *
 * Props:
 *   name       — variable name shown in monospace blue
 *   kindLabel  — e.g. "1D Array", "Binary Tree"
 *   kindColor  — CSS var or hex for the accent dot & badge
 *   hasChanged — true → card border glows blue
 *   children   — visualizer content
 *   noPadding  — true for visualizers that manage their own padding (Tree)
 */
export default function VisualizerCard({
  name,
  kindLabel,
  kindColor = 'var(--av-blue-primary)',
  hasChanged = false,
  children,
  noPadding = false,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -6 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        marginBottom: 14,
        borderRadius: 'var(--av-radius-md)',
        background: 'var(--av-surface-2)',
        border: `1.5px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-subtle)'}`,
        boxShadow: hasChanged
          ? '0 0 0 3px var(--av-blue-subtle), 0 4px 20px rgba(0,0,0,0.4)'
          : '0 2px 12px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'var(--av-surface-header)',
        borderBottom: '1px solid var(--av-border-subtle)',
      }}>
        {/* Accent dot */}
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: kindColor,
          boxShadow: `0 0 5px ${kindColor}`,
          flexShrink: 0,
        }} />
        {/* Variable name */}
        <span style={{
          fontFamily: 'var(--av-font-mono)',
          fontWeight: 700, fontSize: 12.5,
          color: 'var(--av-blue-label)',
          letterSpacing: '-0.2px',
        }}>
          {name}
        </span>
        {/* Kind badge */}
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--av-font-mono)',
          color: kindColor,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 4,
          padding: '1px 6px',
          letterSpacing: '0.2px',
        }}>
          {kindLabel}
        </span>
      </div>

      {/* ── Content ── */}
      <div style={noPadding ? {} : { padding: '11px 12px' }}>
        {children}
      </div>
    </motion.div>
  );
}
