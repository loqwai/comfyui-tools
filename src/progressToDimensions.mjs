/**
 * Converts a percentage value to coordinates in n-dimensional space.
 * Each coordinate is either 0 or 0.5, based on the bits of the index.
 * @param {number} percent - The percent value to convert (from 0 to 1).
 * @param {number} dimensions - The number of dimensions to convert to.
 * @returns {Array} An array of numbers representing the coordinates in n-dimensional space.
 */
export const progressToDimensions = (percent, dimensions) => {
  const totalCombinations = 1 << dimensions; // Equivalent to 2^dimensions
  let index = Math.min(Math.floor(percent * totalCombinations), totalCombinations - 1);
  const coordinates = [];

  for (let i = dimensions - 1; i >= 0; i--) {
    const bit = (index >> i) & 1;
    coordinates.push(bit * 0.5);
  }

  return coordinates;
};
