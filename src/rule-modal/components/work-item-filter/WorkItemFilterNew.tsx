import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo, useState } from 'react';

import FilterItem from '../../../common/models/FilterItem';
import { WorkItemFilterInternalProps } from './types';
import WorkItemFilterCard from './WorkItemFilterCard';

interface WorkItemFilterNewProps {
  parentType: string;
  workItemType: string;
  types: WorkItemType[];
  disabled: boolean;
  filters: FilterItem[];
  onChange: (filters: FilterItem[]) => void;
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

  const remove = (filt: FilterItem) => {
    if (filters.findIndex(x => x.field === filt.field) !== -1) {
      onChange(filters.filter(x => x.field !== filt.field));
    }
  };

  const tableItems = useMemo(() => new ArrayItemProvider(filters), [filters]);

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <Button
        text="Add new group"
        primary
        iconProps={{ iconName: 'Add' }}
        disabled={disabled}
        onClick={() => setAddWorkItemFilter(true)}
      />
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren renderChildren={filters.length === 0}>
          <span>No filters added</span>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={filters.length > 0}>
          <Surface background={SurfaceBackground.callout}>
            <WorkItemFilterCard
              workItem={intProps.workItem}
              parent={intProps.parent}
              remove={(item: FilterItem) => remove(item)}
              items={tableItems}
            />
            <WorkItemFilterCard remove={(item: FilterItem) => remove(item)} items={tableItems} />
            <WorkItemFilterCard remove={(item: FilterItem) => remove(item)} items={tableItems} />
            <WorkItemFilterCard remove={(item: FilterItem) => remove(item)} items={tableItems} />
            <WorkItemFilterCard remove={(item: FilterItem) => remove(item)} items={tableItems} />
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
