import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, ChevronRight, ChevronDown,
  RotateCcw, Cpu, Settings2, Zap, Gauge, Snail,
} from 'lucide-react';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import ObjectVisualizer     from './components/ObjectVisualizer';
import ArrayVisualizer      from './components/ArrayVisualizer';
import MatrixVisualizer     from './components/MatrixVisualizer';
import TreeVisualizer       from './components/TreeVisualizer';

const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

const VALID_KINDS = ['primitive', 'array', 'array2d', 'object', 'linkedList', 'tree'];
function isEnrichedVariable(v) {
  return v && typeof v === 'object' && typeof v.name === 'string' && VALID_KINDS.includes(v.kind);
}

// ─── Speed presets ────────────────────────────────────────────────────────────
const SPEED_PRESETS = [
  { label: 'Fast',   ms: 150, Icon: Zap   },
  { label: 'Normal', ms: 400, Icon: Gauge  },
  { label: 'Slow',   ms: 900, Icon: Snail  },
];

// ─── Primitives panel ─────────────────────────────────────────────────────────
function PrimitivesPanel({ variables, prevVariables }) {
  if (!variables.length) return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        marginBottom: 14,
        borderRadius: 'var(--av-radius-md)',
        background: 'var(--av-surface-2)',
        border: '1.5px solid var(--av-border-subtle)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '6px 12px',
        background: 'var(--av-surface-header)',
        borderBottom: '1px solid var(--av-border-subtle)',
        fontSize: 10, fontFamily: 'var(--av-font-mono)',
        color: 'var(--av-text-muted)', letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}>
        Locals
      </div>
      <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {variables.map(v => {
          const prev = prevVariables.find(p => p.name === v.name);
          const changed = prev && prev.value !== v.value;
          return (
            <div key={v.name} style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 5,
              padding: '3px 9px',
              borderRadius: 5,
              background: changed ? 'var(--av-blue-subtle)' : 'var(--av-surface-1)',
              border: `1px solid ${changed ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
              boxShadow: changed ? '0 0 8px var(--av-blue-glow)' : 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--av-font-mono)', fontSize: 12,
            }}>
              <span style={{ color: 'var(--av-text-muted)' }}>{v.name}</span>
              <span style={{ color: changed ? 'var(--av-blue-label)' : 'var(--av-text-primary)', fontWeight: 700 }}>
                {v.value}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────
function SkeletonCard({ height = 80 }) {
  return (
    <div style={{ borderRadius: 'var(--av-radius-md)', border: '1.5px solid var(--av-border-subtle)', overflow: 'hidden', marginBottom: 14 }}>
      <div className="av-skeleton" style={{ height: 34 }} />
      <div style={{ padding: '10px 12px', background: 'var(--av-surface-2)' }}>
        <div className="av-skeleton" style={{ height, borderRadius: 6 }} />
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 14, textAlign: 'center' }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'var(--av-blue-subtle)', border: '1.5px solid var(--av-border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 24px var(--av-blue-glow)',
      }}>
        <Cpu size={24} color="var(--av-blue-primary)" />
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 13.5, color: 'var(--av-text-primary)' }}>
          Waiting for a debug session
        </p>
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--av-text-muted)', lineHeight: 1.9 }}>
          1. Open a JavaScript file and set a breakpoint<br />
          2. Press <kbd style={{ fontFamily: 'var(--av-font-mono)', background: 'var(--av-surface-2)', border: '1px solid var(--av-border-default)', borderRadius: 3, padding: '1px 5px', fontSize: 10 }}>F5</kbd> to start debugging<br />
          3. AlgoVision will visualize your variables here
        </p>
      </div>
    </motion.div>
  );
}

// ─── Control button ──────────────────────────────────────────────────────────
function CtrlBtn({ icon: Icon, label, onClick, active = false, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={label} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 5, padding: 0,
        border: active ? '1.5px solid var(--av-blue-primary)' : `1.5px solid ${hov && !disabled ? 'var(--av-border-default)' : 'transparent'}`,
        background: active ? 'var(--av-blue-subtle)' : hov && !disabled ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.18)' : hov && !disabled ? 'var(--av-blue-label)' : active ? 'var(--av-blue-primary)' : 'var(--av-text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
      }}>
      <Icon size={14} strokeWidth={2.3} />
    </button>
  );
}

// ─── Settings popover ────────────────────────────────────────────────────────
function SettingsPopover({ speedMs, onSpeedChange, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 100,
        background: 'var(--av-surface-2)',
        border: '1.5px solid var(--av-border-default)',
        borderRadius: 'var(--av-radius-md)',
        padding: '12px 14px', minWidth: 190,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}>
      <p style={{ margin: '0 0 8px', fontSize: 10.5, color: 'var(--av-text-muted)', fontFamily: 'var(--av-font-mono)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        Auto-Play Speed
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {SPEED_PRESETS.map(({ label, ms, Icon }) => {
          const active = speedMs === ms;
          return (
            <button key={ms} onClick={() => onSpeedChange(ms)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '7px 4px', borderRadius: 6, border: `1.5px solid ${active ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                background: active ? 'var(--av-blue-subtle)' : 'var(--av-surface-1)',
                color: active ? 'var(--av-blue-label)' : 'var(--av-text-muted)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontSize: 10, fontFamily: 'var(--av-font-mono)',
              }}>
              <Icon size={13} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState]   = useState({ variables: [], previousVariables: [] });
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('idle');
  const [hasData, setHasData] = useState(false);
  const [speedMs, setSpeedMs] = useState(400);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      const msg = event.data;
      if (!msg?.command) return;
      if (msg.command === 'updateData' && Array.isArray(msg.variables) && msg.variables.every(isEnrichedVariable)) {
        setStatus('idle');
        setHasData(true);
        setState(cur => ({ previousVariables: cur.variables, variables: msg.variables }));
      } else if (msg.command === 'status') {
        setStatus('fetching');
      } else if (msg.command === 'error') {
        setStatus('error'); setIsPlaying(false);
      } else if (msg.command === 'init' && typeof msg.playbackSpeedMs === 'number') {
        setSpeedMs(msg.playbackSpeedMs);
      }
    };
    window.addEventListener('message', handleMessage);
    if (vscode) vscode.postMessage({ command: 'webviewReady' });
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendCommand = useCallback((command) => {
    if (vscode) vscode.postMessage({ command });
    setStatus('fetching');
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => sendCommand('stepOver'), speedMs);
    return () => clearTimeout(t);
  }, [state.variables, isPlaying, speedMs, sendCommand]);

  // Separate primitives from complex data structures
  const primitives   = state.variables.filter(v => v.kind === 'primitive');
  const complexVars  = state.variables.filter(v => v.kind !== 'primitive');

  const renderComplex = (variable) => {
    const prev = state.previousVariables.find(p => p.name === variable.name);
    const props = { key: variable.name, variable, prevVar: prev };
    switch (variable.kind) {
      case 'tree':       return <TreeVisualizer      {...props} />;
      case 'linkedList': return <LinkedListVisualizer {...props} />;
      case 'object':     return <ObjectVisualizer     {...props} />;
      case 'array2d':    return <MatrixVisualizer     {...props} />;
      case 'array':      return <ArrayVisualizer      {...props} />;
      default:           return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 12, marginBottom: 14,
        borderBottom: '1px solid var(--av-border-subtle)',
      }}>
        {/* Brand */}
        <span style={{
          fontFamily: 'var(--av-font-mono)', fontWeight: 700, fontSize: 15,
          letterSpacing: '-0.4px', color: 'var(--av-text-primary)',
        }}>
          AlgoVision
        </span>

        {/* Controls + Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--av-surface-2)',
            border: '1px solid var(--av-border-subtle)',
            borderRadius: 6, padding: '2px 4px',
          }}>
            <CtrlBtn icon={RotateCcw}                    label="Restart Session"     onClick={() => { setIsPlaying(false); sendCommand('restart'); }} />
            <CtrlBtn icon={SkipBack}                     label="Step Back (Phase 3)" onClick={() => {}} disabled />
            <div style={{ width: 1, height: 14, background: 'var(--av-border-subtle)', margin: '0 1px' }} />
            <CtrlBtn icon={isPlaying ? Pause : Play}     label={isPlaying ? 'Pause' : 'Auto-Play'} active={isPlaying} onClick={() => setIsPlaying(p => !p)} />
            <CtrlBtn icon={ChevronRight}                 label="Step Over"           onClick={() => sendCommand('stepOver')} />
            <CtrlBtn icon={ChevronDown}                  label="Step Into"           onClick={() => sendCommand('stepInto')} />
          </div>

          {/* Settings button */}
          <CtrlBtn icon={Settings2} label="Settings" active={showSettings} onClick={() => setShowSettings(s => !s)} />

          {/* Settings popover */}
          <AnimatePresence>
            {showSettings && (
              <SettingsPopover
                speedMs={speedMs}
                onSpeedChange={(ms) => { setSpeedMs(ms); setShowSettings(false); }}
                onClose={() => setShowSettings(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {!hasData && status !== 'fetching' && <EmptyState key="empty" />}
        {!hasData && status === 'fetching' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonCard height={40} />
            <SkeletonCard height={90} />
            <SkeletonCard height={60} />
          </motion.div>
        )}
        {hasData && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {state.variables.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--av-text-muted)', fontSize: 12 }}>
                No local variables in this scope
              </motion.div>
            ) : (
              <AnimatePresence>
                {/* Primitives — compact grouped panel */}
                {primitives.length > 0 && (
                  <PrimitivesPanel
                    key="__primitives__"
                    variables={primitives}
                    prevVariables={state.previousVariables}
                  />
                )}
                {/* Complex data structures — individual cards */}
                {complexVars.map(renderComplex)}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}