import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';
import { GraphEnricher } from './GraphEnricher';
import * as dapClient from '../debugger/dapClient';

vi.mock('../debugger/dapClient', () => ({
  fetchChildren: vi.fn(),
}));

describe('GraphEnricher', () => {
  let enricher: GraphEnricher;
  let mockSession: vscode.DebugSession;

  beforeEach(() => {
    enricher = new GraphEnricher();
    mockSession = {} as vscode.DebugSession;
    vi.resetAllMocks();
  });

  describe('canHandle', () => {
    it('returns false if variablesReference is 0', () => {
      expect(enricher.canHandle({ name: 'graph', value: 'Object', variablesReference: 0 })).toBe(false);
    });

    it('returns true if name implies graph', () => {
      expect(enricher.canHandle({ name: 'graph', value: 'Object', variablesReference: 1 })).toBe(true);
      expect(enricher.canHandle({ name: 'adj', value: 'Object', variablesReference: 1 })).toBe(true);
      expect(enricher.canHandle({ name: 'adjList', value: 'Object', variablesReference: 1 })).toBe(true);
    });

    it('returns true if value structurally matches an adjacency list', () => {
      expect(enricher.canHandle({ name: 'myVar', value: 'Object {0: Array, 1: Array}', variablesReference: 1 })).toBe(true);
      expect(enricher.canHandle({ name: 'myVar', value: '{A: Array(2), B: Array(1)}', variablesReference: 1 })).toBe(true);
    });

    it('returns false if name and structure do not match', () => {
      expect(enricher.canHandle({ name: 'myVar', value: 'Object {a: 1}', variablesReference: 1 })).toBe(false);
      expect(enricher.canHandle({ name: 'myVar', value: '123', variablesReference: 1 })).toBe(false);
    });
  });

  describe('enrich', () => {
    it('correctly parses an adjacency list into GraphVariable', async () => {
      // Mock top-level children (the nodes)
      vi.mocked(dapClient.fetchChildren).mockImplementation(async (_session, ref) => {
        if (ref === 1) {
          return [
            { name: 'A', value: 'Array', variablesReference: 2, type: 'Array' },
            { name: 'B', value: 'Array', variablesReference: 3, type: 'Array' },
            { name: '__proto__', value: 'Object', variablesReference: 0 },
            { name: '[[Prototype]]', value: 'Object', variablesReference: 0 }
          ];
        } else if (ref === 2) {
          // Neighbors of A
          return [
            { name: '0', value: '"B"', variablesReference: 0 },
            { name: 'length', value: '1', variablesReference: 0 },
            { name: '__proto__', value: 'Array', variablesReference: 0 }
          ];
        } else if (ref === 3) {
          // Neighbors of B (empty)
          return [
            { name: 'length', value: '0', variablesReference: 0 }
          ];
        }
        return [];
      });

      const variable = { name: 'myGraph', value: 'Object', variablesReference: 1 };
      const result = await enricher.enrich(variable, mockSession);

      expect(result).toEqual({
        kind: 'graph',
        name: 'myGraph',
        nodes: ['A', 'B'],
        edges: [
          { source: 'A', target: 'B' }
        ]
      });
    });

    it('handles graphs with numeric nodes and edges', async () => {
      vi.mocked(dapClient.fetchChildren).mockImplementation(async (_session, ref) => {
        if (ref === 10) {
          return [
            { name: '0', value: 'Array', variablesReference: 11 },
            { name: '1', value: 'Array', variablesReference: 12 }
          ];
        } else if (ref === 11) {
          return [
            { name: '0', value: '1', variablesReference: 0 }
          ];
        } else if (ref === 12) {
          return [
            { name: '0', value: '0', variablesReference: 0 }
          ];
        }
        return [];
      });

      const variable = { name: 'adj', value: 'Array', variablesReference: 10 };
      const result = await enricher.enrich(variable, mockSession);

      expect(result).toEqual({
        kind: 'graph',
        name: 'adj',
        nodes: ['0', '1'],
        edges: [
          { source: '0', target: '1' },
          { source: '1', target: '0' }
        ]
      });
    });
  });
});
