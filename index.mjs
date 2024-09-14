#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

// Argument parsing using Node's native `parseArgs`
const opts = parseArgs({
  options: {
    func: { type: 'string', short: 'f' },  // JavaScript function
    url: { type: 'string', short: 'u' },
    count: { type: 'string', short: 'c' },  // Parse to integer later
    start: { type: 'string', short: 's' },  // Optional start frame, parsed to integer
  },
  allowPositionals: true
});

const { func, url, count: countStr, start: startStr } = opts.values;
const [tmpl] = opts.positionals;  // Template is now the positional argument

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

// Load the template and function module
const [tmplData, { default: makeFn }] = await Promise.all([
  fs.readFile(tmplPath, 'utf-8'),
  import(funcPath)
]);

// Helper function to post data
const postPrompt = async (data) => {
  const res = await fetch(`${url}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: JSON.parse(data) }),
  });
  return res;
};

// Track previous templates
const prevTemplates = [];

// Process frames in loop
for (let i = 0; i < count; i++) {
  const frameNum = start + i;

  // Run the function to get replacements
  const replacements = await makeFn({
    frame: frameNum,
    max: count,
    prev: prevTemplates,  // Pass previous templates
  });

  // Perform blind replacements in template
  let updatedData = tmplData;
  for (const [search, replace] of Object.entries(replacements)) {
    const escapedSearch = JSON.stringify(search).slice(1, -1);
    updatedData = updatedData.split(escapedSearch).join(replace);
  }

  // Add updated data to previous templates
  prevTemplates.push(updatedData);

  // Post the updated template and log response
  const res = await postPrompt(updatedData);
  const { status, statusText } = res;
  console.log(`Frame ${frameNum}: ${status} ${statusText}`);
}
