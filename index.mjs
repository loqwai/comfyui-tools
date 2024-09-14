#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import set from 'set-value'; // Import set-value for deep property setting

// Argument parsing using Node's native `parseArgs`
const opts = parseArgs({
  options: {
    func: { type: 'string', short: 'f' },  // JavaScript maker function
    url: { type: 'string', short: 'u' },
    count: { type: 'string', short: 'c' },  // Parse to integer later
    start: { type: 'string', short: 's' },  // Optional start frame, parsed to integer
  },
  allowPositionals: true
});

const { func, url, count: countStr, start: startStr } = opts.values;
const [tmpl] = opts.positionals;  // Template is the positional argument

// Parse count and start frame from string to integer
const count = parseInt(countStr, 10);
const start = startStr ? parseInt(startStr, 10) : 0;

// Check for missing arguments
const missing = [];
if (!tmpl) missing.push('template (positional argument)');
if (!url) missing.push('url (--url, -u)');
if (isNaN(count)) missing.push('count (--count, -c)');
if (!func) missing.push('function (--function, -f)');

if (missing.length > 0) {
  console.error(`Missing required parameter(s):\n- ${missing.join('\n- ')}`);
  process.exit(1);
}

// Determine if `func` is a full path or just a function name
const isFuncName = !func.includes('/') && !func.includes('.mjs');
const funcPath = isFuncName ? path.resolve(`batchers/${func}.mjs`) : path.resolve(func);

// Determine if `tmpl` is a full path or just a template name
const isTmplName = !tmpl.includes('/') && !tmpl.includes('.json');
const tmplPath = isTmplName ? path.resolve(`flows/${tmpl}.json`) : path.resolve(tmpl);

// Load the template and maker function module
let [tmplDataRaw, { make, fn, default:d }] = await Promise.all([
  fs.readFile(tmplPath, 'utf-8'),
  import(funcPath)
]);

if(d) fn = d;

if(!fn) {
  if(!make) throw new Error('Function module must export a `fn`, a `make`, or a default function.');
  fn = await make()
  if(!fn) throw new Error('maker function must return a function');
}

let tmplData = JSON.parse(tmplDataRaw);

// Helper function to post data
const postPrompt = async (data) => {
  const res = await fetch(`${url}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: data }),
  });
  return res;
};

// Index nodes by title (handling spaces in titles)
const indexByTitle = Object.entries(tmplData).reduce((acc, [key, node]) => {
  const title = node._meta?.title;
  if (title) {
    acc[title.trim().toLowerCase()] = acc[title.trim().toLowerCase()] || [];
    acc[title.trim().toLowerCase()].push(node);
  }
  return acc;
}, {});

// Track previous templates
const prevTemplates = [];

// Process frames in loop
for (let i = 0; i < count; i++) {
  const frameNum = start + i;

  // Run the function to get the dot notation updates
  const updates = await fn({
    frame: frameNum,
    max: count,
    prev: prevTemplates,  // Pass previous templates
  });

  // Apply updates to nodes based on their title using set-value
  tmplData = Object.entries(updates).reduce((data, [path, value]) => {
    const [title, ...fieldPath] = path.split('.');  // Split by dot notation
    const normalizedTitle = title.trim().toLowerCase();  // Normalize title

    if (indexByTitle[normalizedTitle]) {
      indexByTitle[normalizedTitle].forEach(node => {
        const inputsPath = `inputs.${fieldPath.join('.')}`;  // Always assume we are working with 'inputs'
        set(node, inputsPath, value);  // Use set-value to set the deep property
      });
    }
    return data;
  }, tmplData);

  // Add updated data to previous templates
  prevTemplates.push(JSON.stringify(tmplData));

  // Post the updated template and log response
  const res = await postPrompt(tmplData);
  console.log(res);
}
