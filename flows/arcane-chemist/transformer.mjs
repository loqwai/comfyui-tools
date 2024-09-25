import { set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';
import {progressToDimensions} from '../../src/percentToDimensions.mjs'

export default async function otter({ frame, max, flow, outputDir }) {
  const percent = frame / max;
  const [x, y, z, w, v, c] = progressToDimensions(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/arcane-chemist/${isoDate}/2/1`;
  const basePrompt = 'Arcane Chemist surrounded by floating vials of swirling, glowing liquids. Wears a robe adorned with alchemical symbols that shift and change. Hair crackles with magical energy, and eyes glow with different colors. Intricate apparatus of glass and metal surrounds them, with wisps of magical smoke forming equations in the air.';
  const weights = {
    'Arcane Chemist': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'floating vials of swirling, glowing liquids': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'robe adorned with alchemical symbols that shift and change': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'hair crackles with magical energy': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'eyes glow with different colors': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'intricate apparatus of glass and metal': interpolate({ min: 0.0, max: 1.2, percent: c }),
    'wisps of magical smoke forming equations': interpolate({ min: 0.0, max: 1.0, percent: x }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
