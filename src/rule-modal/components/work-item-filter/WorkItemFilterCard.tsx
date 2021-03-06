import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { TitleSize } from 'azure-devops-ui/Header';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import cx from 'classnames';
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
  error?: string;
}

const WorkItemFilterCard = ({
  remove,
  removeGroup,
  addFilter,
  group,
  parent,
  workItem,
  error,
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
      className={cx('filter-card', { 'filter-card-error': error !== undefined })}
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
                id: `add-filter-${group.name}`,
                text: 'Add filter',
                iconProps: { iconName: 'Add' },
                isPrimary: true,
                disabled: disabled,
                onActivate: () => addFilter()
              },
              {
                id: `delete-filter-${group.name}`,
                ariaLabel: 'Delete Group',
                disabled: disabled,
                iconProps: { iconName: 'Delete' },
                onActivate: () => removeGroup()
              }
            ]
      }
    >
      <div className="flex-column  flex-grow">
        <Surface background={SurfaceBackground.neutral}>
          {error && <MessageCard severity={MessageCardSeverity.Error}>{error}</MessageCard>}
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
            remove={item => remove('workItem', item)}
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
            remove={item => remove('parent', item)}
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
