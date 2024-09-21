export const indexFlowByTitle = (flow) => {
  if (!flow) throw new Error('Flow is required');

  const titleIndex = {};

  // Iterate through each node in the flow
  Object.entries(flow).forEach(([id, node]) => {
    const title = node._meta?.title?.trim().toLowerCase();
    if (!title) return;

    // Attach the original ID to the node (if not already done elsewhere)
    node._originalId = id;

    // Index the inputs of the node by title
    if (!titleIndex[title]) {
      titleIndex[title] = node.inputs;
    } else if (Array.isArray(titleIndex[title])) {
      titleIndex[title].push(node.inputs);
    } else {
      // Convert to array if multiple nodes share the same title
      titleIndex[title] = [titleIndex[title], node.inputs];
    }
  });

  return titleIndex;
};
