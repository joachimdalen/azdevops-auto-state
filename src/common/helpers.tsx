import 'es6-promise/auto';

export async function asyncFilter<T>(
  arr: T[],
  predicate: (x: T) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}

export function groupBy<T>(list: T[], keyGetter: (value: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
