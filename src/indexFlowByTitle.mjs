export const indexFlowByTitle = (flow) => {
  if (!flow) throw new Error('Flow is required');

  const titleIndex = {};
  for(const [id, node] of Object.entries(flow)) {
    const title = node._meta?.title?.trim().toLowerCase();
    if (!title) continue;
    const dereferencedNode = dereferenceNode(node, id, flow);

    if (titleIndex[title] === undefined) {
      titleIndex[title] = dereferencedNode;
       continue;
    }

    if (Array.isArray(titleIndex[title])) {
      titleIndex[title].push(dereferencedNode);
      continue;
    }
      titleIndex[title] = [titleIndex[title],dereferencedNode];
    }
  return titleIndex;
};

export const rereferenceNodes = (titleIndex) => {
  for(const node of  Object.values(titleIndex)) {
    // see if any key of the index is a node in the titleIndex
    for(const [propertyName, value] of Object.entries(node)) {
      const linkId = value._meta?.originalId
      if(linkId) node[propertyName] = [linkId, 0];
    }
  }
}

const dereferenceNode = (node, id, flow) => {
  const dereferencedNode = node.inputs;
  dereferencedNode._meta = node._meta || {};
  dereferencedNode._meta.originalId = id;
  // for every input
  for(const [key, value] of Object.entries(dereferencedNode)) {
    //if the value is an array of 2 elements, with the first being a string and the second being a number
    if(Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'number') {
      // get the node that the string is referencing
      const linkedNode = flow[value[0]];
      // if the node exists, replace the reference with the node
      if(linkedNode) dereferencedNode[key] = linkedNode.inputs;
    }

  }
  return dereferencedNode;
}
