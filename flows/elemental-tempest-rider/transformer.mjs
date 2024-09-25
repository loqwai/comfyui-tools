import { get, set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';

const percentToDimensions = (percent, dimensions) => {
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
  const [x, y, z, w, v, c] = percentToDimensions(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/elemental-tempest-rider/${isoDate}/2/1`;
  const basePrompt = 'Elemental Tempest Rider mounted on a dragon made of storm clouds. Armor crackles with lightning, and a tornado swirls around his spear. His eyes shine like the sun, and he leaves a path of swirling elements—fire, water, earth, and air—in his wake.';
  const weights = {
    'Elemental Tempest Rider': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'dragon made of storm clouds': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'armor crackles with lightning': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'tornado swirls around his spear': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'eyes shine like the sun': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'path of swirling elements': interpolate({ min: 0.0, max: 1.2, percent: c }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
