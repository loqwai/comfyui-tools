import { v4 as uuid } from 'uuid';

/**
 * Checks if a token is the same as a possible wrapped token,
 * ignoring parentheses and weights.
 *
 * @param {string} token - The token to compare.
 * @param {string} possibleWrappedToken - The token that might be wrapped with parentheses or weights.
 * @returns {boolean} True if the tokens are the same after cleaning.
 */
export const isSameToken = (token, possibleWrappedToken) => {
  let tokenWeAreWashing = cleanToken(possibleWrappedToken);
  return tokenWeAreWashing === token;
};


/**
 * Weights the tokens in the prompt by wrapping them in parentheses
 * and adding the corresponding weight from the weights object.
 *
 * @param {{ prompt: string, weights: Object}} params - An object containing the prompt and weights.
 * @returns {string} The modified prompt with weighted tokens.
 */
export const weightPrompt = ({ prompt, weights }) => {
  console.log('weightPrompt', { prompt, weights });
  if (!prompt || !weights || weights.length === 0) return prompt;
  const tokenMap = findTokens({ prompt, tokens: Object.keys(weights) });
  console.log({ tokenMap });

  let newPrompt = prompt;

  for (const dirtyToken in tokenMap) {
    const token = tokenMap[dirtyToken];
    console.log('replacing', { dirtyToken, token, newPrompt, tokenMap });
    const weight = weights[token];
    newPrompt = newPrompt.replaceAll(dirtyToken, token);
  }
  for (const token in weights) {
    newPrompt = newPrompt.replaceAll(token, `(${token}:${weights[token]})`);
  }
  console.log({ tokenMap, newPrompt });

  return newPrompt;
};

/**
 * Finds tokens in the prompt, optionally limited to a set of provided tokens,
 * and returns a map of the dirty tokens (with parentheses/weights) to the cleaned tokens.
 *
 * @param {{ prompt: string, tokens: string[] }} params - An object containing the prompt and an optional list of tokens to find.
 * @returns {Object} A map of dirty tokens to cleaned tokens.
 */
export const findTokens = ({ prompt, tokens }) => {
  const parentheticalRegex = /(\(+[a-zA-Z0-9.-]+(?:\s*:[0-9.]+)?\)+)/g;
  let match;
  const tokenMap = {};
  console.log('before while', { prompt, tokens });
  while ((match = parentheticalRegex.exec(prompt)) !== null) {
    console.log('match', { match });
    for (const dirtyToken of match) {
      const cleanedToken = cleanToken(dirtyToken);
      console.log({ dirtyToken, cleanedToken });
      if (tokens.includes(cleanedToken)) tokenMap[dirtyToken] = cleanedToken;
    }
  }
  console.log({ tokenMap });
  return tokenMap;
};

/**
 * Cleans a token by removing parentheses and weights, returning just the base token.
 *
 * @param {string} token - The token to clean.
 * @returns {string} The cleaned token without parentheses or weights.
 */
export const cleanToken = (token) => {
  return token.replace(/:[0-9.]+/, '').replace(/[()]/g, '').trim();
};
