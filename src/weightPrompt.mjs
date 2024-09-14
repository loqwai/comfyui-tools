export const isSameToken = (token, possibleWrappedToken) => {
  //is the token the same as the wrapped token if we remove all the parentheses and weights?
  let tokenWeAreWashing = cleanToken(possibleWrappedToken);
  return tokenWeAreWashing === token;
};

export const cleanToken = (token) => {
  return token.replace(/[\(\):0-9.]/g, '');
}

export const findTokensAndReplaceWithSymbolsMap = (prompt) => {

};

export const weightPrompt = (prompt, tokens) => {
  if (!prompt || !tokens || tokens.length === 0) return prompt;

  // Step 1: Find all parenthetical tokens and their positions
  const parentheticalRegex = /\(([^)]+)\)/g;
  let match;
  const parentheticalTokens = [];
  const parentheticalRanges = [];

  // Collect parenthetical tokens and their start/end positions
  while ((match = parentheticalRegex.exec(prompt)) !== null) {
    parentheticalTokens.push(match[1]); // Get the text inside parentheses
    parentheticalRanges.push({ start: match.index, end: match.index + match[0].length });
  }

  // Step 2: Replace parenthetical tokens first
  parentheticalTokens.forEach((wrappedToken) => {
    const matchedToken = tokens.find(({ token }) => wrappedToken.includes(token));
    if (matchedToken) {
      // Create a regex to match the whole parenthesized expression
      const weightRegex = new RegExp(`\\(${matchedToken.token}(:[0-9]+(\\.[0-9]+)?)?\\)`, 'g');
      prompt = prompt.replace(weightRegex, `(${matchedToken.token}:${matchedToken.weight})`);
    }
  });

  // Step 3: Replace unwrapped tokens, skipping ranges of already replaced parenthesized tokens
  tokens.forEach(({ token, weight }) => {
    const unwrappedRegex = new RegExp(`\\b${token}\\b`, 'g');

    prompt = prompt.replace(unwrappedRegex, (match, offset) => {
      // Check if this match is inside a parenthetical range
      const isInParentheses = parentheticalRanges.some(range => offset >= range.start && offset <= range.end);
      if (!isInParentheses) {
        return `(${token}:${weight})`; // Replace only if it's not within parentheses
      }
      return match; // Otherwise, leave it unchanged
    });
  });

  return prompt;
};

export const findTokens =  (prompt) => {
  const parentheticalRegex = /\(([^)]+)\)/g;
  let match;
  let tokens = [];
  while ((match = parentheticalRegex.exec(prompt)) !== null) {
    tokens.push(cleanToken(match[1]));
  }
  return tokens;
};
