#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import _ from 'lodash';

// Helper function to parse command-line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};
  let jsFilePath;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-t':
      case '--template':
        options.template = args[++i];
        break;
      case '-u':
      case '--url':
        options.url = args[++i];
        break;
      case '-c':
      case '--count':
        options.count = parseInt(args[++i], 10);
        if (isNaN(options.count)) {
          console.error('The --count option must be a valid integer.');
          process.exit(1);
        }
        break;
      default:
        jsFilePath = args[i];
    }
  }

  if (!options.template || !options.url || !options.count || !jsFilePath) {
    console.error('All options are required: --template, --url, --count, and a JS file or function name.');
    process.exit(1);
  }

  return { ...options, jsFilePath };
};

// Extract options from command-line arguments
const { template, url, count, jsFilePath } = parseArgs();

// Determine if `jsFilePath` is a full path or just a function name
const isFunctionName = !jsFilePath.includes('/') && !jsFilePath.includes('.mjs');

// If it's just a function name, load the function from the batchers folder
const resolvedJsFilePath = isFunctionName
  ? path.resolve(`batchers/${jsFilePath}.mjs`)
  : path.resolve(jsFilePath);

// Determine if `template` is a full path or just a template name
const isTemplateName = !template.includes('/') && !template.includes('.json');

// If it's just a template name, load the template from the flows folder
const resolvedTemplatePath = isTemplateName
  ? path.resolve(`flows/${template}.json`)
  : path.resolve(template);

// Load the template and JavaScript module
const [templateData, { default: make }] = await Promise.all([
  fs.readFile(resolvedTemplatePath, 'utf-8'),
  import(resolvedJsFilePath)
]);

// Create a compiled template function
const compiledTemplate = _.template(templateData);
const fn = make();

// Helper function to post data
const postPrompt = async (flow) => {
  const response = await fetch(`${url}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: JSON.parse(flow) }),
  });

  if (!response.ok) {
    throw new Error(`Failed to post data: ${response.statusText}`);
  }

  return response.json();
};

// Execute the function for the specified count
for (let i = 0; i < count; i++) {
  try {
    // Generate result from the function
    const result = await fn({ frame: i, max: count });

    // Apply the result to the template
    const flow = compiledTemplate(result);

    // Post the prompt and log the result
    const response = await postPrompt(flow);
    console.log(`POST request successful:`, response);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}
