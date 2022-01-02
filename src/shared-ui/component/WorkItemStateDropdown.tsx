import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Dropdown, IDropdownProps } from 'azure-devops-ui/Dropdown';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { useMemo } from 'react';

import { getStatesForWorkItemType, renderStateCell } from '../helpers';
import useDropdownSelection from '../hooks/useDropdownSelection';

interface WorkItemStateDropdownProps
  extends Omit<IDropdownProps, 'renderItem' | 'items' | 'disabled'> {
  workItemType: string;
  types: WorkItemType[];
  selected?: string;
}

const WorkItemStateDropdown = ({
  workItemType,
  types,
  selected,
  ...rest
}: WorkItemStateDropdownProps): JSX.Element => {
  const workItemStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, workItemType, []),
    [workItemType]
  );
  const selection = useDropdownSelection(workItemStates, selected);
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
