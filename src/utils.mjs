/**
 * Interpolates between min and max values based on a percentage.
 * @param {{ min: number, max: number, percent: number }} params - An object containing the min, max, and percent values.
 */
export const interpolate = ({min,max,percent}) =>  min + (max - min) * percent;
// below is some chatgpt nonsense.

export const indexFlowByTitle = (flow) => {
  if (!flow) throw new Error('Flow is required');

  const titleIndex = {};
  for(const [id, node] of Object.entries(flow)) {
    const title = node._meta?.title?.trim().toLowerCase();
    if (!title) continue;
    const dereferencedNode = dereferenceNode(node, flow);

    if (titleIndex[title] === undefined) {
      titleIndex[title] =dereferencedNode;
       continue;
    }

    if (Array.isArray(titleIndex[title])) {
      titleIndex[title].push(dereferencedNode);
      continue;
    }
      titleIndex[title] = [titleIndex[title],dereferencedNode];
    }
  // now check if a property is connected to a node, and if it is, replace the link with a reference to the new node.
};

const titleIndexToFlow(titleIndex, flow) {
  for(const [_, node] of Object.entries(titleIndex)) {
    flow[node._meta.originalId].inputs = node;

  }

  return flow;
}

const dereferenceNode = (node, flow) => {
  const dereferencedNode = node.inputs;

  // for every input
  for(const [key, value] of Object.entries(dereferencedNode)) {
    //if the value is an array of 2 elements, with the first being a string and the second being a number
    if(Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'number') {
      // get the node that the string is referencing
      const referencedNode = flow[value[0]];
      // if the node exists, replace the reference with the node
      if(referencedNode) dereferencedNode[key] = referencedNode;
    }

  }
  return dereferencedNode;
}
