import { renderHook } from '@testing-library/react-hooks';
import { IListBoxItem } from 'azure-devops-ui/ListBox';

import useDropdownSelection from '../../../shared-ui/hooks/useDropdownSelection';

describe('useDropdownSelection', () => {
  describe('useDropdownSelection - Single', () => {
    it('should not be selected when default', () => {
      const items: IListBoxItem<any>[] = [{ id: 'one', text: 'hello' }];
      const { result } = renderHook(() => useDropdownSelection(items));
      expect(result.current.selectedCount).toBe(0);
    });
    it('should select when passed id', () => {
      const items: IListBoxItem<any>[] = [
        { id: 'one', text: 'hello' },
        { id: 'two', text: 'hello' }
      ];
      const { result } = renderHook(() => useDropdownSelection(items, 'two'));
      expect(result.current.selectedCount).toBe(1);
    });
    it('should not select when unknown passed id', () => {
      const items: IListBoxItem<any>[] = [
        { id: 'one', text: 'hello' },
        { id: 'two', text: 'hello' }
      ];
      const { result } = renderHook(() => useDropdownSelection(items, 'blerg'));
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('useDropdownSelection - Multi', () => {
    it('should not be selected when default', () => {
      const items: IListBoxItem<any>[] = [{ id: 'one', text: 'hello' }];
      const { result } = renderHook(() => useDropdownSelection(items, undefined, true));
      expect(result.current.selectedCount).toBe(0);
    });
    it('should select multiple when passed ids', () => {
      const items: IListBoxItem<any>[] = [
        { id: 'one', text: 'hello' },
        { id: 'two', text: 'hello' },
        { id: 'three', text: 'hello' }
      ];
      const { result } = renderHook(() => useDropdownSelection(items, ['two', 'three'], true));
      expect(result.current.selectedCount).toBe(2);
    });
    it('should select only known ids', () => {
      const items: IListBoxItem<any>[] = [
        { id: 'one', text: 'hello' },
        { id: 'two', text: 'hello' },
        { id: 'three', text: 'hello' }
      ];
      const { result } = renderHook(() => useDropdownSelection(items, ['one', 'blerg'], true));
      expect(result.current.selectedCount).toBe(1);
    });
  });
});
