export default async function linear({frame,max}) {
  const percent = (frame / max);
  console.log(percent);
  return { "Sampler.noise_seed": Math.floor(percent * 1000), "save.filename_prefix": `THE_SINK/batching-cli/1/1` };
}
