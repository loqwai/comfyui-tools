import { resolveRelativePath, get, set } from '../../src/utils.mjs';
import fs from 'fs/promises';
import path from 'path';

export default async function passthroughTransformer({ frame, max, flow, outputDir })   {
const promptsDir = resolveRelativePath('./prompts');
  const files = await fs.readdir(promptsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const flows = [];

  for (const file of jsonFiles) {
    console.log('file', file);
    const filePath = path.join(promptsDir, file);
    let configData
    try {
      configData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      console.log(get(configData, 'save.file_prefix'));
      flows.push(configData);
    } catch (error) {
           console.error(`Error parsing ${file}: ${error}`);
      continue;
    }
  }
  return flows;
}
