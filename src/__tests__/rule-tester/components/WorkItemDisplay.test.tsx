import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import {
  getWorkItem,
  getWorkItemType,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import WorkItemDisplay from '../../../rule-tester/components/WorkItemDisplay';

describe('WorkItemDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render default', () => {
    const workItem = getWorkItem(123, WorkItemNames.UserStory, 'Active');
    render(
      <WorkItemDisplay
        workItem={workItem}
        type={getWorkItemType(WorkItemNames.UserStory, WorkItemReferenceNames.UserStory)}
      />
    );
    const textElement = screen.getByText(/Work item title for User Story/i);
    expect(textElement).toBeDefined();
  });
  it('should render state when found', () => {
    const workItem = getWorkItem(123, WorkItemNames.UserStory, 'New');
    render(
      <WorkItemDisplay
        workItem={workItem}
        type={getWorkItemType(WorkItemNames.UserStory, WorkItemReferenceNames.UserStory)}
      />
    );
    const textElement = screen.queryByText(/New/i);
    expect(textElement).toBeDefined();
  });
  it('should not render state if not found', () => {
    const workItem = getWorkItem(123, WorkItemNames.UserStory, 'In progress');
    render(
      <WorkItemDisplay
        workItem={workItem}
        type={getWorkItemType(WorkItemNames.UserStory, WorkItemReferenceNames.UserStory)}
      />
    );
    const textElement = screen.queryByText(/In progress/i);
    expect(textElement).toBeNull();
  });
  it('should render icon', () => {
    const workItem = getWorkItem(123, WorkItemNames.UserStory, 'New');
    render(
      <WorkItemDisplay
        workItem={workItem}
        type={getWorkItemType(WorkItemNames.UserStory, WorkItemReferenceNames.UserStory)}
      />
    );
    const textElement = screen.queryByRole('img');
    expect(textElement).toBeDefined();
  });
});
