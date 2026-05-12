/**
 * AlgoVision — Comprehensive Test File
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * HOW TO TEST:
 *  1. Press F5 → select "Debug Test File (AlgoVision)" from the run dropdown
 *  2. The debugger will pause at EACH debugger; statement below
 *  3. At each pause, run: "AlgoVision: Open Visualizer Panel" (Cmd+Shift+P)
 *  4. Use Step Over (→) to watch each variable change in real-time
 *
 * Each section below tests a different data structure enricher.
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — Primitives + 1D Array  (Binary Search)
//  Expected AlgoVision view:
//    Locals: lo, hi, mid, target (changing each step)
//    arr:    [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]  (1D Array)
// ════════════════════════════════════════════════════════════════════════════
{
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const target = 23;

    let lo  = 0;
    let hi  = arr.length - 1;
    let mid = 0;
    let found = -1;

    debugger; // ← PAUSE 1: inspect initial state

    while (lo <= hi) {
        mid = Math.floor((lo + hi) / 2);

        debugger; // ← PAUSE 2: step through — watch lo, hi, mid change

        if (arr[mid] === target) {
            found = mid;
            break;
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    debugger; // ← PAUSE 3: found = 5 (arr[5] = 23)
}

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — 2D Matrix  (Sum of each row)
//  Expected AlgoVision view:
//    matrix: 3×4 grid  (2D Matrix — cells light up as they change)
// ════════════════════════════════════════════════════════════════════════════
{
    // IMPORTANT: Use a small matrix so Node.js shows it inline
    // This ensures MatrixEnricher.canHandle detects the nested structure
    const matrix = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 8, 7, 6],
    ];

    debugger; // ← PAUSE 4: see the 3×4 matrix

    // Transpose the matrix (swap rows/cols)
    const rows = matrix.length;
    const cols = matrix[0].length;
    for (let r = 0; r < rows; r++) {
        for (let c = r + 1; c < cols; c++) {
            const temp = matrix[r][c];
            matrix[r][c] = matrix[c][r];
            matrix[c][r] = temp;
        }
    }

    debugger; // ← PAUSE 5: matrix is now 4×3 (transposed)
}

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — Object  (Point mutation)
//  Expected AlgoVision view:
//    point: { x: ?, y: ?, z: ? }  (Object — changed entries glow blue)
// ════════════════════════════════════════════════════════════════════════════
{
    const point = { x: 0, y: 0 };

    debugger; // ← PAUSE 6: point = { x:0, y:0 }

    point.x = 3;
    point.y = 4;

    debugger; // ← PAUSE 7: point = { x:3, y:4 } — both cells change

    const dist = Math.sqrt(point.x ** 2 + point.y ** 2); // = 5
    debugger; // ← PAUSE 8: dist = 5
}

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 4 — Linked List  (Build + Reversal)
//  Expected AlgoVision view:
//    head: 1 → 2 → 3 → 4 → 5 → null  (Linked List)
//  The variable MUST be named in a way that canHandle() matches it.
//  canHandle checks: value contains { ...next: }
// ════════════════════════════════════════════════════════════════════════════
{
    class ListNode {
        constructor(val) {
            this.value = val;   // enricher looks for 'value' or 'val'
            this.next  = null;  // enricher looks for 'next'
        }
    }

    // Build: 1 → 2 → 3 → 4 → 5 → null
    const head = new ListNode(1);
    let cur = head;
    for (let i = 2; i <= 5; i++) {
        cur.next = new ListNode(i);
        cur = cur.next;
    }

    debugger; // ← PAUSE 9: head shows 1→2→3→4→5→null

    // Reverse in-place: 5 → 4 → 3 → 2 → 1 → null
    let prev    = null;
    let current = head;
    while (current !== null) {
        const nextNode = current.next;
        current.next = prev;
        prev    = current;
        current = nextNode;

        debugger; // ← PAUSE 10+: watch the reversal step by step
    }
    const reversedHead = prev;

    debugger; // ← PAUSE FINAL LL: reversedHead shows 5→4→3→2→1→null
}

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 5 — Binary Search Tree  (Insertion)
//  Expected AlgoVision view:
//    tree: interactive ReactFlow BST diagram
//  The root variable MUST be named 'root' or 'tree', OR the class name must
//  contain 'Tree' or 'Node' — our TreeEnricher checks all of these.
// ════════════════════════════════════════════════════════════════════════════
{
    class TreeNode {
        constructor(val) {
            this.value = val;   // enricher looks for 'value' or 'val'
            this.left  = null;  // enricher looks for 'left' / 'right'
            this.right = null;
        }
    }

    function insert(root, val) {
        if (!root) { return new TreeNode(val); }
        if (val < root.value) { root.left  = insert(root.left,  val); }
        else                  { root.right = insert(root.right, val); }
        return root;
    }

    // Build BST by inserting: 5, 3, 7, 1, 4, 6, 9
    //        5
    //       / \
    //      3   7
    //     / \ / \
    //    1  4 6  9
    let root = null;
    const insertValues = [5, 3, 7, 1, 4, 6, 9];

    for (const val of insertValues) {
        root = insert(root, val);
        debugger; // ← PAUSE: tree grows one node at a time!
    }

    debugger; // ← PAUSE FINAL: complete 7-node BST
}

// ════════════════════════════════════════════════════════════════════════════
//  SECTION 6 — Graph (Adjacency List + BFS Shortest Path)
//  Expected AlgoVision view:
//    graph: nodes appear one by one — dagre re-layouts on EVERY step,
//           so ALL existing nodes shift position as the graph grows.
//    After the full graph is built, BFS runs step by step from node "A".
// ════════════════════════════════════════════════════════════════════════════
{
    // ── Step 1: Start with a single node ────────────────────────────────────
    const graph = { "A": [] };
    debugger; // ← PAUSE: graph has 1 node

    // ── Step 2: Add B, connect A → B ────────────────────────────────────────
    graph["B"] = [];
    graph["A"].push("B");
    debugger; // ← PAUSE: A → B

    // ── Step 3: Add C, connect A → C ────────────────────────────────────────
    graph["C"] = [];
    graph["A"].push("C");
    debugger; // ← PAUSE: A → B, A → C (fan-out from A)

    // ── Step 4: Add D, connect B → D and C → D (classic diamond) ───────────
    graph["D"] = [];
    graph["B"].push("D");
    graph["C"].push("D");
    debugger; // ← PAUSE: Diamond: A→B→D, A→C→D

    // ── Step 5: Add E, connect C → E ────────────────────────────────────────
    graph["E"] = [];
    graph["C"].push("E");
    debugger; // ← PAUSE: C branches to both D and E

    // ── Step 6: Add F, connect D → F and E → F ──────────────────────────────
    graph["F"] = [];
    graph["D"].push("F");
    graph["E"].push("F");
    debugger; // ← PAUSE: Two paths converge at F

    // ── Step 7: Add G, connect F → G (extend the chain) ─────────────────────
    graph["G"] = [];
    graph["F"].push("G");
    debugger; // ← PAUSE: Full 7-node DAG is complete!

    // ── BFS Shortest Path from "A" ───────────────────────────────────────────
    //  Watch the queue drain level by level — this is the core of BFS.
    const bfsOrder  = [];
    const distances = { "A": 0 };
    const queue     = ["A"];

    while (queue.length > 0) {
        const node = queue.shift();
        bfsOrder.push(node);

        debugger; // ← PAUSE BFS: node is dequeued, bfsOrder grows

        for (const neighbor of graph[node]) {
            if (!(neighbor in distances)) {
                distances[neighbor] = distances[node] + 1;
                queue.push(neighbor);
            }
        }
    }

    debugger; // ← PAUSE: BFS complete — distances holds shortest path from A to every node
}
