import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weightPrompt, findTokensAndReplaceWithSymbolsMap, isSameToken, findTokens } from './weightPrompt.mjs'; // Adjust the path to your actual file

//mock the uuid import in vitest
import { v4 as uuid } from 'uuid';

// Mock the 'uuid' library
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));
beforeEach(() => {
  let count = 0;
  uuid.mockImplementation(() => `symbol${count++}`);
});

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

describe('findTokens', () => {
  it('should return an empty array when no tokens are found', () => {
    const tokenMap = findTokens('Orgon is fluffy and noble.');
    expect(tokenMap).toBeEmpty();
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones.', () => {
    const tokenMap = findTokens('Orgon is (fluffy) and (noble).');
    expect(tokenMap).toEqual({
      '(fluffy)': 'fluffy',
      '(noble)': 'noble',
    });
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones when weights are found', () => {
    const tokenMap = findTokens('Orgon is (fluffy:0.9) and (noble:1.2).');
    expect(tokenMap).toEqual({
      '(fluffy:0.9)': 'fluffy',
      '(noble:1.2)': 'noble',
    });
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones even multiple parentheses are found', () => {
    const tokenMap = findTokens('Orgon is (((fluffy))) and (((noble))).');
    expect(tokenMap).toEqual({
      '(((fluffy)))': 'fluffy',
      '(((noble)))': 'noble',
    });
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones even multiple parentheses and also weights are found', () => {
    const tokenMap = findTokens('Orgon is (((fluffy:0.9))) and (((noble:1.2))).');
    expect(tokenMap).toEqual({
      '(((fluffy:0.9)))': 'fluffy',
      '(((noble:1.2)))': 'noble',
    });
  });
});
describe('weightPrompt', () => {

  it('should replace simple tokens with weights', () => {
    const prompt = "Orgon, The fuzzy Fallen outer Otter God. Cosmic horror. puffy fur and a glowing crystal spear.";
    const weights = [
      { token: 'fuzzy', weight: 0.9 },
      { token: 'puffy', weight: 1.2 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon, The (fuzzy:0.9) Fallen outer Otter God. Cosmic horror. (puffy:1.2) fur and a glowing crystal spear.");
  });


  it('should not double wrap tokens that are already wrapped with weights', () => {
    const prompt = "Orgon is (fuzzy:0.9) and (puffy:1.2), with cotton-ball fur.";
    const weights = [
      { token: 'fuzzy', weight: 0.8 },
      { token: 'puffy', weight: 1.5 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon is (fuzzy:0.8) and (puffy:1.5), with cotton-ball fur.");
  });

  // Edge Case: Token already wrapped without weight
  it('should replace tokens that are wrapped but without a weight', () => {
    const prompt = "Orgon is (fuzzy) and (puffy), with cosmic wisps of purple.";
    const weights = [
      { token: 'fuzzy', weight: 0.9 },
      { token: 'puffy', weight: 1.2 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon is (fuzzy:0.9) and (puffy:1.2), with cosmic wisps of purple.");
  });

  // Edge Case: Token with spaces
  it('should replace tokens with spaces', () => {
    const prompt = "Orgon is very fluffy and holds a glowing crystal spear.";
    const weights = [
      { token: 'very fluffy', weight: 3 },
      { token: 'glowing crystal', weight: 1.8 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon is (very fluffy:3) and holds a (glowing crystal:1.8) spear.");
  });

  // Edge Case: Token with special characters
  it('should handle tokens with special characters', () => {
    const prompt = "Orgon is (fuzzy-cotton:2) and holds an 8k raytraced spear.";
    const weights = [
      { token: 'fuzzy-cotton', weight: 3 },
      { token: 'raytraced', weight: 1.6 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon is (fuzzy-cotton:3) and holds an 8k (raytraced:1.6) spear.");
  });

  // Edge Case: Empty prompt
  it('should return the original prompt when empty', () => {
    const prompt = "";
    const weights = [
      { token: 'fuzzy', weight: 0.9 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("");
  });

  // Edge Case: No tokens provided
  it('should return the original prompt when no tokens are provided', () => {
    const prompt = "Orgon is fluffy and noble.";
    const weights = [];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon is fluffy and noble.");
  });

  // Edge Case: Token case sensitivity
  it('should respect case sensitivity when replacing tokens', () => {
    const prompt = "Orgon is Fluffy and holds a cosmic crystal spear.";
    const weights = [
      { token: 'fluffy', weight: 0.9 },
      { token: 'crystal', weight: 1.5 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("Orgon is Fluffy and holds a cosmic (crystal:1.5) spear."); // 'Fluffy' should not match 'fluffy'
  });

  it('should replace tokens that are wrapped in multiple parentheses', () => {
    const prompt = "ChatGPT stop telling everybody I'm (((hungry))) sheesh they'll know I haven't been sleeping for days.";
    const weights = [
      { token: 'hungry', weight: 1.4 }
    ];
    const result = weightPrompt({prompt, weights});
    expect(result).toBe("ChatGPT stop telling everybody I'm (hungry:1.4) sheesh they'll know I haven't been sleeping for days.");
  });

});
