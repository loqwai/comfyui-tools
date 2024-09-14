import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

// Argument parsing using Node's native `parseArgs`
const opts = parseArgs({
  options: {
    func: { type: 'string', short: 'f' },
    url: { type: 'string', short: 'u' },
    count: { type: 'string', short: 'c' },
    start: { type: 'string', short: 's' },
    dryRun: { type: 'boolean', short: 'd' }
  },
  allowPositionals: true
});
{
  const { func, url, count: countStr, start: startStr, dryRun } = opts.values;
  const [tmpl] = opts.positionals;  // Template is the positional argument

  // Parse count and start frame from string to integer
  const count = parseInt(countStr, 10);
  const start = startStr ? parseInt(startStr, 10) : 0;
  await main({ func, url, count, start, dryRun, tmpl });
}

async function main({ func, url, count, start, dryRun, tmpl }) {
  // Load the template and maker function module
  let [t, { make, fn, default: defaultFunc }] = await Promise.all([
    fs.readFile(tmpl, 'utf-8'),
    import(path.resolve(`batchers/${func}.mjs`))
  ]);

  if (defaultFunc) fn = defaultFunc;
  if (!fn && make) fn = await make();
  if (!fn) throw new Error('The function must return a valid function.');

  const template = JSON.parse(t);

  // Helper function to post data
  const postPrompt = async (data) => {
    const res = await fetch(`${url}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: data })
    });
    return res;
  };

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
      prev: prevFrames
    });

    // Add updated data to previous templates
    prevFrames.push(flow);

    // Early return if dryRun is true
    if (dryRun) return console.log(JSON.stringify(flow, null, 2));

    // Post the updated template and log response
    const res = await postPrompt(flow);
    console.log(res);
  };

  // If dry-run, process the template starting at the specified frame
  if (dryRun) return await processFrame(start);

  // Otherwise, loop through the frames from start to count
  for (let i = start; i < start + count; i++) await processFrame(i);
}
