import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { DropdownMultiSelection } from 'azure-devops-ui/Utilities/DropdownSelection';
import { useEffect, useMemo } from 'react';

function useDropdownMultiSelection(
  items: IListBoxItem<any>[],
  selectedIds?: string[]
): DropdownMultiSelection {
  const selection = useMemo(() => new DropdownMultiSelection(), []);
  useEffect(() => {
    if (selectedIds !== undefined && selectedIds.length > 0) {
      selectedIds.forEach(z => {
        const idx = items.findIndex(x => x.id === z);
        if (idx >= 0) selection.select(idx);
      });
    }
  }, [items, selectedIds]);
  return selection;
}

export default useDropdownMultiSelection;
