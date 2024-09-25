export function getCoordinates({ current, max, dimensions }) {
   // Ensure that granularity is sufficient to cover all frames
   const granularity = Math.max(max + 1, dimensions);
   const coordinates = [];

   // Spread the frames evenly across dimensions
   for (let i = 0; i < dimensions; i++) {
     // Create a step that will evenly spread out the values across dimensions
     const stepSize = i / dimensions;

     // Project the current frame with the step size and wrap with modulo if needed
     const value = (current + stepSize * granularity) % granularity;

     // Normalize the value to the range [0, 1]
     const normalizedValue = value / max;
     coordinates.push(normalizedValue);
   }

   console.log(`Frame: ${current}, Coordinates: ${coordinates}`);

   return coordinates;
 }
