import VisualizerCard from './VisualizerCard';

export default function ObjectVisualizer({ variable, prevVar }) {
  const hasAnyChange = variable.entries.some(({ key, value }) => {
    const prev = prevVar?.entries?.find(e => e.key === key);
    return prev && prev.value !== value;
  });

  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="Object"
      kindColor="var(--av-kind-object)"
      hasChanged={hasAnyChange}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {variable.entries.map(({ key, value }) => {
          const prevEntry = prevVar?.entries?.find(e => e.key === key);
          const hasChanged = prevEntry && prevEntry.value !== value;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
              {/* Key cell */}
              <div style={{
                padding: '6px 10px',
                background: 'var(--av-surface-1)',
                border: `1.5px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                borderRight: 'none',
                borderRadius: 'var(--av-radius-sm) 0 0 var(--av-radius-sm)',
                fontFamily: 'var(--av-font-mono)', fontWeight: 700, fontSize: 12,
                color: 'var(--av-blue-label)',
                minWidth: 64, textAlign: 'center',
                transition: 'border-color 0.2s',
              }}>
                {key}
              </div>
              {/* Connector */}
              <div style={{
                width: 18, alignSelf: 'center',
                borderTop: `1.5px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                transition: 'border-color 0.2s',
              }} />
              {/* Value cell */}
              <div style={{
                padding: '6px 10px',
                border: `1.5px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                borderLeft: 'none',
                borderRadius: '0 var(--av-radius-sm) var(--av-radius-sm) 0',
                fontFamily: 'var(--av-font-mono)', fontSize: 12,
                background: hasChanged ? 'var(--av-blue-primary)' : 'var(--av-surface-1)',
                color: hasChanged ? '#fff' : 'var(--av-text-primary)',
                minWidth: 64, textAlign: 'center',
                transition: 'all 0.25s ease',
                boxShadow: hasChanged ? '0 0 10px var(--av-blue-glow)' : 'none',
              }}>
                {value}
              </div>
            </div>
          );
        })}
        {variable.entries.length === 0 && (
          <span style={{ color: 'var(--av-text-muted)', fontStyle: 'italic', fontSize: 12 }}>&#123; &#125;</span>
        )}
      </div>
    </VisualizerCard>
  );
}