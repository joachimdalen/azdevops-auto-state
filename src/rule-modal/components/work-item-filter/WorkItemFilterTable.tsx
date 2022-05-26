import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { IReadonlyObservableValue } from 'azure-devops-ui/Core/Observable';
import { ColumnMore, ITableColumn, SimpleTableCell, Table } from 'azure-devops-ui/Table';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { IItemProvider } from 'azure-devops-ui/Utilities/Provider';

import FilterItem, { FilterFieldType } from '../../../common/models/FilterItem';
import { filterOperations } from '../../types';
import PersonaDisplay from '../PersonaDisplay';
import WorkItemTagDisplay from '../WorkItemTagDisplay';

interface WorkItemFilterTableProps {
  itemProvider: IItemProvider<FilterItem | IReadonlyObservableValue<FilterItem | undefined>>;
  remove: (target: 'workItem' | 'parent', item: FilterItem) => void;
  disabled?: boolean;
}
const WorkItemFilterTable = ({
  itemProvider,
  remove,
  disabled = false
}: WorkItemFilterTableProps): JSX.Element => {
  return (
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
                  tableItem.type !== FilterFieldType.Identity && tableItem.field !== 'System.Tags'
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
                disabled: disabled,
                iconProps: { iconName: 'Delete' },
                onActivate: () => remove('workItem', item)
              }
            ]
          };
        })
      ]}
      itemProvider={itemProvider}
    />
  );
};
export default WorkItemFilterTable;
