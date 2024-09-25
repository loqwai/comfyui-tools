import { get, set, interpolate } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';
import {progressToDimensions} from '../../src/progressToDimensions.mjs'
import assert from 'node:assert';
import fs from 'fs'; // Use 'fs/promises' for asynchronous reading if needed
import { parseArgs } from 'node:util';
export default async function otter({ frame, max, flow }) {
  const percent = frame / max;
  // Parse command-line arguments
  const { values } = parseArgs({
    options: {
      character: {
        type: 'string',
      }
    },
    strict: false
  });

  const configPath = values.character;
  // Read the JSON configuration file
  const configData = JSON.parse(fs.readFileSync(configPath.toString(), 'utf-8'));
  const basePrompt = configData.prompt;
  const tokens = configData.tokens;

  // Determine the number of dimensions based on the number of tokens
  const dimensions = Object.keys(tokens).length;
  const coordinates = progressToDimensions(percent, dimensions);
  console.log({ coordinates });

  const isoDate = new Date().toISOString().split('T')[0];
  const outputDir = `THE_SINK/${configData.outputDir || 'default'}/${isoDate}/2/1`;

  // Build the weights object dynamically
  const weights = {};
  let index = 0;
  for (const [token, params] of Object.entries(tokens)) {
    const { min, max } = params;
    const coord = coordinates[index];
    assert(coord !== undefined, `Coordinate for ${token} is undefined`);
    weights[token] = interpolate({ min, max, percent: coord });
    index++;
  }

  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);
  return flow;
}
