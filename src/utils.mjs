import setValue from 'set-value';
import getValue from 'get-value';



export const interpolate = ({min,max,percentage}) => {
  return min + (max - min) * percentage;
}
// below is some chatgpt nonsense.

// Helper function to get nodes by title in lowercase
const getNodesByTitle = (flow, title) => {
  if(flow === undefined) throw new Error('Flow is required');
  if(title === undefined) throw new Error('Title is required');

  const normalizedTitle = title.trim().toLowerCase();
  return Object.values(flow).filter(
    (node) => node._meta?.title?.trim().toLowerCase() === normalizedTitle
  );
};

// `set` function to deeply set values using dot notation
export const set = (flow, path, value) => {
  if(flow === undefined) throw new Error('Flow is required');
  if(path === undefined) throw new Error('Path is required');
  if(value === undefined) throw new Error('Value is required');

  const [title, ...fieldPath] = path.split('.');
  const nodes = getNodesByTitle(flow, title);

  nodes.forEach((node) => {
    setValue(node, `inputs.${fieldPath.join('.')}`, value);
  });
};

// `get` function to deeply retrieve values using dot notation
export const get = (flow, path) => {
  if(flow === undefined) throw new Error('Flow is required');
  if(path === undefined) throw new Error('Path is required');

  const [title, ...fieldPath] = path.split('.');
  const nodes = getNodesByTitle(flow, title);

  const values = nodes.map((node) => getValue(node, `inputs.${fieldPath.join('.')}`));
  if(values.length === 0) return undefined;
  if(values.length === 1) return values[0];
  return values;
};
