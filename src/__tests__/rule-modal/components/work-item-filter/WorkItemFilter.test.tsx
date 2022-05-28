import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  getWorkItemFields,
  getWorkItemTypes,
  WorkItemReferenceNames
} from '../../../../__test-utils__/WorkItemTestUtils';
import WorkItemFilter from '../../../../rule-modal/components/work-item-filter/WorkItemFilter';
import { FilterOperation } from '../../../../rule-modal/types';
import { FilterFieldType } from '../../../../common/models/FilterItem';

describe('NewGroup', () => {
  it('should render default', async () => {
    const onChangeMock = jest.fn();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/No Filter Groups/);
  });
  it('should render multiple groups', async () => {
    const onChangeMock = jest.fn();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[
          {
            name: 'group-1',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              }
            ]
          },
          {
            name: 'group-2',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              }
            ]
          }
        ]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/group-1/);
    await screen.findAllByText(/group-2/);
  });
  it('should add using flow', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[
          {
            name: 'group-1',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              }
            ]
          }
        ]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/group-1/);

    const addFilterButton = screen.getByRole('menuitem', { name: 'Add filter' });
    await user.click(addFilterButton);

    await screen.findAllByText(/Add filter item/);

    const workItemRadio = screen.getByRole('radio', { name: 'Task Task Task' });
    await user.click(workItemRadio);

    await screen.findAllByText('Field');

    const fieldDropdown = screen.getByRole('button', { name: 'Field' });
    await user.click(fieldDropdown);

    await screen.findAllByText('Area Path');

    const areaPathButton = screen.getByRole('option', { name: 'Area Path' });
    await user.click(areaPathButton);

    await screen.findAllByText('Operator');

    const operatorDropdown = screen.getByRole('button', { name: 'Operator' });
    await user.click(operatorDropdown);

    await screen.findAllByText('= (Equals)');

    const equalsButton = screen.getByRole('option', { name: '= (Equals)' });
    await user.click(equalsButton);

    const inputField = screen.getByRole('textbox', { name: 'Value' });
    await user.type(inputField, 'SomePath/One');

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    expect(onChangeMock).toHaveBeenCalledWith([
      {
        name: 'group-1',
        workItemFilters: [
          { field: 'System.Title', operator: 'SupportedOperations.Equals', type: 0, value: 'John' },
          {
            field: 'System.AreaPath',
            operator: 'SupportedOperations.Equals',
            type: 0,
            value: 'SomePath/One'
          }
        ]
      }
    ]);
  });
  it('should add for parent using flow', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[
          {
            name: 'group-1',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              }
            ]
          }
        ]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/group-1/);

    const addFilterButton = screen.getByRole('menuitem', { name: 'Add filter' });
    await user.click(addFilterButton);

    await screen.findAllByText(/Add filter item/);

    const workItemRadio = screen.getByRole('radio', { name: 'User Story User Story User Story' });
    await user.click(workItemRadio);

    await screen.findAllByText('Field');

    const fieldDropdown = screen.getByRole('button', { name: 'Field' });
    await user.click(fieldDropdown);

    await screen.findAllByText('Area Path');

    const areaPathButton = screen.getByRole('option', { name: 'Area Path' });
    await user.click(areaPathButton);

    await screen.findAllByText('Operator');

    const operatorDropdown = screen.getByRole('button', { name: 'Operator' });
    await user.click(operatorDropdown);

    await screen.findAllByText('= (Equals)');

    const equalsButton = screen.getByRole('option', { name: '= (Equals)' });
    await user.click(equalsButton);

    const inputField = screen.getByRole('textbox', { name: 'Value' });
    await user.type(inputField, 'SomePath/One');

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    expect(onChangeMock).toHaveBeenCalledWith([
      {
        name: 'group-1',
        workItemFilters: [
          { field: 'System.Title', operator: 'SupportedOperations.Equals', type: 0, value: 'John' }
        ],
        parentFilters: [
          {
            field: 'System.AreaPath',
            operator: 'SupportedOperations.Equals',
            type: 0,
            value: 'SomePath/One'
          }
        ]
      }
    ]);
  });
  it('should remove group', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[
          {
            name: 'group-1',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              }
            ]
          },
          {
            name: 'group-2',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John Doe'
              }
            ]
          }
        ]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/group-1/);

    const addFilterButton = screen.getByTestId('__bolt-delete-filter-group-1');
    await user.click(addFilterButton);

    expect(onChangeMock).toHaveBeenCalledWith([
      {
        name: 'group-2',
        workItemFilters: [
          {
            field: 'System.Title',
            operator: FilterOperation.Equals,
            type: FilterFieldType.String,
            value: 'John Doe'
          }
        ]
      }
    ]);
  });
  it('should remove filter row', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[
          {
            name: 'group-1',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              },
              {
                field: 'System.AreaId',
                operator: FilterOperation.Equals,
                type: FilterFieldType.Integer,
                value: 10
              }
            ]
          }
        ]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/group-1/);

    const moreOptionsButton = await screen.findAllByRole('button', { name: 'More options' });
    await user.click(moreOptionsButton[0]);

    const deleteButton = screen.getByRole('menuitem', { name: 'Delete Condition' });
    await user.click(deleteButton);

    expect(onChangeMock).toHaveBeenCalledWith([
      {
        name: 'group-1',
        workItemFilters: [
          {
            field: 'System.AreaId',
            operator: FilterOperation.Equals,
            type: FilterFieldType.Integer,
            value: 10
          }
        ]
      }
    ]);
  });
  it('should should validation messages', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <WorkItemFilter
        parentType={WorkItemReferenceNames.UserStory}
        workItemType={WorkItemReferenceNames.Task}
        types={getWorkItemTypes()}
        fields={getWorkItemFields()}
        disabled={false}
        filters={[
          {
            name: 'group-1',
            workItemFilters: [
              {
                field: 'System.Title',
                operator: FilterOperation.Equals,
                type: FilterFieldType.String,
                value: 'John'
              }
            ]
          }
        ]}
        onChange={onChangeMock}
      />
    );
    await screen.findAllByText(/group-1/);

    const addFilterButton = screen.getByRole('menuitem', { name: 'Add filter' });
    await user.click(addFilterButton);

    await screen.findAllByText(/Add filter item/);

    const workItemRadio = screen.getByRole('radio', { name: 'Task Task Task' });
    await user.click(workItemRadio);

    await screen.findAllByText('Field');

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    await screen.findAllByText('Field is a required field');

    expect(onChangeMock).not.toHaveBeenCalled();
  });
});
