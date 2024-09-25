import { get, set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';
import {progressToDimensions} from '../../src/percentToDimensions.mjs'

export default async function otter({ frame, max, flow, outputDir }) {
  const percent = frame / max;
  const [x, y, z, w, v, c] = progressToDimensions(percent, 6);
  console.log({ x, y, z, w, v, c });
  const isoDate = new Date().toISOString().split('T')[0];
  outputDir = `THE_SINK/shadow-realm-assassin/${isoDate}/2/1`;
  const basePrompt = 'Shadow Realm Assassin shrouded in darkness, wielding blades made of pure shadow. His eyes emit a faint red glow, and tattoos of dark runes cover his arms. He moves silently, leaving a trail of black mist. Spectral ravens circle above him.';
  const weights = {
    'Shadow Realm Assassin': interpolate({ min: 0.5, max: 1.5, percent: x }),
    'blades made of pure shadow': interpolate({ min: 0.5, max: 2.0, percent: y }),
    'eyes emit a faint red glow': interpolate({ min: 0.5, max: 1.8, percent: z }),
    'tattoos of dark runes cover his arms': interpolate({ min: 0.0, max: 1.5, percent: w }),
    'trail of black mist': interpolate({ min: 0.5, max: 1.5, percent: v }),
    'spectral ravens circle above him': interpolate({ min: 0.0, max: 1.2, percent: c }),
  };
  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
