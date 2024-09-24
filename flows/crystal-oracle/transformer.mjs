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
  outputDir = `THE_SINK/crystal-oracle/${isoDate}/2/1`;
  const basePrompt = 'Crystal Oracle seated upon a throne of glowing crystals. Her skin is translucent, revealing a constellation within. She holds a crystal ball swirling with mist, and her hair cascades as strands of fiber optic light. Floating shards orbit her, reflecting rainbows.';
  const weights = {
    'Crystal Oracle': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'throne of glowing crystals': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'skin is translucent, revealing a constellation within': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'crystal ball swirling with mist': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'hair cascades as strands of fiber optic light': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'floating shards orbit her, reflecting rainbows': interpolate({ min: 0.0, max: 1.2, percent: c }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
