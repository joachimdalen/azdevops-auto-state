import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';

import StateTag from './component/StateTag';

export const renderStateCell = (
  _rowIndex: number,
  columnIndex: number,
  _tableColumn: ITableColumn<IListBoxItem>,
  tableItem: IListBoxItem
): JSX.Element => {
  const color: any = tableItem.data;
  return (
    <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
      <StateTag color={color} text={tableItem.text || 'Unknown'} />
    </SimpleTableCell>
  );
};

export const getStatesForWorkItemType = (
  types: WorkItemType[],
  type: string,
  currentStates: string[],
  include = false
): IListBoxItem[] => {
  return types
    .filter(x => x.referenceName === type)
    .flatMap(x => {
      return x.states
        .filter(y => currentStates.includes(y.name) === include)
        .map(state => {
          const item: IListBoxItem = {
            id: state.name,
            text: state.name,
            data: state.color
          };
          return item;
        });
    });
};
