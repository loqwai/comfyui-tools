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
  outputDir = `THE_SINK/void-alchemist/${isoDate}/2/1`;
  const basePrompt = 'Void Alchemist experimenting with flasks containing miniature galaxies. His cloak is a tapestry of the cosmos, and he wears a mask that reflects the abyss. Hands glow with ethereal energy as he manipulates the fabric of reality. Floating formulae and equations surround him.';
  const weights = {
    'Void Alchemist': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'flasks containing miniature galaxies': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'cloak is a tapestry of the cosmos': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'mask that reflects the abyss': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'hands glow with ethereal energy': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'floating formulae and equations surround him': interpolate({ min: 0.0, max: 1.2, percent: c }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
