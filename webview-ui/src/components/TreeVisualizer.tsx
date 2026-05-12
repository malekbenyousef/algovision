import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import VisualizerCard from './VisualizerCard';

// ─── Custom Node ────────────────────────────────────────────────────────────
function BSTNode({ data }) {
  const { label, hasChanged, isGhost } = data;

  if (isGhost) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'transparent',
          border: '1.5px dashed rgba(255,255,255,0.18)',
        }} />
      </>
    );
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.2)',
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
          background: hasChanged
            ? 'linear-gradient(135deg, #3794ff 0%, #1a6fd4 100%)'
            : 'linear-gradient(135deg, #2a2d3e 0%, #1e2030 100%)',
          border: hasChanged
            ? '2px solid #5baeff'
            : '2px solid rgba(255,255,255,0.12)',
          boxShadow: hasChanged
            ? '0 0 18px rgba(55,148,255,0.45), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 4px 12px rgba(0,0,0,0.4)',
          transform: hasChanged ? 'scale(1.12)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'default',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 15,
          fontWeight: 700,
          color: hasChanged ? '#fff' : 'rgba(255,255,255,0.75)',
          letterSpacing: '-0.5px',
          userSelect: 'none',
        }}
      >
        {label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="left"
        style={{
          left: '28%',
          background: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="right"
        style={{
          left: '72%',
          background: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.2)',
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
    </>
  );
}

const nodeTypes = { bstNode: BSTNode };

// ─── Layout Builder ──────────────────────────────────────────────────────────
// counter is a mutable ref object { current: number } created fresh per render
function buildGraph(node, prevNode, nodes, edges, x, y, xOffset, counter) {
  if (!node) return null;

  const id = `node-${counter.current++}`;
  const hasChanged = prevNode ? prevNode.value !== node.value : true;

  nodes.push({
    id,
    type: 'bstNode',
    position: { x, y },
    data: { label: String(node.value), hasChanged },
    style: { background: 'transparent', border: 'none', padding: 0 },
  });

  const childY = y + 90;
  const half = xOffset / 2;

  if (node.left || node.right) {
    // Left child or ghost
    if (node.left) {
      const leftId = buildGraph(node.left, prevNode?.left, nodes, edges, x - xOffset, childY, half, counter);
      edges.push({
        id: `e-${id}-${leftId}`,
        source: id,
        target: leftId,
        sourceHandle: 'left',
        animated: hasChanged,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.25)',
        },
        style: {
          stroke: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.18)',
          strokeWidth: hasChanged ? 2 : 1.5,
        },
        label: 'L',
        labelStyle: {
          fill: 'rgba(255,255,255,0.3)',
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: { fill: 'transparent' },
      });
    } else {
      const ghostId = `ghost-${counter.current++}`;
      nodes.push({
        id: ghostId,
        type: 'bstNode',
        position: { x: x - xOffset, y: childY },
        data: { isGhost: true },
        style: { background: 'transparent', border: 'none', padding: 0 },
      });
      edges.push({
        id: `e-${id}-${ghostId}`,
        source: id,
        target: ghostId,
        sourceHandle: 'left',
        style: { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: 'rgba(255,255,255,0.08)',
        },
      });
    }

    // Right child or ghost
    if (node.right) {
      const rightId = buildGraph(node.right, prevNode?.right, nodes, edges, x + xOffset, childY, half, counter);
      edges.push({
        id: `e-${id}-${rightId}`,
        source: id,
        target: rightId,
        sourceHandle: 'right',
        animated: hasChanged,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.25)',
        },
        style: {
          stroke: hasChanged ? '#3794ff' : 'rgba(255,255,255,0.18)',
          strokeWidth: hasChanged ? 2 : 1.5,
        },
        label: 'R',
        labelStyle: {
          fill: 'rgba(255,255,255,0.3)',
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: { fill: 'transparent' },
      });
    } else {
      const ghostId = `ghost-${counter.current++}`;
      nodes.push({
        id: ghostId,
        type: 'bstNode',
        position: { x: x + xOffset, y: childY },
        data: { isGhost: true },
        style: { background: 'transparent', border: 'none', padding: 0 },
      });
      edges.push({
        id: `e-${id}-${ghostId}`,
        source: id,
        target: ghostId,
        sourceHandle: 'right',
        style: { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: 'rgba(255,255,255,0.08)',
        },
      });
    }
  }

  return id;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TreeVisualizer({ variable, prevVar }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!variable?.root) return { initialNodes: [], initialEdges: [] };

    const counter = { current: 0 }; // fresh counter per render — no shared mutable state
    const nodes = [];
    const edges = [];
    const isInitialRender = !prevVar;
    const prevRoot = isInitialRender ? variable.root : prevVar?.root;

    buildGraph(variable.root, prevRoot, nodes, edges, 0, 0, 160, counter);
    return { initialNodes: nodes, initialEdges: edges };
  }, [variable, prevVar]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync ReactFlow state when variable changes (new debug step)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!variable?.root) return null;

  const hasChanged = initialNodes.some(n => n.data?.hasChanged);

  return (
    <VisualizerCard
      name={variable.name}
      kindLabel="Binary Tree"
      kindColor="var(--av-kind-tree)"
      hasChanged={hasChanged}
      noPadding
    >
      {/* ReactFlow canvas */}
      <div style={{ height: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background color="rgba(255,255,255,0.04)" gap={24} size={1} />
          <Controls
            style={{
              background: 'rgba(30,32,46,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>
    </VisualizerCard>
  );
}