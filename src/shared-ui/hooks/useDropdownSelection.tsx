import { IListBoxItem } from 'azure-devops-ui/ListBox';
import {
  DropdownMultiSelection,
  DropdownSelection
} from 'azure-devops-ui/Utilities/DropdownSelection';
import { useEffect, useMemo } from 'react';

function useDropdownSelection(
  items: IListBoxItem<any>[],
  selected?: string | string[],
  multi?: boolean
): DropdownSelection {
  const selection = useMemo(
    () => (multi ? new DropdownMultiSelection() : new DropdownSelection()),
    []
  );
  useEffect(() => {
    if (multi) {
      if (selected !== undefined && selected.length > 0 && Array.isArray(selected)) {
        selected.forEach(z => {
          const idx = items.findIndex(x => x.id === z);
          if (idx >= 0) selection.select(idx);
        });
      }
    } else {
      if (selected !== undefined) {
        const index = items.findIndex(x => x.id === selected);
        if (index >= 0) selection.select(index);
      }
    }
  }, [items, selected]);

  return selection;
}

export default useDropdownSelection;
