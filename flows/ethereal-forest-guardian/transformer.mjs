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
  outputDir = `THE_SINK/ethereal-forest-guardian/${isoDate}/2/1`;
  const basePrompt = 'Ethereal Forest Guardian with antlers intertwined with vines and flowers. Her skin is bark-like with glowing glyphs, and eyes resemble deep forest pools. She commands the spirits of ancient trees, and woodland creatures gather at her feet. A mist of luminescent spores surrounds her.';
  const weights = {
    'Ethereal Forest Guardian': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'antlers intertwined with vines and flowers': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'bark-like skin with glowing glyphs': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'eyes resemble deep forest pools': interpolate({ min: 0.5, max: 2.0, percent: w }),
    'spirits of ancient trees': interpolate({ min: 0.0, max: 1.5, percent: v }),
    'woodland creatures gather at her feet': interpolate({ min: 0.5, max: 1.5, percent: c }),
    'mist of luminescent spores surrounds her': interpolate({ min: 0.0, max: 1.0, percent: x }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
