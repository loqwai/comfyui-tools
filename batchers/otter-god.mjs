import assert from 'node:assert';

import { get, set, interpolate } from '../src/utils.mjs';
import { weightPrompt } from '../src/weightPrompt.mjs';

export default async function otter({ frame, max, flow }) {
  const percent = (frame / max);
  const isoDate = new Date().toISOString().split('T')[0];

  const weights = [
    { token: 'cotton', weight: interpolate({ min: -0.5, max: 0.2, percent }) },
    { token: 'fuzzy', weight: interpolate({ min: -0.5, max: 0.2, percent }) },
  ];
  console.log(interpolate({ min: -0.5, max: 0.2, percent }));
  const prompt = weightPrompt(get(flow, 'positive.text'), weights);

  // set(flow, 'cottoncandy.strength_model', cottonCandyModelStrength);
  set(flow, 'cottoncandy.strength_clip', interpolate({ min: 0.1, max: 0.9, percent }));
  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', `THE_SINK/otter/debug/${isoDate}/1/1`);

  return flow;
}
