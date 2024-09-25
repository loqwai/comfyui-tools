/**
 * Generates coordinates in n-dimensional space using the Halton sequence.
 * @param {number} percent - The percent value to convert (from 0 to 1).
 * @param {number} dimensions - The number of dimensions to convert to.
 * @returns {Array} An array of numbers representing the coordinates in n-dimensional space.
 */
export const progressToDimensions = (percent, dimensions) => {
  const coordinates = [];
  const totalPoints = 1000000; // Define a large number of points
  const index = Math.floor(percent * totalPoints);

  // List of prime numbers for base in Halton sequence
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];

  for (let i = 0; i < dimensions; i++) {
    const base = primes[i % primes.length];
    const coordinate = vanDerCorput(index, base);
    coordinates.push(coordinate);
  }

  return coordinates;
};

/**
 * Calculates the van der Corput sequence for a given index and base.
 * @param {number} n - The index in the sequence.
 * @param {number} base - The base for the radical inverse function.
 * @returns {number} A number between 0 and 1.
 */
const vanDerCorput = (n, base) => {
  let result = 0;
  let f = 1 / base;
  let i = n;
  while (i > 0) {
    result += f * (i % base);
    i = Math.floor(i / base);
    f = f / base;
  }
  return result;
};
