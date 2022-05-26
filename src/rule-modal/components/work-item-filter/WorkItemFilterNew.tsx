import { WorkItemField, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import { useMemo, useState } from 'react';

import { FilterGroup } from '../../../common/models/FilterGroup';
import FilterItem from '../../../common/models/FilterItem';
import NewGroup from './NewGroup';
import { WorkItemFilterInternalProps } from './types';
import WorkItemFilterCard from './WorkItemFilterCard';
import WorkItemFilterModal from './WorkItemFilterModal';

interface WorkItemFilterNewProps {
  parentType: string;
  workItemType: string;
  types: WorkItemType[];
  fields: WorkItemField[];
  disabled: boolean;
  filters: FilterGroup[];
  onChange: (filters: FilterGroup[]) => void;
}

const WorkItemFilterNew = ({
  parentType,
  workItemType,
  types,
  fields,
  disabled,
  filters,
  onChange
}: WorkItemFilterNewProps): JSX.Element => {
  const [addToGroup, setAddToGroup] = useState<string | undefined>();

  const intProps: WorkItemFilterInternalProps = useMemo(() => {
    const wiType = types.find(x => x.referenceName === workItemType);
    const pType = types.find(x => x.referenceName === parentType);

    return {
      workItem: wiType,
      parent: pType
    };
  }, [types, parentType, workItemType]);

  const allGroupNames = useMemo(() => filters.map(x => x.name), [filters]);

  const removeItem = (groupName: string, target: 'workItem' | 'parent', filter: FilterItem) => {
    const newFilters = [...filters];
    const filterIndex = newFilters.findIndex(x => x.name === groupName);
    if (filterIndex >= 0) {
      if (target === 'workItem') {
        newFilters[filterIndex].workItemFilters = (
          newFilters[filterIndex].workItemFilters || []
        ).filter(x => x.field !== filter.field);
      } else {
        newFilters[filterIndex].parentFilters = (
          newFilters[filterIndex].parentFilters || []
        ).filter(x => x.field !== filter.field);
      }
      onChange(newFilters);
    }
  };
  const removeGroup = (groupId: string) => {
    if (filters.findIndex(x => x.name === groupId) !== -1) {
      onChange(filters.filter(x => x.name !== groupId));
    }
  };
  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <NewGroup
        disabled={disabled}
        onAddGroup={(name: string) => onChange([...filters, { name }])}
        existingNames={allGroupNames}
      />
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren renderChildren={filters.length === 0}>
          <ZeroData
            iconProps={{ iconName: 'WorkItem' }}
            imageAltText=""
            primaryText="No Filter Groups"
            secondaryText="Groups allows you to filter down on fields. Each filter group will work as a seperate filter for this rule. Only a single filter group needs to match for the rule to trigger"
            actionHref="#"
            actionText="Read more in documentation"
            actionType={ZeroDataActionType.ctaButton}
          />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={filters.length > 0}>
          <Surface background={SurfaceBackground.callout}>
            {filters.map(filter => (
              <WorkItemFilterCard
                disabled={disabled}
                key={filter.name}
                workItem={intProps.workItem}
                parent={intProps.parent}
                remove={(target: 'workItem' | 'parent', item: FilterItem) =>
                  removeItem(filter.name, target, item)
                }
                group={filter}
                removeGroup={() => removeGroup(filter.name)}
                addFilter={() => setAddToGroup(filter.name)}
              />
            ))}
          </Surface>
        </ConditionalChildren>
      </div>
      {addToGroup && (
        <WorkItemFilterModal
          workItem={intProps.workItem}
          parent={intProps.parent}
          fields={fields}
          onClose={() => setAddToGroup(undefined)}
          group={filters.find(x => x.name === addToGroup)}
          onAddItem={(filterItem: FilterItem, target: 'workItem' | 'parent') => {
            const newFilters = [...filters];
            const filterIndex = newFilters.findIndex(x => x.name === addToGroup);
            if (filterIndex >= 0) {
              if (target === 'workItem') {
                newFilters[filterIndex].workItemFilters = [
                  ...(newFilters[filterIndex].workItemFilters || []),
                  filterItem
                ];
              } else {
                newFilters[filterIndex].parentFilters = [
                  ...(newFilters[filterIndex].parentFilters || []),
                  filterItem
                ];
              }
              onChange(newFilters);
            }
          }}
        />
      )}
    </div>
  );
};

export default WorkItemFilterNew;
