import { get, set, interpolate } from '../../src/utils.mjs';
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
  const percent = (frame / max);
  const [x,y,z,w, v, c] = getCoordinates(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/prompt-weight-interpolation/${isoDate}/2/1`;

  const weights = {
    'Fallen outer God': interpolate({ min: 0.5, max: 1.1, percent: x }),
    'Charismatic rebel leader': percent,
    'God ray eyes': interpolate({ min: 0.0, max: 2.1, percent: y }),
    'battleworn': interpolate({ min: 0.5, max: 1.8, percent: z} ),
    'Stuffed Animal': interpolate({ min: 0.0, max: 1.0, percent: w }),
    'glowing edges': interpolate({ min: 0.0, max: 1.0, percent: v }),
    'glowing crystal spear with a diamond tip': interpolate({ min: 0.5, max: 1.5, percent }),
    'ultra plush mink fur': interpolate({ min: -1.0, max: 2.0, percent: c }),
  };

  const prompt = weightPrompt({ prompt: get(flow, 'positive.text'), weights });

  // set(flow, 'cottoncandy.strength_model', cottonCandyModelStrength);
  // set(flow, 'cottoncandy.strength_clip', interpolate({ min: 0.1, max: 0.9, percent }));
  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
