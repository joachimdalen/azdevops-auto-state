import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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
  it('should render with button disabled by default', () => {
    render(
      <WorkItemStateSection workItem={workItem} types={getWorkItemTypes()} onTest={mockOnTest} />
    );
    const button = screen.getByRole('button', { name: 'Test' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should when state is selected', async () => {
    render(
      <WorkItemStateSection workItem={workItem} types={getWorkItemTypes()} onTest={mockOnTest} />
    );

    const dropdown = screen.getByRole('button', { name: 'Transition state' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getAllByText(/Active/));
    const selectableItem = screen.getByText('Active');
    fireEvent.click(selectableItem);

    const button = screen.getByRole('button', { name: 'Test' });

    expect(button).not.toHaveAttribute('aria-disabled', 'false');
  });

  it('should call test when valid and pressed', async () => {
    render(
      <WorkItemStateSection workItem={workItem} types={getWorkItemTypes()} onTest={mockOnTest} />
    );

    const dropdown = screen.getByRole('button', { name: 'Transition state' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getAllByText(/Active/));
    const selectableItem = screen.getByText('Active');
    fireEvent.click(selectableItem);

    const button = screen.getByRole('button', { name: 'Test' });
    fireEvent.click(button);

    expect(mockOnTest).toHaveBeenCalledWith('Active');
  });
});
