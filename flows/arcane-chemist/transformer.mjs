import { set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';

const getCoordinates = (percent, dimensions) => {
  const coordinates = [];

  for (let i = 0; i < dimensions; i++) {
    const coord = percent % 1;  // Get the fractional part for the current dimension
    coordinates.push(coord);
    percent *= dimensions;      // Scale the percent for the next dimension
  }
  return coordinates;
};

export default async function otter({ frame, max, flow, outputDir }) {
  const percent = frame / max;
  const [x, y, z, w, v, c] = getCoordinates(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/celestial-blade-dancer/${isoDate}/2/1`;
  const basePrompt = 'Celestial Blade Dancer, wielding twin swords forged from moonlight, with flowing robes made of stardust. Her eyes glow with the light of distant galaxies, and a halo of floating runic symbols orbits her head. She moves gracefully atop a shimmering aurora, leaving trails of light in her wake.';
  const weights = {
    'Celestial Blade Dancer': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'twin swords forged from moonlight': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'flowing robes made of stardust': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'eyes glow with the light of distant galaxies': interpolate({ min: 0.5, max: 2.0, percent: w }),
    'halo of floating runic symbols': interpolate({ min: 0.0, max: 1.5, percent: v }),
    'shimmering aurora': interpolate({ min: 0.5, max: 1.5, percent: c }),
    'trails of light': interpolate({ min: 0.0, max: 1.0, percent: x }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
