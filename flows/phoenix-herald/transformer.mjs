import { get, set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';
import {progressToDimensions} from '../../src/percentToDimensions.mjs'

export default async function otter({ frame, max, flow, outputDir }) {
  const percent = frame / max;
  const [x, y, z, w, v, c] = progressToDimensions(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/phoenix-herald/${isoDate}/2/1`;
  const basePrompt = 'Phoenix Herald enveloped in flames that take the shape of a majestic bird. Her hair flows like fire, and wings made of embers spread wide. She carries a blazing scepter, and her eyes are molten gold. Ashes rise and form patterns around her.';
  const weights = {
    'Phoenix Herald': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'flames that take the shape of a majestic bird': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'hair flows like fire': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'wings made of embers': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'carries a blazing scepter': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'eyes are molten gold': interpolate({ min: 0.0, max: 1.2, percent: c }),
    'ashes rise and form patterns around her': interpolate({ min: 0.0, max: 1.0, percent: x }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
