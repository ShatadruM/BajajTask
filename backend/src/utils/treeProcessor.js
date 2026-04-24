export const processNodes = (data) => {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seen_edges = new Set();
  const emitted_duplicates = new Set();

  const parentMap = new Map(); // child -> parent
  const childrenMap = new Map(); // parent -> array of children
  const nodes = new Set(); // nodes successfully added to the graph

  const validEdgeRegex = /^[A-Z]->[A-Z]$/;

  // 1. Validation & Deduplication
  for (const rawItem of data) {
    if (typeof rawItem !== 'string') {
      invalid_entries.push(String(rawItem));
      continue;
    }

    const trimmed = rawItem.trim(); // Trim whitespace first [cite: 39]

    if (!validEdgeRegex.test(trimmed)) {
      invalid_entries.push(rawItem);
      continue;
    }

    const [p, c] = trimmed.split('->');
    
    // Self-loops are invalid [cite: 38]
    if (p === c) {
      invalid_entries.push(rawItem);
      continue;
    }

    // Duplicate check
    if (seen_edges.has(trimmed)) {
      if (!emitted_duplicates.has(trimmed)) {
        duplicate_edges.push(trimmed); // Push once regardless of repeats [cite: 42]
        emitted_duplicates.add(trimmed);
      }
      continue;
    }

    seen_edges.add(trimmed);

    // Diamond / multi-parent case: first-encountered wins [cite: 51]
    if (parentMap.has(c)) {
      continue; // Silently discard subsequent parent edges [cite: 52]
    }

    // Successfully add edge to graph
    parentMap.set(c, p);
    if (!childrenMap.has(p)) {
      childrenMap.set(p, []);
    }
    childrenMap.get(p).push(c);
    nodes.add(p);
    nodes.add(c);
  }

  // 2. Component Construction & Cycle Detection
  const visited = new Set();
  const hierarchies = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = null;
  let max_depth = 0;

  // Roots are nodes that never appear as a child [cite: 47]
  const roots = [...nodes].filter(n => !parentMap.has(n)).sort();

  // Recursive function to build tree and calculate depth [cite: 58]
  const buildTree = (node) => {
    const tree = {};
    const visitedNodes = [node];
    let maxChildDepth = 0;

    const children = childrenMap.get(node) || [];
    children.sort(); // Lexicographical ordering for cleaner output

    for (const child of children) {
      const childResult = buildTree(child);
      tree[child] = childResult.tree;
      maxChildDepth = Math.max(maxChildDepth, childResult.depth);
      visitedNodes.push(...childResult.visitedNodes);
    }

    return { tree, depth: 1 + maxChildDepth, visitedNodes };
  };

  // Process Valid Trees
  
  for (const root of roots) {
    const { tree, depth, visitedNodes } = buildTree(root);
    visitedNodes.forEach(n => visited.add(n));
    
    // FIX: Wrap the constructed children inside the root node key to match the spec
    const wrappedTree = { [root]: tree };

    hierarchies.push({ root, tree: wrappedTree, depth });
    total_trees++;

    // Summary logic: largest_tree_root
    if (depth > max_depth) {
      max_depth = depth;
      largest_tree_root = root;
    } else if (depth === max_depth && largest_tree_root) {
      if (root < largest_tree_root) { // Tie-breaker
        largest_tree_root = root;
      }
    } else if (!largest_tree_root) {
      largest_tree_root = root;
    }
  }

  // Process Cyclic Groups (Nodes that weren't reached from any root)
  const getConnectedComponent = (startNode) => {
    const group = [];
    const queue = [startNode];
    const seenGroup = new Set([startNode]);

    while (queue.length > 0) {
      const curr = queue.shift();
      group.push(curr);

      if (parentMap.has(curr)) {
        const p = parentMap.get(curr);
        if (!seenGroup.has(p)) {
          seenGroup.add(p);
          queue.push(p);
        }
      }
      if (childrenMap.has(curr)) {
        for (const c of childrenMap.get(curr)) {
          if (!seenGroup.has(c)) {
            seenGroup.add(c);
            queue.push(c);
          }
        }
      }
    }
    return group;
  };

  let unvisited = [...nodes].filter(n => !visited.has(n));
  while (unvisited.length > 0) {
    const startNode = unvisited[0];
    const groupNodes = getConnectedComponent(startNode);
    groupNodes.forEach(n => visited.add(n));

    // Lexicographically smallest node becomes root of the cycle [cite: 50]
    const groupRoot = groupNodes.sort()[0];
    hierarchies.push({ root: groupRoot, tree: {}, has_cycle: true }); // No depth for cycles [cite: 55]
    total_cycles++;

    unvisited = [...nodes].filter(n => !visited.has(n));
  }

  // To guarantee deterministic ordering matching exactly the PDF output order
  // (Not strictly required, but looks cleaner)
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  return {
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root
    }
  };
};