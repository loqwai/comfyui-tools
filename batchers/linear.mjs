import { set } from '../utils.mjs';

const linear = async ({ frame, max, flow }) => {
  const percent = frame / max;
  const isoDate = new Date().toISOString().split('T')[0];

  // Use set to modify the flow directly
  set(flow, 'sampler.inputs.noise_seed', Math.floor(percent * 1000));
  set(flow, 'save.inputs.filename_prefix', `THE_SINK/batching-cli/${isoDate}/1`);

  // Return the modified flow
  return flow;
};

export default linear;
