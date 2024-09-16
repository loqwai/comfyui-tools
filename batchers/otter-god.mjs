import { get, set, interpolate } from '../src/utils.mjs';
import { weightPrompt } from '../src/weightPrompt.mjs';

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

export default async function otter({ frame, max, flow, outputDir }) {
  const percent = (frame / max);
  const isoDate = new Date().toISOString()
  outputDir ??= `THE_SINK/otters/tmp/${isoDate}`;

  const weights = {
  };

  const prompt = weightPrompt({ prompt: get(flow, 'positive.text'), weights });

  // set(flow, 'cottoncandy.strength_model', cottonCandyModelStrength);
  // set(flow, 'cottoncandy.strength_clip', interpolate({ min: 0.1, max: 0.9, percent }));
  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  set(flow,'sampler.cfg', interpolate({ min: 3, max: 9, percent }));
  console.log(prompt);
  return flow;
}
