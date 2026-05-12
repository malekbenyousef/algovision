import * as vscode from 'vscode';
import { fetchChildren, RawVariable } from '../debugger/dapClient';
import { VariableEnricher, TreeVariable, TreeNodeData } from './types'; 

export class TreeEnricher implements VariableEnricher {
  canHandle(variable: RawVariable): boolean {
  if (variable.variablesReference === 0) { return false; }
  
  const val = variable.value;
  const name = variable.name;
  const type = variable.type ?? '';

  return (
    // Node.js: "TreeNode { value: 1, left: null, right: null }"
    /^\w*[Tt]ree\w*\s*\{/.test(val) ||
    // type field sometimes populated
    /[Tt]ree[Nn]ode/.test(type) ||
    // name-based fallbacks
    name === 'root' ||
    name === 'tree' ||
    // your original regex as fallback
    /^\w+ \{.*(left|right|root):/.test(val)
  );
}

    async enrich(variable: RawVariable, session: vscode.DebugSession): Promise<TreeVariable> {
        let startReference = variable.variablesReference;

        const initialChildren = await fetchChildren(session, startReference);
        
        const rootChild = initialChildren.find(c => c.name === 'root');

        if (rootChild) {
            if (rootChild.value === 'null' || rootChild.variablesReference === 0) {
                return {
                    kind: 'tree',
                    name: variable.name,
                    root: null
                };
            }
            startReference = rootChild.variablesReference;
        }

        const root = await this.traverse(startReference, session, 0);
        
        return {
            kind: 'tree',
            name: variable.name,
            root,
        };
    }

    private async traverse(
  variablesReference: number,
  session: vscode.DebugSession,
  depth: number
): Promise<TreeNodeData | null> {
  if (depth > 20 || variablesReference === 0) { return null; }

  const children = await fetchChildren(session, variablesReference);
  if (!children || children.length === 0) { return null; }

  const valueChild = children.find(c => c.name === 'value' || c.name === 'val');
  const leftChild  = children.find(c => c.name === 'left');
  const rightChild = children.find(c => c.name === 'right');

  if (!valueChild) { return null; }

  // Node.js sometimes wraps the value, strip quotes
  const rawValue = valueChild.value.replace(/^["']|["']$/g, '');

  const node: TreeNodeData = {
    value: rawValue,
    variablesReference,
    left: null,
    right: null,
  };

  if (leftChild && leftChild.variablesReference > 0 && leftChild.value !== 'null') {
    node.left = await this.traverse(leftChild.variablesReference, session, depth + 1);
  }
  if (rightChild && rightChild.variablesReference > 0 && rightChild.value !== 'null') {
    node.right = await this.traverse(rightChild.variablesReference, session, depth + 1);
  }

  return node;
}
}