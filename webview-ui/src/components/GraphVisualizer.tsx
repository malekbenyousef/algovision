import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import VisualizerCard from './VisualizerCard';

// ─── Layout constants ───────────────────────────────────────────────────────
const NODE_SIZE = 48; // matches BSTNode 48px square

// ─── Custom Node ─────────────────────────────────────────────────────────────
function GraphNode({ data }) {
  const { label, isNew } = data;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isNew ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isNew
            ? 'linear-gradient(135deg, #3794ff 0%, #1a6fd4 100%)'
            : 'linear-gradient(135deg, #2a2d3e 0%, #1e2030 100%)',
          border: isNew
            ? '2px solid #5baeff'
            : '2px solid rgba(255,255,255,0.12)',
          boxShadow: isNew
            ? '0 0 18px rgba(55,148,255,0.45), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 4px 12px rgba(0,0,0,0.4)',
          transform: isNew ? 'scale(1.12)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'default',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 15,
          fontWeight: 700,
          color: isNew ? '#fff' : 'rgba(255,255,255,0.75)',
          letterSpacing: '-0.5px',
          userSelect: 'none',
        }}
      >
        {label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: isNew ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
    </>
  );
}

const nodeTypes = { graphNode: GraphNode };

// ─── Dagre Layout ────────────────────────────────────────────────────────────

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_SIZE + 16, height: NODE_SIZE + 16 });
  });

  edges.forEach((edge) => {
    // dagre ignores edges to/from nodes that don't exist — safe
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - 24,
        y: pos.y - 24,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GraphVisualizer({ variable, prevVar }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const prevNodes = useMemo(() => prevVar?.nodes || [], [prevVar]);
  const prevEdges = useMemo(() => prevVar?.edges || [], [prevVar]);

  useEffect(() => {
    if (!variable || variable.kind !== 'graph') return;

    const rfNodes = variable.nodes.map((nodeId) => ({
      id: nodeId,
      type: 'graphNode',
      data: { label: nodeId, isNew: !prevNodes.includes(nodeId) },
      // position is overwritten by dagre — dummy value required by ReactFlow
      position: { x: 0, y: 0 },
      // tell ReactFlow not to render its own wrapper styles
      style: { background: 'transparent', border: 'none', padding: 0 },
    }));

    const rfEdges = variable.edges.map((edge, index) => {
      const isNew = !prevEdges.some(
        (e) => e.source === edge.source && e.target === edge.target
      );
      return {
        id: `e-${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: isNew,
        style: {
          stroke: isNew ? '#3794ff' : 'rgba(255,255,255,0.18)',
          strokeWidth: isNew ? 2 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isNew ? '#3794ff' : 'rgba(255,255,255,0.25)',
          width: 14,
          height: 14,
        },
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rfNodes,
      rfEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [variable, prevNodes, prevEdges, setNodes, setEdges]);

  if (!variable || variable.kind !== 'graph') return null;

  const hasChanged =
    !prevVar ||
    prevVar.nodes.length !== variable.nodes.length ||
    prevVar.edges.length !== variable.edges.length;

  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="Graph"
      kindColor="var(--av-kind-graph)"
      hasChanged={hasChanged}
      noPadding
    >
      <div style={{ height: 400, width: '100%', background: 'transparent' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
          <Background color="rgba(255,255,255,0.04)" gap={24} size={1} />
          <Controls
            className="av-react-flow-controls"
            style={{
              background: 'rgba(30,32,46,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          />
        </ReactFlow>
      </div>
    </VisualizerCard>
  );
}
