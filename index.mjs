#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

// Argument parsing using Node's native `parseArgs`
const opts = parseArgs({
  options: {
    func: { type: 'string', short: 'f', description: 'Name of the function to be imported from batchers' },
    url: { type: 'string', short: 'u', description: 'Base URL to send the template to' },
    count: { type: 'string', short: 'c', description: 'Number of frames to process' },
    start: { type: 'string', short: 's', description: 'Frame number to start at (default: 0)' },
    dryRun: { type: 'boolean', short: 'd', description: 'Perform a dry run (no post request)' },
    output: { type: 'string', short: 'o', description: "'Suggests' to the function specified where you'd like the output image to go. But it's up to the functions implementation." },
    help: { type: 'boolean', short: 'h', description: 'Display this help message' }
  },
  allowPositionals: true
});

const { help, func, url, count: countStr, start: startStr, dryRun, output } = opts.values;
const [tmpl] = opts.positionals;  // Template is the positional argument

const problem = !tmpl || !func || !url || !countStr;

// Display help if the --help or -h flag is provided
//if the requ
if (help || problem) {
  console.log(`
    Usage: node script.js [template] [options]

    template: Path to the JSON template file (positional argument)

    Options:
      --func, -f     Name of the function to be imported from batchers
      --url, -u      Base URL to send the template to
      --count, -c    Number of frames to process
      --start, -s    Frame number to start at (default: 0)
      --dryRun, -d   Perform a dry run (no post request)
      --output, -o   'Suggests' to whatever 'batcher' your using where you'd like the output to go. But it's up to the batcher to implement this.
      --help, -h     Display this help message
  `);
  process.exit(0); // Exit after displaying help
}

const count = parseInt(countStr, 10);
const start = startStr ? parseInt(startStr, 10) : 0;
await main({ func, url, count, start, dryRun, tmpl, outputDir: output });

async function main({ func, url, count, start, dryRun, tmpl, outputDir }) {
  // Load the template and maker function module
  let [t, { make, fn, default: defaultFunc }] = await Promise.all([
    fs.readFile(tmpl, 'utf-8'),
    import(path.resolve(`batchers/${func}.mjs`))
  ]);

  if (defaultFunc) fn = defaultFunc;
  if (!fn && make) fn = await make();
  if (!fn) throw new Error('The function must return a valid function.');

  const template = JSON.parse(t);

  // Track previous templates
  const prevFrames = [];

  // Process frames in loop or perform dry-run
  const processFrame = async (frameNum) => {
    const templateCopy = structuredClone(template);

    // Run the frame processing function, passing the cloned template
    const flow = await fn({
      frame: frameNum,
      max: count,
      flow: templateCopy,
      prev: prevFrames,
      outputDir,
    });

    // Add updated data to previous templates
    prevFrames.push(flow);

    // Early return if dryRun is true
    if (dryRun) return console.log(JSON.stringify(flow, null, 2));

    // Post the updated template and log response
    const res = await fetch(`${url}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: flow })
    });

    if (!res.ok) throw new Error(`Failed to send the flow to comfyui: ${res.statusText}`);
    const msg = await res.text();
    console.log(`Frame ${frameNum}: ${msg}`);
  };

  // If dry-run, process the template starting at the specified frame
  if (dryRun) return await processFrame(start);

  for (let i = start; i < start + count; i++) {
    await processFrame(i)
  };
}
