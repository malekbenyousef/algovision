import * as vscode from 'vscode';
import { fetchChildren, RawVariable } from '../debugger/dapClient';
import { VariableEnricher, GraphVariable } from './types';

export class GraphEnricher implements VariableEnricher {
  canHandle(variable: RawVariable): boolean {
    if (variable.variablesReference === 0) { return false; }

    const val = variable.value || '';
    const name = variable.name.toLowerCase();

    // Check if the name strongly implies an adjacency list / graph
    const nameMatch = name.includes('graph') || name === 'adj' || name.includes('adjlist');

    // Structural check: Node.js preview might look like { 0: [Array], 1: [Array] }
    // We check if it's an Object and has Array values in its preview string
    const structuralMatch = (val.startsWith('Object') || val.startsWith('{')) && val.includes('Array');

    return nameMatch || structuralMatch;
  }

  async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<GraphVariable> {
    const children = await fetchChildren(session, variable.variablesReference);
    
    const nodes: string[] = [];
    const edges: { source: string; target: string }[] = [];

    // Filter out prototype properties
    const keys = children.filter(c => c.name !== '__proto__' && c.name !== '[[Prototype]]');

    for (const keyVar of keys) {
      nodes.push(keyVar.name);

      if (keyVar.variablesReference > 0) {
        // Fetch the array of neighbors
        const neighbors = await fetchChildren(session, keyVar.variablesReference);
        
        for (const neighbor of neighbors) {
          if (neighbor.name !== '__proto__' && neighbor.name !== '[[Prototype]]' && neighbor.name !== 'length') {
            // Node.js debugger sometimes wraps string values in quotes
            const targetName = neighbor.value.replace(/^["']|["']$/g, '');
            if (targetName) {
              edges.push({ source: keyVar.name, target: targetName });
            }
          }
        }
      }
    }

    return {
      kind: 'graph',
      name: variable.name,
      nodes,
      edges
    };
  }
}
