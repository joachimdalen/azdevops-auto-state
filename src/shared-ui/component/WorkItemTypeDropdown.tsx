import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Dropdown, IDropdownProps } from 'azure-devops-ui/Dropdown';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { DependencyList, useMemo } from 'react';

import { getWorkItemTypeItems, renderWorkItemCell } from '../../rule-modal/helpers';
import useDropdownSelection from '../hooks/useDropdownSelection';

interface WorkItemTypeDropdownProps
  extends Omit<IDropdownProps, 'renderItem' | 'items' | 'disabled'> {
  types: WorkItemType[];
  selected?: string;
  filter?: string[];
  include?: boolean;
  deps?: DependencyList | undefined;
  disabled?: boolean;
}

const WorkItemTypeDropdown = ({
  types,
  selected,
  filter,
  include,
  deps,
  disabled,
  ...rest
}: WorkItemTypeDropdownProps): JSX.Element => {
  const workItemTypes: IListBoxItem[] = useMemo(
    () => getWorkItemTypeItems(types, filter || []),
    [types, deps]
  );
  const selection = useDropdownSelection(workItemTypes, selected);
  return (
    <Dropdown
      placeholder="Select type"
      disabled={workItemTypes?.length === 0 || disabled}
      items={workItemTypes}
      selection={selection}
      renderItem={renderWorkItemCell}
      {...rest}
    />
  );
};
export default WorkItemTypeDropdown;
