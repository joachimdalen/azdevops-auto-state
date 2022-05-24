import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Link } from 'azure-devops-ui/Link';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo, useState } from 'react';
import { FilterGroup } from '../../../common/models/FilterGroup';

import FilterItem from '../../../common/models/FilterItem';
import NewGroup from './NewGroup';
import { WorkItemFilterInternalProps } from './types';
import WorkItemFilterCard from './WorkItemFilterCard';

interface WorkItemFilterNewProps {
  parentType: string;
  workItemType: string;
  types: WorkItemType[];
  disabled: boolean;
  filters: FilterGroup[];
  onChange: (filters: FilterGroup[]) => void;
}

const WorkItemFilterNew = ({
  parentType,
  workItemType,
  types,
  disabled,
  filters,
  onChange
}: WorkItemFilterNewProps): JSX.Element => {
  const [addWorkItemFilter, setAddWorkItemFilter] = useState(false);

  const intProps: WorkItemFilterInternalProps = useMemo(() => {
    const wiType = types.find(x => x.referenceName === workItemType);
    const pType = types.find(x => x.referenceName === parentType);

    return {
      workItem: {
        name: wiType?.name || 'Unknown',
        icon: wiType?.icon.url
      },
      parent: {
        name: pType?.name || 'Unknown',
        icon: pType?.icon.url
      }
    };
  }, [types, parentType, workItemType]);

  const remove = (group: string, filt: FilterItem) => {
    // if (filters.findIndex(x => x.field === filt.field) !== -1) {
    //   onChange(filters.filter(x => x.field !== filt.field));
    // }
  };
  const removeGroup = (groupId: string) => {
    if (filters.findIndex(x => x.name === groupId) !== -1) {
      onChange(filters.filter(x => x.name !== groupId));
    }
  };
  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <MessageCard
        severity={MessageCardSeverity.Info}
        buttonProps={[{ text: 'Do not show again' }]}
      >
        Groups allows you to filter down on fields. Each filter group will work as a seperate filter
        for this rule. See more in the <Link href="#">documentation</Link>
      </MessageCard>
      {/* <Button
        text="Add new group"
        primary
        iconProps={{ iconName: 'Add' }}
        disabled={disabled}
        onClick={() => onChange([...filters, { name: 'new-group' }])}
      /> */}
      <NewGroup onAddGroup={(name: string) => onChange([...filters, { name }])} />
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren renderChildren={filters.length === 0}>
          <span>No filters added</span>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={filters.length > 0}>
          <Surface background={SurfaceBackground.callout}>
            {filters.map(filter => (
              <WorkItemFilterCard
                key={filter.name}
                workItem={intProps.workItem}
                parent={intProps.parent}
                remove={(item: FilterItem) => console.log('')}
                group={filter}
                removeGroup={(groupId: string) => removeGroup(groupId)}
              />
            ))}
          </Surface>
        </ConditionalChildren>
      </div>
      {/* {addWorkItemFilter && (
        <WorkItemFilterModal
          workItemType={workItemType}
          fields={fields}
          onClose={() => setAddWorkItemFilter(false)}
          selectedFields={filters.map(x => x.field)}
          onAddItem={(filterItem: FilterItem) => onChange([...filters, filterItem])}
        />
      )} */}
    </div>
  );
};

export default WorkItemFilterNew;
