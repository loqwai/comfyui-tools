/**
 * Converts a what percentage of the way through the batch operation we are, and the number of dimensions we want to generate coordinates for.
 * for example, if we are 50% through the batch operation, and we want to generate 3 coordinates, we will get an array of 3 numbers that represent where we are in each dimension.
 * the dimensions will guarantee that we visit every value from 0 to 1 for each dimension. The larger the batch size, the higher the resolution we will visit in the coordinate space of each dimension.
 * @param {number} percent - The percent value to convert.
 * @param {number} dimensions - The number of dimensions to convert to.
 * @returns {Array} An array of numbers representing the coordinates in n-dimensional space.
 */
export const progressToDimensions = (percent, dimensions) => {
  const coordinates = [];

  for (let i = 0; i < dimensions; i++) {
    const coord = percent % 1;  // Get the fractional part for the current dimension
    coordinates.push(coord);
    percent *= dimensions;      // Scale the percent for the next dimension
  }
  return coordinates;
};
