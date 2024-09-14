export const weightPrompt = (prompt, tokens) => {
  if (!prompt || !tokens || tokens.length === 0) return prompt;

  return tokens.reduce((output, { token, weight }) => {
    const regex = new RegExp(`\\b${token}\\b`, 'g');  // Match whole word
    return output.replace(regex, `(${token}:${weight})`);
  }, prompt);
};
