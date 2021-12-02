import 'es6-promise/auto';

export async function asyncFilter<T>(
  arr: T[],
  predicate: (x: T) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}
