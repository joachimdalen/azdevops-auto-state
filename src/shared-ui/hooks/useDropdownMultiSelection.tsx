import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { DropdownMultiSelection } from 'azure-devops-ui/Utilities/DropdownSelection';
import { useMemo } from 'react';

function useDropdownMultiSelection(
  items: IListBoxItem<any>[],
  selectedId?: string
): DropdownMultiSelection {
  return useMemo(() => {
    const selection = new DropdownMultiSelection();

    if (selectedId === undefined) return selection;

    const index = items.findIndex(x => x.id === selectedId);
    if (index >= 0) selection.select(index);
    return selection;
  }, [selectedId]);
}

export default useDropdownMultiSelection;
