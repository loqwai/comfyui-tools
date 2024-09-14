import { describe, it, expect } from 'vitest';
import { weightPrompt,findTokensAndReplaceWithSymbolsMap,  isSameToken } from '../src/weightPrompt.mjs'; // Adjust the path to your actual file

describe('isSameToken', () => {

  it('should return true when the clean token matches the unwrapped token', () => {
    expect(isSameToken('hungry', 'hungry')).toBe(true);
  });

  it('should return true when the clean token matches a token wrapped in parentheses', () => {
    expect(isSameToken('hungry', '(hungry)')).toBe(true);
    expect(isSameToken('hungry', '(((hungry)))')).toBe(true);
  });

  it('should return true when the clean token matches a token with a weight', () => {
    expect(isSameToken('hungry', '(hungry:1.2)')).toBe(true);
  });

  it('should return true when the clean token matches a token with parentheses and weight', () => {
    expect(isSameToken('hungry', '((hungry:1.5))')).toBe(true);
  });

  it('should return false when the clean token does not match the unwrapped token', () => {
    expect(isSameToken('hungry', 'hungryman')).toBe(false);
    expect(isSameToken('hungry', '(hungryman)')).toBe(false);
  });

  it('should return false when the clean token is a substring of the wrapped token', () => {
    expect(isSameToken('hungry', '(very hungry)')).toBe(false);
  });

  it('should return true for tokens that contain special characters if they match exactly', () => {
    expect(isSameToken('very-hungry', '(very-hungry:2)')).toBe(true);
  });

  it('should return false for tokens with extra characters or partial matches', () => {
    expect(isSameToken('hungry', '(hungry:1)man')).toBe(false);
  });

  it('should return false when the token has extra characters after the match', () => {
    expect(isSameToken('hungry', 'man(hungry:1)')).toBe(false);
  });
});

describe('findTokensAndReplaceWithSymbolsMap', () => {
  it('should return an empty map and an empty prompt', () => {
    expect(findTokensAndReplaceWithSymbolsMap('')).toEqual({ symbolTable: new Map(), prompt: '' });
  });
  it('should return a map with the key of a symbol, and the value the raw string of a matched token', () => {
    const prompt = 'Orgon is (fuzzy) and (puffy), with cosmic wisps of purple.';
    const { symbolTable } = findTokensAndReplaceWithSymbolsMap(prompt);
    expect(findTokensAndReplaceWithSymbolsMap(symbolTable.values())).toIncludeSameMembers(["(fuzzy)", "(puffy)"]);
  })
});

describe.skip('weightPrompt', () => {

  it('should replace simple tokens with weights', () => {
    const prompt = "Orgon, The fuzzy Fallen outer Otter God. Cosmic horror. puffy fur and a glowing crystal spear.";
    const tokens = [
      { token: 'fuzzy', weight: 0.9 },
      { token: 'puffy', weight: 1.2 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon, The (fuzzy:0.9) Fallen outer Otter God. Cosmic horror. (puffy:1.2) fur and a glowing crystal spear.");
  });


  it('should not double wrap tokens that are already wrapped with weights', () => {
    const prompt = "Orgon is (fuzzy:0.9) and (puffy:1.2), with cotton-ball fur.";
    const tokens = [
      { token: 'fuzzy', weight: 0.9 },
      { token: 'puffy', weight: 1.5 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon is (fuzzy:0.9) and (puffy:1.2), with cotton-ball fur.");
  });

  // Edge Case: Token already wrapped without weight
  it('should replace tokens that are wrapped but without a weight', () => {
    const prompt = "Orgon is (fuzzy) and (puffy), with cosmic wisps of purple.";
    const tokens = [
      { token: 'fuzzy', weight: 0.9 },
      { token: 'puffy', weight: 1.2 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon is (fuzzy:0.9) and (puffy:1.2), with cosmic wisps of purple.");
  });

  // Edge Case: Token with spaces
  it('should replace tokens with spaces', () => {
    const prompt = "Orgon is very fluffy and holds a glowing crystal spear.";
    const tokens = [
      { token: 'very fluffy', weight: 3 },
      { token: 'glowing crystal', weight: 1.8 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon is (very fluffy:3) and holds a (glowing crystal:1.8) spear.");
  });

  // Edge Case: Token with special characters
  it('should handle tokens with special characters', () => {
    const prompt = "Orgon is (fuzzy-cotton:2) and holds an 8k raytraced spear.";
    const tokens = [
      { token: 'fuzzy-cotton', weight: 3 },
      { token: 'raytraced', weight: 1.6 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon is (fuzzy-cotton:3) and holds an 8k (raytraced:1.6) spear.");
  });

  // Edge Case: Empty prompt
  it('should return the original prompt when empty', () => {
    const prompt = "";
    const tokens = [
      { token: 'fuzzy', weight: 0.9 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("");
  });

  // Edge Case: No tokens provided
  it('should return the original prompt when no tokens are provided', () => {
    const prompt = "Orgon is fluffy and noble.";
    const tokens = [];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon is fluffy and noble.");
  });

  // Edge Case: Token case sensitivity
  it('should respect case sensitivity when replacing tokens', () => {
    const prompt = "Orgon is Fluffy and holds a cosmic crystal spear.";
    const tokens = [
      { token: 'fluffy', weight: 0.9 },
      { token: 'crystal', weight: 1.5 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("Orgon is Fluffy and holds a cosmic (crystal:1.5) spear."); // 'Fluffy' should not match 'fluffy'
  });
  it('should replace tokens that are wrapped in multiple parentheses', () => {
    const prompt = "ChatGPT stop telling everybody I'm (((hungry))) sheesh they'll know I haven't been sleeping for days.";
    const tokens = [
      { token: 'hungry', weight: 1.4 }
    ];
    const result = weightPrompt(prompt, tokens);
    expect(result).toBe("ChatGPT stop telling everybody I'm (hungry:1.4) sheesh they'll know I haven't been sleeping for days.");
  });

});
