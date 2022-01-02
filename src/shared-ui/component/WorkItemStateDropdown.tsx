import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Dropdown, IDropdownProps } from 'azure-devops-ui/Dropdown';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { DependencyList, useMemo } from 'react';

import { getStatesForWorkItemType, renderStateCell } from '../helpers';
import useDropdownSelection from '../hooks/useDropdownSelection';

interface WorkItemStateDropdownProps
  extends Omit<IDropdownProps, 'renderItem' | 'items' | 'disabled'> {
  workItemType: string;
  types: WorkItemType[];
  selected?: string | string[];
  filter?: string[];
  include?: boolean;
  deps?: DependencyList | undefined;
  multiSelection?: boolean;
}

const WorkItemStateDropdown = ({
  workItemType,
  types,
  selected,
  filter,
  include,
  multiSelection,
  deps,
  ...rest
}: WorkItemStateDropdownProps): JSX.Element => {
  const workItemStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, workItemType, filter || [], include),
    [workItemType, deps]
  );
  const selection = useDropdownSelection(workItemStates, selected, multiSelection);
  return (
    <Dropdown
      placeholder="Select state"
      disabled={workItemStates?.length === 0}
      items={workItemStates}
      selection={selection}
      renderItem={renderStateCell}
      {...rest}
    />
  );
};
export default WorkItemStateDropdown;
