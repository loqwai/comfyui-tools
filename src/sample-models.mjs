import { promises as fs } from 'node:fs';

const interpolate = ({min,max,percent}) =>  min + (max - min) * percent;
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// ease in out slower
const easeInOutQuint = (t) => {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
};

const easeIn = (t) => {
  return t * t;
}

export default async function otter({ frame, max, flow, outputDir, get, set, weightPrompt }) {
  // get a list of all files in ' /mnt/c/Users/iam/pinokio/api/comfyui.git.bak/app/models/checkpoints'
  const files = await fs.readdir('/mnt/c/Users/iam/pinokio/api/comfyui.git.bak/app/models/checkpoints');
  let checkpoints = []
  for(const file of files) {
    // if it isn't a directory, add it to the list
    if(file.includes('.')) checkpoints.push(file);
  }
  // filter to only 'xl'
  checkpoints = checkpoints.filter(checkpoint => checkpoint.includes('xl'));
  const percent = (frame / max);
  // figure out which one to use, based on percent
  const checkpoint = checkpoints[Math.floor(easeInOutQuint(percent) * checkpoints.length)];


  const isoDate = new Date().toISOString().split('T')[0];
  const seed = get(flow, 'sampler.seed');
  outputDir ??= `${isoDate}/cli/${checkpoint.split('.')[0]}/${seed}`;

  set(flow, 'checkpoint.ckpt_name', checkpoint);
  set(flow, 'save.filename_prefix', outputDir);
  // console.log where the output would be
  console.log({checkpoint, outputDir, seed})
  return flow;
}
