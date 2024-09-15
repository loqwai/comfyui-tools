import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weightPrompt, isSameToken, findTokens } from './weightPrompt.mjs'; // Adjust the path to your actual file

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
  it('should return an empty object when no tokens are found', () => {
    const tokenMap = findTokens({ prompt: 'Orgon is great and terrible.', tokens: ['fluffy', 'noble'] });
    expect(tokenMap).toBeEmpty();
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones.', () => {
    const tokenMap = findTokens({prompt: 'Orgon is (fluffy) and (noble) but also (((strange))).', tokens: ['fluffy', 'noble']});
    expect(tokenMap).toEqual({
      '(fluffy)': 'fluffy',
      '(noble)': 'noble',
    });
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones when weights are found', () => {
    const tokenMap = findTokens({prompt:'Orgon is (fluffy:0.9) and (noble:1.2).', tokens: ['fluffy', 'noble']});
    expect(tokenMap).toEqual({
      '(fluffy:0.9)': 'fluffy',
      '(noble:1.2)': 'noble',
    });
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones even multiple parentheses are found', () => {
    const tokenMap = findTokens({prompt:'Orgon is (((fluffy))) and (((noble))).', tokens:['fluffy', 'noble']});
    expect(tokenMap).toEqual({
      '(((fluffy)))': 'fluffy',
      '(((noble)))': 'noble',
    });
  });

  it('should return an object where the keys are the "dirty" tokens, and the values are the "clean" ones even multiple parentheses and also weights are found', () => {
    const tokenMap = findTokens({prompt: 'Orgon is (((fluffy:0.9))) and (((noble:1.2))).', tokens: ['fluffy', 'noble']});
    expect(tokenMap).toEqual({
      '(((fluffy:0.9)))': 'fluffy',
      '(((noble:1.2)))': 'noble',
    });
  });
});

describe('weightPrompt', () => {
  it('should replace simple tokens with weights', () => {
    const prompt = "Orgon, The fuzzy Fallen outer Otter God. Cosmic horror. puffy fur and a glowing crystal spear.";
    const weights = {
      'fuzzy': 0.9,
      'puffy': 1.2
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon, The (fuzzy:0.9) Fallen outer Otter God. Cosmic horror. (puffy:1.2) fur and a glowing crystal spear.");
  });

  it('should not double wrap tokens that are already wrapped with weights', () => {
    const prompt = "Orgon is (fuzzy:0.9) and (puffy:1.2), with cotton-ball fur.";
    const weights = {
      'fuzzy': 0.8,
      'puffy': 1.5
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon is (fuzzy:0.8) and (puffy:1.5), with cotton-ball fur.");
  });

  it('should replace tokens that are wrapped but without a weight', () => {
    const prompt = "Orgon is (fuzzy) and (puffy), with cosmic wisps of purple.";
    const weights = {
      'fuzzy': 0.9,
      'puffy': 1.2
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon is (fuzzy:0.9) and (puffy:1.2), with cosmic wisps of purple.");
  });

  it('should replace tokens with spaces', () => {
    const prompt = "Orgon is very fluffy and holds a glowing crystal spear.";
    const weights = {
      'very fluffy': 3,
      'glowing crystal': 1.8
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon is (very fluffy:3) and holds a (glowing crystal:1.8) spear.");
  });

  it('should handle tokens with special characters', () => {
    const prompt = "Orgon is (fuzzy-cotton:2) and holds an 8k raytraced spear.";
    const weights = {
      'fuzzy-cotton': 3,
      'raytraced': 1.6
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon is (fuzzy-cotton:3) and holds an 8k (raytraced:1.6) spear.");
  });

  it('should return the original prompt when empty', () => {
    const prompt = "";
    const weights = {
      'fuzzy': 0.9
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("");
  });

  it('should return the original prompt when no tokens are provided', () => {
    const prompt = "Orgon is fluffy and noble.";
    const weights = {};
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon is fluffy and noble.");
  });

  it('should respect case sensitivity when replacing tokens', () => {
    const prompt = "Orgon is Fluffy and holds a cosmic crystal spear.";
    const weights = {
      'fluffy': 0.9,
      'crystal': 1.5
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("Orgon is Fluffy and holds a cosmic (crystal:1.5) spear."); // 'Fluffy' should not match 'fluffy'
  });

  it('should replace tokens that are wrapped in multiple parentheses', () => {
    const prompt = "ChatGPT stop telling everybody I'm (((hungry))) sheesh they'll know I haven't been sleeping for days.";
    const weights = {
      'hungry': 1.4
    };
    const result = weightPrompt({ prompt, weights });
    expect(result).toBe("ChatGPT stop telling everybody I'm (hungry:1.4) sheesh they'll know I haven't been sleeping for days.");
  });
});
