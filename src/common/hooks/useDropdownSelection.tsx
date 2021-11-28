import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { DropdownSelection } from 'azure-devops-ui/Utilities/DropdownSelection';
import { useMemo } from 'react';

function useDropdownSelection(items: IListBoxItem<any>[], selectedId?: string): DropdownSelection {
  return useMemo(() => {
    const selection = new DropdownSelection();

    if (selectedId === undefined) return selection;

    const index = items.findIndex(x => x.id === selectedId);
    if (index >= 0) selection.select(index);
    return selection;
  }, [selectedId]);
}

export default useDropdownSelection;
