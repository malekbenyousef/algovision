import VisualizerCard from './VisualizerCard';

export default function ArrayVisualizer({ variable, prevVar }) {
  const hasAnyChange = variable.elements.some((val, i) => prevVar?.elements[i] !== val);

  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="1D Array"
      kindColor="var(--av-kind-array)"
      hasChanged={hasAnyChange}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {variable.elements.map((val, index) => {
          const hasChanged = prevVar && prevVar.elements[index] !== val;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                className={hasChanged ? 'av-cell-changed' : ''}
                style={{
                  width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                  borderRadius: 'var(--av-radius-sm)',
                  fontFamily: 'var(--av-font-mono)', fontWeight: 700, fontSize: 13,
                  background: hasChanged ? 'var(--av-blue-primary)' : 'var(--av-surface-1)',
                  color: hasChanged ? '#fff' : 'var(--av-text-primary)',
                  transform: hasChanged ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {val}
              </div>
              <span style={{ fontSize: 10, color: 'var(--av-text-faint)', fontFamily: 'var(--av-font-mono)' }}>
                [{index}]
              </span>
            </div>
          );
        })}
        {variable.elements.length === 0 && (
          <span style={{ color: 'var(--av-text-muted)', fontStyle: 'italic', fontSize: 12 }}>empty</span>
        )}
      </div>
    </VisualizerCard>
  );
}