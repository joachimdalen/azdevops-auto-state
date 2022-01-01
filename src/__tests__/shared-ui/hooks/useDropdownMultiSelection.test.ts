import { renderHook } from '@testing-library/react-hooks';
import { IListBoxItem } from 'azure-devops-ui/ListBox';

import useDropdownMultiSelection from '../../../shared-ui/hooks/useDropdownMultiSelection';

describe('useDropdownMultiSelection', () => {
  it('should not be selected when default', () => {
    const items: IListBoxItem<any>[] = [{ id: 'one', text: 'hello' }];
    const { result } = renderHook(() => useDropdownMultiSelection(items));
    expect(result.current.selectedCount).toBe(0);
  });
  it('should select multiple when passed ids', () => {
    const items: IListBoxItem<any>[] = [
      { id: 'one', text: 'hello' },
      { id: 'two', text: 'hello' },
      { id: 'three', text: 'hello' }
    ];
    const { result } = renderHook(() => useDropdownMultiSelection(items, ['two', 'three']));
    expect(result.current.selectedCount).toBe(2);
  });
  it('should select only known ids', () => {
    const items: IListBoxItem<any>[] = [
      { id: 'one', text: 'hello' },
      { id: 'two', text: 'hello' },
      { id: 'three', text: 'hello' }
    ];
    const { result } = renderHook(() => useDropdownMultiSelection(items, ['one', 'blerg']));
    expect(result.current.selectedCount).toBe(1);
  });
});
