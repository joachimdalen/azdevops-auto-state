import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';

import { mockGetWorkItem } from '../../../__mocks__/azure-devops-extension-api/WorkItemTracking';
import WorkItemSearchSection from '../../../rule-tester/components/WorkItemSearchSection';

describe('WorkItemSearchSection', () => {
  const mockSetWorkItemId = jest.fn();
  const mockSetWorkItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render default', () => {
    render(
      <WorkItemSearchSection
        workItemId={undefined}
        setWorkItem={mockSetWorkItem}
        setWorkItemId={mockSetWorkItemId}
      />
    );
    const textElement = screen.getByText(/Work item id/i);
    expect(textElement).toBeDefined();
  });
  it('should render with button disabled by default', () => {
    render(
      <WorkItemSearchSection
        workItemId={undefined}
        setWorkItem={mockSetWorkItem}
        setWorkItemId={mockSetWorkItemId}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should activate button when id is provided', () => {
    render(
      <WorkItemSearchSection
        workItemId={1222}
        setWorkItem={mockSetWorkItem}
        setWorkItemId={mockSetWorkItemId}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-disabled', 'false');
  });
  it('should set work item id when changed', () => {
    render(
      <WorkItemSearchSection
        workItemId={undefined}
        setWorkItem={mockSetWorkItem}
        setWorkItemId={mockSetWorkItemId}
      />
    );

    const input = screen.getByPlaceholderText('Work item id');
    fireEvent.input(input, { target: { value: 123 } });

    expect(mockSetWorkItemId).toHaveBeenCalledWith(123);
  });
  it('should show error when failing to load work item', async () => {
    mockGetWorkItem.mockRejectedValue(new Error('Failed to load'));
    render(
      <WorkItemSearchSection
        workItemId={1222}
        setWorkItem={mockSetWorkItem}
        setWorkItemId={mockSetWorkItemId}
      />
    );

    const button = screen.getByRole('button');

    fireEvent.click(button);

    const textElement = await screen.findByText(/Failed to load/i);
    expect(textElement).toBeDefined();
    expect(mockSetWorkItem).not.toHaveBeenCalled();
  });
  it('should not show error when work item loads', async () => {
    mockGetWorkItem.mockResolvedValue({} as WorkItem);
    render(
      <WorkItemSearchSection
        workItemId={1222}
        setWorkItem={mockSetWorkItem}
        setWorkItemId={mockSetWorkItemId}
      />
    );

    const button = screen.getByRole('button');

    fireEvent.click(button);

    await waitFor(() => expect(mockSetWorkItem).toHaveBeenCalledTimes(1));
  });
});
