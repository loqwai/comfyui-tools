import assert from 'node:assert';

import { get, interpolate } from '../src/utils.mjs';

export default async function otter({ frame, max, template }) {
  const percent = (frame / max);
  const isoDate = new Date().toISOString().split('T')[0];
  const oldPositivePrompt = get(template, 'positive.text');
  assert(oldPositivePrompt, 'Could not find the positive prompt (should be a node titled "positive")');

  const cottonPromptWeight = interpolate(-0.5,1.5,percent);
  const fuzzyPromptWeight = interpolate(-0.5,1.5,percent);
  const cottonCandyModelStrength = interpolate(-1,0.1,percent);
  const cottonCandyClipStrength = interpolate(-1,0.1,percent);
  let prompt = oldPositivePrompt
    .replaceAll('(cottonball:1)',`(cottonball:${cottonPromptWeight})`)
    .replaceAll('(fuzzy:1)',`(fuzzy:${fuzzyPromptWeight})`)

  return {
    "cottoncandy.strength_model": cottonCandyModelStrength,
     "cottoncandy.strength_clip": cottonCandyClipStrength,
     "positive.text": prompt,
      "save.filename_prefix": `THE_SINK/otter/1/1`,
     };
}
