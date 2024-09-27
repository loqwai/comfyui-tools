import { get, set, interpolate, resolveRelativePath } from '../../src/utils.mjs';
import { weightPrompt } from '../../src/weightPrompt.mjs';
import { getCoordinates } from '../../src/progressToDimensions.mjs';
import fs from 'fs'; // Use 'fs/promises' for asynchronous reading if needed
import { parseArgs } from 'node:util';

export default async function otter({ frame, max, flow, outputDir }) {
  // Parse command-line arguments
  const { values } = parseArgs({
    options: {
      character: {
        type: 'string',
      },
      help: {
        type: 'boolean',
      },
    },
    strict: false
  });

  if (values.help) {
    console.error('Usage: simple-character-creater --character <path-to-character-config>');
    process.exit(-1);
  }

  let characterPath = values.character;

  // If characterPath is undefined or just set to 'true', default to character directory
  if (characterPath === undefined || characterPath === true || characterPath === false) {
    console.error('Character config path is required (--character ./flows/simple-character-creator/characters/crystal-oracle.json)');
    set(flow, 'lora.lora_name', 'Character config path is required (--character ./flows/simple-character-creator/characters/crystal-oracle.json)');
    process.exit(-1);
  }

  // Assume that if it's just a name, it's in the default characters directory
  if (!characterPath.includes('/')) {
    characterPath = `./flows/simple-character-creator/characters/${characterPath}`;
  }

  // Ensure the file ends with .json
  if (!characterPath.endsWith('.json')) {
    characterPath += '.json';
  }

  characterPath = resolveRelativePath(characterPath);

  console.log(`Character file path: ${characterPath}`);

  if (!fs.existsSync(characterPath)) {
    console.error(`Character file not found: ${characterPath}`);
    set(flow, 'lora.lora_name', 'Character config path is required (--character ./flows/simple-character-creator/characters/crystal-oracle.json)');
    process.exit(-1);
  }

  // Read the JSON configuration file
  const configData = JSON.parse(fs.readFileSync(characterPath.toString(), 'utf-8'));

  const getCharacterName = () => {
    if (configData.characterName) {
      return configData.characterName;
    }
    // Get the name of the character from the file name
    return characterPath.replace('.json', '').split('/').pop();
  };

  const basePrompt = configData.prompt;
  const tokens = configData.tokens;

  // Determine the number of dimensions based on the number of tokens
  const dimensions = Object.keys(tokens).length;
  const coordinates = getCoordinates({ current: frame, max, dimensions });

  const isoDate = new Date().toISOString().split('T')[0];

  // find the file with the highest numerical prefix in the directory
  // increment it by 1 and use that as the filename_prefix
  let latestBatch = 0;
  // try to read from a `tmp/<characterName>.json` file. If it exists, take the property `latestBatch` from it
  // if it doesn't, create it with `latestBatch` set to 0
  let tmpFile = resolveRelativePath(`./tmp/character_state/`);
  // if the folder doesn't exist, create it
  if (!fs.existsSync(tmpFile)) {
    fs.mkdirSync(tmpFile, { recursive: true });
  }

  tmpFile += `${getCharacterName()}.json`;

  if (fs.existsSync(tmpFile)) {
    const tmpData = JSON.parse(fs.readFileSync(tmpFile.toString(), 'utf-8'));
    latestBatch = tmpData.latestBatch;
  } else {
    fs.writeFileSync(tmpFile, JSON.stringify({ latestBatch: 0 }, null, 2));
  }

  const ourBatch = latestBatch + 1;
  console.log({ourBatch})
  outputDir = outputDir ?? configData.outputDir ?? `./simple-character-creator/characters/${getCharacterName()}/${isoDate}/${ourBatch}/${getCharacterName()}`;
  // create the output directory if it doesn't exist, recursively
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('outputDir', outputDir);

  // Build the weights object dynamically
  const weights = {};
  let index = 0;
  for (const [token, params] of Object.entries(tokens)) {
    const { min, max } = params;
    const coord = coordinates[index];
    weights[token] = interpolate({ min, max, percent: coord });
    index++;
  }

  const prompt = weightPrompt({ prompt: basePrompt, weights });

  set(flow, 'positive.text', prompt);
  set(flow, 'save.filename_prefix', outputDir);
  console.log(prompt);

  if (frame === max) {
    latestBatch++;
    fs.writeFileSync(tmpFile, JSON.stringify({ latestBatch }, null, 2));
  }

  return flow;
}
