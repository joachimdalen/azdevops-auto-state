import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { WorkItemField, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ColumnMore, ITableColumn, SimpleTableCell, Table } from 'azure-devops-ui/Table';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo, useState } from 'react';

import FilterItem, { FilterFieldType } from '../../common/models/FilterItem';
import { filterOperations } from '../types';
import PersonaDisplay from './PersonaDisplay';
import WorkItemFilterModal from './WorkItemFilterModal';

interface WorkItemFilterProps {
  workItemType?: WorkItemType;
  fields: WorkItemField[];
  disabled: boolean;
  filters: FilterItem[];
  onChange: (filters: FilterItem[]) => void;
}

const WorkItemFilter = ({
  fields,
  workItemType,
  disabled,
  filters,
  onChange
}: WorkItemFilterProps): JSX.Element => {
  const [addWorkItemFilter, setAddWorkItemFilter] = useState(false);

  const remove = (filt: FilterItem) => {
    if (filters.findIndex(x => x.field === filt.field) !== -1) {
      onChange(filters.filter(x => x.field !== filt.field));
    }
  };

  const tableItems = useMemo(() => new ArrayItemProvider(filters), [filters]);

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <Button
        text="Add"
        iconProps={{ iconName: 'Add' }}
        disabled={disabled}
        onClick={() => setAddWorkItemFilter(true)}
      />
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ConditionalChildren renderChildren={filters.length === 0}>
          <span>No filters added</span>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={filters.length > 0}>
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
                    contentClassName="font-size-m scroll-hidden"
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
                    contentClassName="font-size-m scroll-hidden"
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
                    contentClassName="font-weight-semibold font-size-m scroll-hidden"
                  >
                    <ConditionalChildren
                      renderChildren={tableItem.type === FilterFieldType.Identity}
                    >
                      <PersonaDisplay approver={tableItem.value as IInternalIdentity} />
                    </ConditionalChildren>
                    <ConditionalChildren
                      renderChildren={tableItem.type !== FilterFieldType.Identity}
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
            itemProvider={tableItems}
          />
        </ConditionalChildren>
      </div>
      {addWorkItemFilter && (
        <WorkItemFilterModal
          workItemType={workItemType}
          fields={fields}
          onClose={() => setAddWorkItemFilter(false)}
          onAddItem={(filterItem: FilterItem) => onChange([...filters, filterItem])}
        />
      )}
    </div>
  );
};

export default WorkItemFilter;
