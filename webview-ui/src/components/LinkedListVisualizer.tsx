import VisualizerCard from './VisualizerCard';

export default function LinkedListVisualizer({ variable, prevVar }) {
  const hasAnyChange = variable.nodes.some((val, i) => prevVar?.nodes[i] !== val);

  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="Linked List"
      kindColor="var(--av-kind-linkedList)"
      hasChanged={hasAnyChange}
    >
      {variable.nodes.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--av-text-muted)', fontStyle: 'italic', fontSize: 12,
        }}>
          <div style={{
            padding: '5px 10px',
            border: '1.5px dashed var(--av-border-default)',
            borderRadius: 'var(--av-radius-sm)',
            fontStyle: 'italic', opacity: 0.6,
          }}>null</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0, rowGap: 10 }}>
          {variable.nodes.map((val, index) => {
            const hasChanged = prevVar && prevVar.nodes[index] !== val;
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Node */}
                <div style={{
                  display: 'flex',
                  border: `2px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                  borderRadius: 'var(--av-radius-sm)',
                  overflow: 'hidden',
                  transform: hasChanged ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: hasChanged ? '0 0 12px var(--av-blue-glow)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                  {/* Value section */}
                  <div style={{
                    minWidth: 40, height: 40, padding: '0 8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--av-font-mono)', fontWeight: 700, fontSize: 13,
                    background: hasChanged ? 'var(--av-blue-primary)' : 'var(--av-surface-1)',
                    color: hasChanged ? '#fff' : 'var(--av-text-primary)',
                    transition: 'all 0.25s ease',
                  }}>
                    {val}
                  </div>
                  {/* Pointer section */}
                  <div style={{
                    width: 28, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderLeft: `2px solid ${hasChanged ? 'var(--av-blue-primary)' : 'var(--av-border-default)'}`,
                    color: hasChanged ? 'var(--av-blue-label)' : 'var(--av-text-faint)',
                    fontSize: 14,
                    transition: 'all 0.25s ease',
                  }}>
                    →
                  </div>
                </div>
                {/* Arrow connector between nodes */}
                {index < variable.nodes.length - 1 && (
                  <div style={{ width: 10, height: 2, background: 'var(--av-border-default)' }} />
                )}
              </div>
            );
          })}
          {/* Null terminator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 10, height: 2, background: 'var(--av-border-default)' }} />
            <div style={{
              padding: '5px 8px',
              border: '1.5px dashed var(--av-border-default)',
              borderRadius: 'var(--av-radius-sm)',
              fontFamily: 'var(--av-font-mono)', fontSize: 11,
              color: 'var(--av-text-faint)', fontStyle: 'italic',
            }}>
              null
            </div>
          </div>
        </div>
      )}
    </VisualizerCard>
  );
}