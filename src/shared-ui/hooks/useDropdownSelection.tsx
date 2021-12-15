import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { DropdownSelection } from 'azure-devops-ui/Utilities/DropdownSelection';
import { useEffect, useMemo } from 'react';

function useDropdownSelection(items: IListBoxItem<any>[], selectedId?: string): DropdownSelection {
  const selection = useMemo(() => new DropdownSelection(), []);
  useEffect(() => {
    if (selectedId !== undefined) {
      const index = items.findIndex(x => x.id === selectedId);
      if (index >= 0) selection.select(index);
    }
  }, [items, selectedId]);

  return selection;
}

export default useDropdownSelection;
