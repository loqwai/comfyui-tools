import assert from 'node:assert';

import { get, set, interpolate, weightPrompt } from '../src/utils.mjs';

export default async function otter({ frame, max, flow }) {
  const percent = (frame / max);
  const isoDate = new Date().toISOString().split('T')[0];
  assert(oldPositivePrompt, 'Could not find the positive prompt (should be a node titled "positive")');

  const weights = [
    { token: 'cotton', weight: interpolate(-0.5,1.5,percent) },
    { token: 'fuzzy', weight:  interpolate(-0.5,1.5,percent) },
  ];
  const cottonCandyModelStrength = interpolate(-1,0.1,percent);
  const cottonCandyClipStrength = interpolate(-1,0.1,percent);

  const prompt = weightPrompt(get(flow, 'positive.text'), weights);

  set(flow, 'cottoncandy.strength_model', cottonCandyModelStrength);
  set(flow, 'cottoncandy.strength_clip', cottonCandyClipStrength);
  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', `THE_SINK/otter/1/1`);

  return flow;
}
