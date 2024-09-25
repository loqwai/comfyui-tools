import { describe, it, expect, beforeEach } from 'vitest';
import { progressToDimensions } from './progressToDimensions.mjs';
// Tests for progressToDimensions function

describe('progressToDimensions', () => {
  describe('when describing 2D space', () => {
    let visitedPoints;
    beforeEach(() => {
      const dimensions = 2;
      const frames = 8; // Number of steps to check
      visitedPoints = new Set();
      for (let i = 0; i <= frames; i++) {
        const percent = i / frames;
        const coords = progressToDimensions(percent, dimensions);
        console.log(coords);
        visitedPoints.add(coords);
      }
    });
    it('should visit 4 points', () => {
      expect(visitedPoints.size).toBe(4);
    });
    it('should visit all points', () => {
      expect(visitedPoints).toEqual(new Set([[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]]));
    });
  });

  it('always returns coordinates between 0 and 1', () => {
    const dimensions = 4;
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const percent = i / steps;
      const coords = progressToDimensions(percent, dimensions);

      coords.forEach(coord => {
        expect(coord).toBeGreaterThanOrEqual(0);
        expect(coord).toBeLessThanOrEqual(1);
      });
    }
  });
});


