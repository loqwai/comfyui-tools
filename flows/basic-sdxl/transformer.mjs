import { set, resolveRelativePath } from '../../src/utils.mjs';
import fs from 'fs/promises';
import path from 'path';

function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_,]+/g, '-')
    .toLowerCase()
    .trim();
}

export default async function promptComparisonTransformer({ frame, max, flow, outputDir }) {
  const promptsDir = resolveRelativePath('./prompts');
  const files = await fs.readdir(promptsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const flows = [];

  for (const file of jsonFiles) {
    const filePath = path.join(promptsDir, file);
    const configData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    const { prompt, localPrompt, negativePrompt } = configData;

    // Ensure output directory exists
    const baseOutputDir = outputDir || './prompts';
    await fs.mkdir(baseOutputDir, { recursive: true });

    // Create flows subdirectory
    const flowsOutputDir = path.join(baseOutputDir, 'flows');
    await fs.mkdir(flowsOutputDir, { recursive: true });

    const fileNamePrefix = kebabCase(localPrompt);

    // Create three flows for each file
    const fileFlows = [
      // Flow 1: Local prompt
      structuredClone(flow),
      // Flow 2: AI prompt
      structuredClone(flow),
      // Flow 3: AI prompt with negative
      structuredClone(flow)
    ];

    const flowTypes = ['local', 'ai', 'ai_with_negative'];
    const prompts = [localPrompt, prompt, prompt];
    const negativePrompts = ['', '', negativePrompt];

    for (let i = 0; i < 3; i++) {
      const currentFlow = fileFlows[i];
      const flowType = flowTypes[i];
      const fullFileNamePrefix = path.join(baseOutputDir, `${fileNamePrefix}_${flowType}`);

      set(currentFlow, 'loader.positive', prompts[i]);
      set(currentFlow, 'loader.negative', negativePrompts[i]);
      set(currentFlow, 'save.filename_prefix', fullFileNamePrefix);

      // Save the flow as a JSON file in the flows subdirectory
      const flowJsonPath = path.join(flowsOutputDir, `${fileNamePrefix}_${flowType}.json`);
      await fs.writeFile(flowJsonPath, JSON.stringify(currentFlow, null, 2), 'utf-8');

      console.log(`Flow saved to: ${flowJsonPath}`);
    }

    flows.push(...fileFlows);

    console.log(`Processing file: ${file}`);
    console.log(`Local Prompt: ${localPrompt}`);
    console.log(`AI Prompt: ${prompt}`);
    console.log(`AI Prompt with Negative: ${prompt} (Negative: ${negativePrompt})`);
  }

  return flows;
}
