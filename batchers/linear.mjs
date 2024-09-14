export default async function linear({frame,max}) {
  const percent = ((frame + 1) / max);
  return { "1.35": percent};
}
