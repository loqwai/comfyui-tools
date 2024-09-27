#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { get, set } from './src/utils.mjs';
import { weightPrompt } from './src/weightPrompt.mjs';
import assert from 'node:assert';

// Timeout function
const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log("Script started");

// Argument parsing using Node's native `parseArgs`
const opts = parseArgs({
  options: {
    transformer: { type: 'string', short: 't', description: 'Name of the transformer to be imported' },
    flow: { type: 'string', short: 'l', description: 'Path to the flow JSON file' },
    url: { type: 'string', short: 'u', description: 'Base URL to send the flow to' },
    count: { type: 'string', short: 'c', description: 'Number of frames to process', default: '4' },
    start: { type: 'string', short: 's', description: 'Frame number to start at (default: 0)', default: '0' },
    dryRun: { type: 'boolean', short: 'd', description: 'Perform a dry run (no post request)' },
    output: { type: 'string', short: 'o', description: "Suggest where the output image should go" },
    help: { type: 'boolean', short: 'h', description: 'Display this help message' }
  },
  allowPositionals: true,
  strict: false
});

console.log("Arguments parsed:", opts);

let { help, transformer, flow, url, count: countStr, start: startStr, dryRun, output } = opts.values;
const [positional] = opts.positionals;  // Positional argument

url = url ?? 'http://localhost:8188'; // Default URL

console.log("Parsed options:", { help, transformer, flow, url, countStr, startStr, dryRun, output, positional });

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
let stat;
try {
  stat = await fs.lstat(positional);
  console.log("Stat result:", stat);
} catch (error) {
  console.log("Error getting stat:", error);
  stat = null;
}

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

console.log("Final transformer and flow paths:", { transformer, flow });

assert(typeof countStr === 'string', 'count should be a number');
assert(typeof startStr === 'string', 'start should be a number');
const count = parseInt(countStr, 10);
const start = startStr ? parseInt(startStr, 10) : 0;

console.log("Parsed count and start:", { count, start });

try {
  await main({ transformer, url, count, start, dryRun, tmpl: flow, outputDir: output });
} catch (error) {
  console.error("Error in main function:", error);
}

async function main({ transformer, url, count, start, dryRun, tmpl, outputDir }) {
  console.log("Main function started with:", { transformer, url, count, start, dryRun, tmpl, outputDir });

  // Load the flow and transformer
  let t, transformerModule;
  try {
    [t, transformerModule] = await Promise.all([
      fs.readFile(tmpl, 'utf-8'),
      import(path.resolve(transformer))
    ]);
    console.log("Flow and transformer loaded");
  } catch (error) {
    console.error("Error loading flow or transformer:", error);
    return;
  }

  let { make, fn, default: defaultFunc } = transformerModule;

  if (defaultFunc) fn = defaultFunc;
  if (!fn && make) fn = await make();

  assert(fn, 'The transformer must return a valid function.');

  const template = JSON.parse(t);

  let postCount = 0;
  const processFlow = async (flow) => {
    if (dryRun) return console.log(JSON.stringify(flow, null, 2));

    const res = await fetch(`${url}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: flow, extra_data: { frame: postCount, api_flow: flow } })
    });
    if (!res.ok) throw new Error(`Failed to send the flow to comfyui: ${res.statusText}`);
    const msg = await res.text();
    console.log(`Flow ${postCount + 1}: ${msg}`);

    postCount++;
    if (postCount % 100 === 0) {
      console.log('Pausing for 20 seconds...');
      await timeout(20000);
    } else {
      await timeout(100);
    }
  };

  for (let frame = start; frame < start + count; frame++) {
    console.log(`Processing frame ${frame}`);
    const flowResult = await fn({
      frame,
      max: count - 1,
      flow: structuredClone(template),
      outputDir,
      get,
      set,
      weightPrompt,
    });

    if (Array.isArray(flowResult)) {
      console.log(`Received array of ${flowResult.length} flows`);
      for (const flow of flowResult) {
        await processFlow(flow);
      }
    } else {
      console.log(`Received single flow`);
      await processFlow(flowResult);
    }
  }

  console.log("Main function completed");
}

console.log("Script ended");
