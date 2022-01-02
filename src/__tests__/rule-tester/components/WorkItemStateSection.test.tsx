import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import {
  getWorkItem,
  getWorkItemTypes,
  WorkItemNames
} from '../../../__test-utils__/WorkItemTestUtils';
import WorkItemStateSection from '../../../rule-tester/components/WorkItemStateSection';

describe('WorkItemStateSection', () => {
  const workItem = getWorkItem(123, WorkItemNames.UserStory, 'Active');
  const mockOnTest = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render default', () => {
    render(
      <WorkItemStateSection workItem={workItem} types={getWorkItemTypes()} onTest={mockOnTest} />
    );
    const textElement = screen.getByText(/Transition state/i);
    expect(textElement).toBeDefined();
  });
});
