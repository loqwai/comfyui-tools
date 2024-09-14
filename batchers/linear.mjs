export default async function linear({frame,max}) {
  const percent = (frame / max);
  console.log(percent);
  const isoDate = new Date().toISOString().split('T')[0];
  return { "Sampler.noise_seed": Math.floor(percent * 1000), "save.filename_prefix": `THE_SINK/batching-cli/${isoDate}/1` };
}
