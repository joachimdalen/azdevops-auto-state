import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';

import StateTag from '../shared-ui/component/StateTag';

export const getWorkItemTypeItems = (
  types: WorkItemType[],
  ignoreTypes: string[]
): IListBoxItem[] => {
  return types
    .filter(x => !ignoreTypes.includes(x.referenceName))
    .map(x => {
      const item: IListBoxItem = {
        id: x.referenceName,
        text: x.name,
        data: {
          icon: x.icon
        }
      };
      return item;
    });
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

export const renderStateCell = (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IListBoxItem>,
  tableItem: IListBoxItem
): JSX.Element => {
  const color: any = tableItem.data;
  return (
    <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
      <StateTag color={color} text={tableItem.text || 'Unknown'} />
    </SimpleTableCell>
  );
};
export const renderWorkItemCell = (
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IListBoxItem>,
  tableItem: IListBoxItem
): JSX.Element => {
  const date: any = tableItem.data;
  return (
    <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
      <div className="flex-row flex-center">
        <img src={date?.icon?.url} height={16} />
        <span className="margin-left-16">{tableItem?.text}</span>
      </div>
    </SimpleTableCell>
  );
};
