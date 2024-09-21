#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {indexFlowByTitle, titleIndexToFlow} from './src/utils.mjs';

// Argument parsing using Node's native `parseArgs`
const opts = parseArgs({
  options: {
    transformer: { type: 'string', short: 't', description: 'Name of the transformer to be imported' },
    flow: { type: 'string', short: 'l', description: 'Path to the flow JSON file' },
    url: { type: 'string', short: 'u', description: 'Base URL to send the flow to' },
    count: { type: 'string', short: 'c', description: 'Number of frames to process' },
    start: { type: 'string', short: 's', description: 'Frame number to start at (default: 0)' },
    dryRun: { type: 'boolean', short: 'd', description: 'Perform a dry run (no post request)' },
    output: { type: 'string', short: 'o', description: "Suggest where the output image should go" },
    help: { type: 'boolean', short: 'h', description: 'Display this help message' }
  },
  allowPositionals: true
});

let { help, transformer, flow, url, count: countStr, start: startStr, dryRun, output } = opts.values;
const [positional] = opts.positionals;  // Positional argument

url = url ?? 'http://localhost:8188'; // Default URL

// Handle help display
if (help) {
  console.log(`
    Usage: node script.js [directory|flow.json] [options]

    If [directory] is provided, it should contain transformer.mjs and flow.json.
    Alternatively, you can specify a flow JSON and transformer via --flow and --transformer.

    Options:
      --transformer, -t  Path to the transformer file (default: transformer.mjs in directory)
      --flow, -l         Path to the flow JSON file (default: flow.json in directory)
      --url, -u          Base URL to send the flow to
      --count, -c        Number of frames to process
      --start, -s        Frame number to start at (default: 0)
      --dryRun, -d       Perform a dry run (no post request)
      --output, -o       Suggest where the output image should go
      --help, -h         Display this help message
  `);
  process.exit(0);
}

// Set defaults if positional argument is a directory
const stat = await fs.lstat(positional).catch(() => null);

// Early return if both transformer and flow are not provided, and positional isn't a directory
if (!stat?.isDirectory() && (!transformer || !flow)) {
  console.error('Error: You must specify both --transformer and --flow when not providing a directory.');
  process.exit(1);
}

// Set default transformer and flow if positional is a directory
if (stat?.isDirectory()) {
  transformer = transformer ?? path.join(positional, 'transformer.mjs');
  flow = flow ?? path.join(positional, 'flow.json');
}


const count = parseInt(countStr, 10);
const start = startStr ? parseInt(startStr, 10) : 0;

await main({ transformer, url, count, start, dryRun, tmpl: flow, outputDir: output });

async function main({ transformer, url, count, start, dryRun, tmpl, outputDir }) {
  // Load the flow and transformer
  let [t, { make, fn, default: defaultFunc }] = await Promise.all([
    fs.readFile(tmpl, 'utf-8'),
    import(path.resolve(transformer))
  ]);

  if (defaultFunc) fn = defaultFunc;
  if (!fn && make) fn = await make();
  if (!fn) throw new Error('The transformer must return a valid function.');

  const template = indexFlowByTitle(JSON.parse(t));

  const prevFrames = [];

  const processFrame = async (frameNum) => {
    const templateCopy = structuredClone(template);

    const flow = await fn({
      frame: frameNum,
      max: count,
      flow: templateCopy,
      prev: prevFrames,
      outputDir,
    });

    prevFrames.push(flow);
    const newFlow = titleIndexToFlow(flow);
    if (dryRun) return console.log(JSON.stringify(flow, null, 2));

    const res = await fetch(`${url}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: newFlow })
    });

    if (!res.ok) throw new Error(`Failed to send the flow to comfyui: ${res.statusText}`);
    const msg = await res.text();
    console.log(`Frame ${frameNum}: ${msg}`);
  };

  if (dryRun) return await processFrame(start);

  for (let i = start; i < start + count; i++) {
    await processFrame(i);
  }
}
