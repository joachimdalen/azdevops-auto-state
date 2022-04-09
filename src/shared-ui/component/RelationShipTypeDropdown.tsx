import { Dropdown, IDropdownProps } from 'azure-devops-ui/Dropdown';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { useMemo } from 'react';

import useDropdownSelection from '../hooks/useDropdownSelection';

interface RelationShipTypeDropdownProps
  extends Omit<IDropdownProps, 'renderItem' | 'items' | 'disabled'> {
  selected?: string | string[];
  include?: boolean;
  disabled?: boolean;
}

const RelationShipTypeDropdown = ({
  selected,
  include,
  disabled,
  ...rest
}: RelationShipTypeDropdownProps): JSX.Element => {
  const relationShips: IListBoxItem[] = useMemo(
    () => [
      { id: 'parent-child', text: 'Parent/Child' },
      { id: 'related', text: 'Related' },
      { id: 'successor', text: 'Successor' },
      { id: 'predecessor', text: 'Predecessor' }
    ],
    []
  );
  const selection = useDropdownSelection(relationShips, selected);
  return (
    <Dropdown
      placeholder="Select relationship"
      items={relationShips}
      selection={selection}
      {...rest}
    />
  );
};
export default RelationShipTypeDropdown;
