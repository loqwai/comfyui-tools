export default async function linear({frame,max}) {
  const percent = ((frame + 1) / max);
  console.log(percent);
  return { "Sampler.node_seed": Math.floor(percent * 1000), "save.filename_prefix": `THE_SINK/batching-cli/1/1` };
}
