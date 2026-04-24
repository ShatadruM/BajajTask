import { processNodes } from '../src/utils/treeProcessor.js';

describe('Tree Processor Logic', () => {
  it('should process the PDF example correctly', () => {
    const input = [
      "A->B", "A->C", "B->D", "C->E", "E->F", 
      "X->Y", "Y->Z", "Z->X", 
      "P->Q", "Q->R", 
      "G->H", "G->H", "G->I", 
      "hello", "1->2", "A->"
    ];
    
    const result = processNodes(input);

    // Validate Invalid Entries
    expect(result.invalid_entries).toEqual(expect.arrayContaining(["hello", "1->2", "A->"]));

    // Validate Duplicate Edges
    expect(result.duplicate_edges).toEqual(["G->H"]);

    // Validate Summary
    expect(result.summary.total_trees).toBe(3);
    expect(result.summary.total_cycles).toBe(1);
    expect(result.summary.largest_tree_root).toBe("A");

    // Validate Hierarchies
    const treeA = result.hierarchies.find(h => h.root === 'A');
    expect(treeA.depth).toBe(4);
    expect(treeA.tree).toHaveProperty('B.D');
    
    const cycleX = result.hierarchies.find(h => h.root === 'X');
    expect(cycleX.has_cycle).toBe(true);
    expect(cycleX.tree).toEqual({});
  });

  it('should treat self-loops as invalid', () => {
    const result = processNodes(["A->A", "B->C"]);
    expect(result.invalid_entries).toContain("A->A");
    expect(result.summary.total_trees).toBe(1);
  });

  it('should handle diamond/multi-parent case by keeping the first edge', () => {
    // B->D is first, A->D should be silently discarded. 
    // This leaves D attached to B, making A a tree of depth 1 (if it had other children) or isolated.
    const result = processNodes(["B->D", "A->D", "A->C"]);
    
    const treeA = result.hierarchies.find(h => h.root === 'A');
    const treeB = result.hierarchies.find(h => h.root === 'B');

    expect(treeB.tree).toHaveProperty('D');
    expect(treeA.tree).not.toHaveProperty('D');
    expect(treeA.tree).toHaveProperty('C');
  });

  it('should handle multiple duplicate edges correctly (output only once)', () => {
    const result = processNodes(["A->B", "A->B", "A->B", "A->B"]);
    expect(result.duplicate_edges).toEqual(["A->B"]);
    expect(result.summary.total_trees).toBe(1);
  });

  it('should resolve largest_tree_root tiebreaker lexicographically', () => {
    // Both trees have depth 2. 'M' and 'K'. 'K' should win.
    const result = processNodes(["M->N", "K->L"]);
    expect(result.summary.largest_tree_root).toBe("K");
  });
});