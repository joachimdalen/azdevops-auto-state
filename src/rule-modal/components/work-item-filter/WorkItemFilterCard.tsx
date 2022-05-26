import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { TitleSize } from 'azure-devops-ui/Header';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import { useMemo, useState } from 'react';

import { FilterGroup } from '../../../common/models/FilterGroup';
import FilterItem from '../../../common/models/FilterItem';
import { WorkItemFilterInternalProps } from './types';
import WorkItemFilterTable from './WorkItemFilterTable';

interface WorkItemFilterCardProps extends WorkItemFilterInternalProps {
  remove: (target: 'workItem' | 'parent', item: FilterItem) => void;
  removeGroup: () => void;
  addFilter: () => void;
  group: FilterGroup;
  disabled?: boolean;
}

const WorkItemFilterCard = ({
  remove,
  removeGroup,
  addFilter,
  group,
  parent,
  workItem,
  disabled = false
}: WorkItemFilterCardProps): JSX.Element => {
  const [selectedTabId, setSelectedTabId] = useState<string>('work-item');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const [workItemProvider, parentProvider] = useMemo(() => {
    return [
      new ArrayItemProvider(group.workItemFilters || []),
      new ArrayItemProvider(group.parentFilters || [])
    ];
  }, [group.parentFilters, group.workItemFilters]);

  return (
    <Card
      className="filter-card"
      collapsible
      collapsed={collapsed}
      onCollapseClick={() => setCollapsed(prev => !prev)}
      headerClassName="flex-grow"
      titleProps={{ text: group.name, size: TitleSize.Small }}
      contentProps={{ contentPadding: false }}
      headerCommandBarItems={
        collapsed
          ? []
          : [
              {
                id: 'add',
                text: 'Add filter',
                iconProps: { iconName: 'Add' },
                isPrimary: true,
                disabled: disabled,
                onActivate: () => addFilter()
              },
              {
                id: 'delete',
                ariaLabel: 'Delete',
                disabled: disabled,
                iconProps: { iconName: 'Delete' },
                onActivate: () => removeGroup()
              }
            ]
      }
    >
      <div className="flex-column  flex-grow">
        <Surface background={SurfaceBackground.neutral}>
          <TabBar
            tabSize={TabSize.Compact}
            onSelectedTabChanged={t => setSelectedTabId(t)}
            selectedTabId={selectedTabId}
            className="padding-horizontal-4 padding-vertical-4 margin-bottom-16"
          >
            <Tab
              id="work-item"
              name={`Work Item (${workItem?.name})`}
              iconProps={
                workItem === undefined
                  ? undefined
                  : {
                      render: className => (
                        <img className="margin-right-4" height={16} src={workItem?.icon?.url} />
                      )
                    }
              }
            />
            <Tab
              id="parent"
              name={`Parent (${parent?.name})`}
              iconProps={
                parent === undefined
                  ? undefined
                  : {
                      render: className => (
                        <img className="margin-right-4" height={16} src={parent.icon?.url} />
                      )
                    }
              }
            />
          </TabBar>
        </Surface>
        <ConditionalChildren
          renderChildren={selectedTabId === 'work-item' && workItemProvider.length !== 0}
        >
          <WorkItemFilterTable
            remove={(target, item) => remove(target, item)}
            itemProvider={workItemProvider}
            disabled={disabled}
          />
        </ConditionalChildren>
        <ConditionalChildren
          renderChildren={selectedTabId === 'work-item' && workItemProvider.length === 0}
        >
          <ZeroData
            imageAltText={''}
            iconProps={{ iconName: 'WorkItem' }}
            primaryText="No filters added"
          />
        </ConditionalChildren>

        <ConditionalChildren
          renderChildren={selectedTabId === 'parent' && parentProvider.length !== 0}
        >
          <WorkItemFilterTable
            remove={(target, item) => remove(target, item)}
            itemProvider={parentProvider}
            disabled={disabled}
          />
        </ConditionalChildren>
        <ConditionalChildren
          renderChildren={selectedTabId === 'parent' && parentProvider.length === 0}
        >
          <ZeroData
            imageAltText={''}
            iconProps={{ iconName: 'WorkItem' }}
            primaryText="No filters added"
          />
        </ConditionalChildren>
      </div>
    </Card>
  );
};

export default WorkItemFilterCard;
