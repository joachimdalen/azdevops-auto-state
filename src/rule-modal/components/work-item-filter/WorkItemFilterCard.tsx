import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Card } from 'azure-devops-ui/Card';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { TitleSize } from 'azure-devops-ui/Header';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ColumnMore, ITableColumn, SimpleTableCell, Table } from 'azure-devops-ui/Table';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useState } from 'react';

import FilterItem, { FilterFieldType } from '../../../common/models/FilterItem';
import { filterOperations } from '../../types';
import PersonaDisplay from '../PersonaDisplay';
import WorkItemTagDisplay from '../WorkItemTagDisplay';
import { WorkItemFilterInternalProps } from './types';

interface WorkItemFilterCardProps extends WorkItemFilterInternalProps {
  remove: (item: FilterItem) => void;
  items: ArrayItemProvider<FilterItem>;
}

const WorkItemFilterCard = ({
  remove,
  items,
  parent,
  workItem
}: WorkItemFilterCardProps): JSX.Element => {
  const [selectedTabId, setSelectedTabId] = useState<string>('work-item');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <Card
      className="filter-card"
      collapsible
      collapsed={collapsed}
      onCollapseClick={() => setCollapsed(prev => !prev)}
      headerClassName="flex-grow"
      titleProps={{ text: 'Default group', size: TitleSize.Small }}
      contentProps={{ contentPadding: false }}
      headerCommandBarItems={
        collapsed
          ? []
          : [
              { id: 'add', text: 'Add filter', iconProps: { iconName: 'Add' }, isPrimary: true },
              {
                id: 'delete',
                ariaLabel: 'Delete',
                iconProps: { iconName: 'Delete' }
              }
            ]
      }
    >
      <div className="flex-column">
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
                        <img className="margin-right-4" height={16} src={workItem.icon} />
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
                        <img className="margin-right-4" height={16} src={parent.icon} />
                      )
                    }
              }
            />
          </TabBar>
        </Surface>
        <Table
          columns={[
            {
              id: 'field',
              name: 'Field',
              width: -100,
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<FilterItem>,
                tableItem: FilterItem
              ) => (
                <SimpleTableCell
                  columnIndex={columnIndex}
                  tableColumn={tableColumn}
                  key={'col-' + columnIndex}
                  contentClassName="font-size scroll-hidden"
                >
                  <Tooltip text={tableItem.field}>
                    <span>{tableItem.field}</span>
                  </Tooltip>
                </SimpleTableCell>
              )
            },
            {
              id: 'operator',
              name: 'Operator',
              width: -100,
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<FilterItem>,
                tableItem: FilterItem
              ) => (
                <SimpleTableCell
                  columnIndex={columnIndex}
                  tableColumn={tableColumn}
                  key={'col-' + columnIndex}
                  contentClassName="font-size scroll-hidden"
                >
                  {filterOperations.find(x => x.referenceName === tableItem.operator)?.name}
                </SimpleTableCell>
              )
            },
            {
              id: 'value',
              name: 'Value',
              width: -100,
              renderCell: (
                rowIndex: number,
                columnIndex: number,
                tableColumn: ITableColumn<FilterItem>,
                tableItem: FilterItem
              ) => (
                <SimpleTableCell
                  columnIndex={columnIndex}
                  tableColumn={tableColumn}
                  key={'col-' + columnIndex}
                  contentClassName="font-weight-semibold font-size scroll-hidden"
                >
                  <ConditionalChildren renderChildren={tableItem.type === FilterFieldType.Identity}>
                    <PersonaDisplay approver={tableItem.value as IInternalIdentity} />
                  </ConditionalChildren>
                  <ConditionalChildren renderChildren={tableItem.field === 'System.Tags'}>
                    <WorkItemTagDisplay tags={tableItem.value as string} />
                  </ConditionalChildren>
                  <ConditionalChildren
                    renderChildren={
                      tableItem.type !== FilterFieldType.Identity &&
                      tableItem.field !== 'System.Tags'
                    }
                  >
                    {tableItem.value}
                  </ConditionalChildren>
                </SimpleTableCell>
              )
            },
            new ColumnMore((item: FilterItem) => {
              return {
                id: 'sub-menu',
                items: [
                  {
                    id: 'delete',
                    text: 'Delete',
                    iconProps: { iconName: 'Delete' },
                    onActivate: () => remove(item)
                  }
                ]
              };
            })
          ]}
          itemProvider={items}
        />
      </div>
    </Card>
  );
};

export default WorkItemFilterCard;
