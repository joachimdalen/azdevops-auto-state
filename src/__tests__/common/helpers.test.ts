import { asyncFilter, groupBy } from '../../common/helpers';

describe('commom-helpers', () => {
  describe('asyncFilter', () => {
    test('filters correctly', async () => {
      const items = [true, false, true];
      const result = await asyncFilter(items, x => Promise.resolve(x));
      expect(result.length).toEqual(2);
    });
  });

  describe('groupBy', () => {
    test('groups correctly', async () => {
      const items = [
        { id: 1, type: 'type-1' },
        { id: 2, type: 'type-2' },
        { id: 3, type: 'type-3' },
        { id: 4, type: 'type-3' },
        { id: 5, type: 'type-4' },
        { id: 6, type: 'type-5' }
      ];

      const result = groupBy(items, x => x.type);
      expect([...result.keys()].length).toEqual(5);
      expect([...result.values()].length).toEqual(5);
    });
  });
});
