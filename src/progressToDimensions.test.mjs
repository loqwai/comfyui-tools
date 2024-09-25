import { describe, it, expect, beforeEach } from 'vitest';
import { progressToDimensions } from './progressToDimensions.mjs';
// Tests for progressToDimensions function

describe('progressToDimensions', () => {
  describe('when visiting 2D space with 8 frames', () => {
    let visitedPoints;
    beforeEach(() => {
      const dimensions = 2;
      const frames = 8; // Number of steps to check
      visitedPoints = new Set();
      for (let i = 0; i <= frames; i++) {
        const percent = i / frames;
        const coords = progressToDimensions(percent, dimensions);
        visitedPoints.add(coords.join(','));
      }
    });

    it('should visit 4 points', () => {
      expect(visitedPoints.size).toBe(4);
    });

    it('should visit all points', () => {
      expect(visitedPoints).toEqual(new Set(['0,0', '1,0', '0,1', '1,1']));
    });

    describe('when visiting 2D space with 16 frames', () => {
      let visitedPoints;
      beforeEach(() => {
        const dimensions = 2;
        const frames = 16; // Number of steps to check
        visitedPoints = new Set();
        for (let i = 0; i <= frames; i++) {
          const percent = i / frames;
          const coords = progressToDimensions(percent, dimensions);
          visitedPoints.add(coords.join(','));
        }
      });
      it('should visit 9(?) points', () => {
        expect(visitedPoints.size).toBe(9);
      });
      it('should visit all points', () => {
        expect(visitedPoints).toEqual(
          new Set([
            '0,0',
            '0,0.5',
            '0,1',
            '0.5,0',
            '0.5,0.5',
            '0.5,1',
            '1,0',
            '1,0.5',
            '1,1',
          ])
        );
      });
    });
  });

  describe('when describing 3D space', () => {
    let visitedPoints;
    beforeEach(() => {
      const dimensions = 3;
      const frames = 3*3*3; // Number of steps to check
      visitedPoints = new Set();
      for (let i = 0; i <= frames; i++) {
        const percent = i / frames;
        const coords = progressToDimensions(percent, dimensions);
        visitedPoints.add(coords.join(','));
      }
    });
    it('should visit 3 points', () => {
      expect(visitedPoints.size).toBe(7);
    });
    it('should visit all points', () => {
      expect(visitedPoints).toEqual(new Set([
        '0,0,0',
        '0,0,1',
        '0,1,0',
        '1,0,0',
        '1,0,1',
        '1,1,0',
        '1,1,1',
      ]));
    });
  });
});


