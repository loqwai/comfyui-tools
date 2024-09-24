import { get, set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';

const getCoordinates = (percent, dimensions) => {
  const coordinates = [];

  for (let i = 0; i < dimensions; i++) {
    const coord = percent % 1;
    coordinates.push(coord);
    percent *= dimensions;
  }
  return coordinates;
};

export default async function otter({ frame, max, flow, outputDir }) {
  const percent = frame / max;
  const [x, y, z, w, v, c] = getCoordinates(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/netherworld-emissary/${isoDate}/2/1`;
  const basePrompt = 'Netherworld Emissary clad in armor made of dark obsidian. He carries a lantern that holds a captive wisp, and his eyes are hollow voids emitting smoke. Chains of spectral energy wrap around him, and shadowy figures reach out from portals at his feet.';
  const weights = {
    'Netherworld Emissary': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'armor made of dark obsidian': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'lantern that holds a captive wisp': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'eyes are hollow voids emitting smoke': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'chains of spectral energy wrap around him': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'shadowy figures reach out from portals at his feet': interpolate({ min: 0.0, max: 1.2, percent: c }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
