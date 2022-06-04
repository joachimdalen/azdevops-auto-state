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

export const getValidationCountByPattern = (
  errors: { [key: string]: string[] } | undefined,
  match: RegExp
): number | undefined => {
  if (errors === undefined) return undefined;
  const count = Object.keys(errors).filter(x => x.match(match)).length;

  if (count > 0) return count;
  return undefined;
};

export const getValidationCount = (
  errors: { [key: string]: string[] } | undefined,
  fields: string[]
): number | undefined => {
  if (errors === undefined) return undefined;
  const count = Object.keys(errors).filter(x => fields.includes(x)).length;

  if (count > 0) return count;
  return undefined;
};
