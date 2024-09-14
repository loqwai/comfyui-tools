export default async function percentage({frame,max}) {
  const percentage = ((frame + 1) / max);
  return { percentage };
}
