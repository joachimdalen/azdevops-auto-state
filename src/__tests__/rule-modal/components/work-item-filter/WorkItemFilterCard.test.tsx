import { fireEvent, prettyDOM, render, screen } from '@testing-library/react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import FilterItem, { FilterFieldType } from '../../../../common/models/FilterItem';
import WorkItemFilterCard from '../../../../rule-modal/components/work-item-filter/WorkItemFilterCard';
import { FilterOperation } from '../../../../rule-modal/types';

describe('WorkItemFilterCard', () => {
  const removeMock = jest.fn();
  const removeGroupMock = jest.fn();
  const addFilterMock = jest.fn();
  it('should render default', async () => {
    render(
      <WorkItemFilterCard
        remove={removeMock}
        removeGroup={removeGroupMock}
        addFilter={addFilterMock}
        group={{ name: 'new-group' }}
      />
    );
    await screen.findAllByText(/new-group/);

    const textElement = screen.getByText(/new-group/i);
    expect(textElement).toBeDefined();
  });
  it('should render empty when no filters added', async () => {
    render(
      <WorkItemFilterCard
        remove={removeMock}
        removeGroup={removeGroupMock}
        addFilter={addFilterMock}
        group={{ name: 'new-group' }}
      />
    );
    await screen.findAllByText(/new-group/);
    await screen.findAllByText(/No filters added/);
  });

  it('should render work item information', async () => {
    const parent: Partial<WorkItemType> = {
      name: 'User Story',
      icon: {
        id: '1',
        url: 'https://localhost/user_story.png'
      }
    };
    const workItem: Partial<WorkItemType> = {
      name: 'Task',
      icon: {
        id: '1',
        url: 'https://localhost/task.png'
      }
    };

    render(
      <WorkItemFilterCard
        remove={removeMock}
        removeGroup={removeGroupMock}
        addFilter={addFilterMock}
        group={{
          name: 'new-group',
          workItemFilters: [
            {
              field: 'System.Tags',
              operator: FilterOperation.Equals,
              type: FilterFieldType.String,
              value: 'one;two'
            }
          ]
        }}
        parent={parent as WorkItemType}
        workItem={workItem as WorkItemType}
      />
    );
    await screen.findAllByText(/new-group/);

    const workItemTextElement = screen.getByText('Work Item (Task)');
    const parentTextElement = screen.getByText('Parent (User Story)');
    expect(workItemTextElement).toBeDefined();
    expect(parentTextElement).toBeDefined();
  });

  it('should remove workItem filter item on delete', async () => {
    const parent: Partial<WorkItemType> = {
      name: 'User Story',
      icon: {
        id: '1',
        url: 'https://localhost/user_story.png'
      }
    };
    const workItem: Partial<WorkItemType> = {
      name: 'Task',
      icon: {
        id: '1',
        url: 'https://localhost/task.png'
      }
    };
    const item: FilterItem = {
      field: 'System.Tags',
      operator: FilterOperation.Equals,
      type: FilterFieldType.String,
      value: 'one;two'
    };

    render(
      <WorkItemFilterCard
        remove={removeMock}
        removeGroup={removeGroupMock}
        addFilter={addFilterMock}
        group={{
          name: 'new-group',
          workItemFilters: [item]
        }}
        parent={parent as WorkItemType}
        workItem={workItem as WorkItemType}
      />
    );
    await screen.findAllByText(/new-group/);

    const moreOptionsButton = screen.getByRole('button', { name: 'More options' });
    fireEvent.click(moreOptionsButton);

    await screen.findAllByText(/Delete Condition/);

    const deleteButton = screen.getByRole('menuitem', { name: 'Delete Condition' });
    fireEvent.click(deleteButton);

    expect(removeMock).toHaveBeenCalledWith('workItem', item);
  });
});
