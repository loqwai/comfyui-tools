import { get, set, interpolate } from '../src/utils.mjs';
import { weightPrompt } from '../src/weightPrompt.mjs';

export default async function otter({ frame, max, flow }) {
  const percent = (frame / max);
  const isoDate = new Date().toISOString().split('T')[0];

  const weights = {
    'cotton': interpolate({ min: -0.5, max: 0.2, percent }),
    'fuzzy': interpolate({ min: -0.5, max: 0.2, percent })
  };

  const prompt = weightPrompt({ prompt: get(flow, 'positive.text'), weights });

  // set(flow, 'cottoncandy.strength_model', cottonCandyModelStrength);
  set(flow, 'cottoncandy.strength_clip', interpolate({ min: 0.1, max: 0.9, percent }));
  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', `THE_SINK/otter/debug/${isoDate}/1/1`);
  console.log(prompt);
  return flow;
}
