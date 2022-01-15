import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { mockGetWorkItem } from '../../__mocks__/azure-devops-extension-api/Wit';
import { mockGetConfiguration } from '../../__mocks__/azure-devops-extension-sdk';
import {
  getWorkItem,
  getWorkItemTypes,
  WorkItemNames
} from '../../__test-utils__/WorkItemTestUtils';
import RuleProcessor from '../../common/services/RuleProcessor';
import { StorageService } from '../../common/services/StorageService';
import WorkItemService from '../../common/services/WorkItemService';
import RuleTester from '../../rule-tester/RuleTester';

jest.mock('azure-devops-extension-api');
jest.mock('../../common/webLogger');

describe('RuleTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(WorkItemService.prototype, 'getWorkItemTypes').mockResolvedValue(getWorkItemTypes());
    jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
  });

  it('should render default', async () => {
    mockGetConfiguration.mockReturnValue({});

    render(<RuleTester />);
    const textElement = await screen.findByText(/Work item id/i);
    expect(textElement).toBeDefined();
  });

  it('should render clear button when work item selected', async () => {
    mockGetConfiguration.mockReturnValue({});
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));

    render(<RuleTester />);

    const input = screen.getByRole('spinbutton', { name: 'Work item id' });
    fireEvent.change(input, { target: { value: 123 } });

    const loadButton = screen.getByRole('button', { name: 'Load' });
    fireEvent.click(loadButton);

    await waitFor(() => screen.getAllByText(/Work item title for Task/));

    const clearButton = screen.queryByRole('button', { name: 'Clear' });
    expect(clearButton).toBeDefined();
  });

  it('should clear selected work item when clicked', async () => {
    mockGetConfiguration.mockReturnValue({});
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));

    render(<RuleTester />);

    const input = screen.getByRole('spinbutton', { name: 'Work item id' });
    fireEvent.change(input, { target: { value: 123 } });

    const loadButton = screen.getByRole('button', { name: 'Load' });
    fireEvent.click(loadButton);

    await waitFor(() => screen.getAllByText(/Work item title for Task/));

    const clearButton = screen.getByRole('button', { name: 'Clear' });
    fireEvent.click(clearButton);

    await waitFor(() => screen.getAllByText(/Work item id/));
  });

  it('should render pre selected work item when given', async () => {
    mockGetConfiguration.mockReturnValue({ workItemId: 123 });
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));
    render(<RuleTester />);
    const textElement = await screen.findByText(/Work item title for Task/i);
    expect(textElement).toBeDefined();
  });

  it('should not render clear button when work item is predefined', async () => {
    mockGetConfiguration.mockReturnValue({ workItemId: 123 });
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));
    render(<RuleTester />);

    await waitFor(() => screen.getAllByText(/Work item title for Task/));

    const clearButton = screen.queryByRole('button', { name: 'Clear' });
    expect(clearButton).toBeNull();
  });

  it('should show loader when test button is clicked', async () => {
    mockGetConfiguration.mockReturnValue({ workItemId: 123 });
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));
    jest.spyOn(RuleProcessor.prototype, 'process').mockResolvedValue([
      {
        id: 1,
        sourceState: 'New',
        title: '',
        type: '',
        updatedState: ''
      },
      {
        id: 2,
        sourceState: 'New',
        title: 'Some user state',
        type: WorkItemNames.UserStory,
        updatedState: 'Active'
      }
    ]);

    render(<RuleTester />);

    await waitFor(() => screen.getAllByText(/Work item title for Task/));

    const dropdown = screen.getByRole('button', { name: 'Transition state' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getAllByText(/Active/));
    const selectableItem = screen.getByText('Active');
    fireEvent.click(selectableItem);

    const testButton = screen.getByRole('button', { name: 'Test' });
    fireEvent.click(testButton);

    await waitFor(() =>
      screen.getAllByText(/Testing rules.. This might take a few seconds. Please wait/)
    );
  });

  it('should render results', async () => {
    mockGetConfiguration.mockReturnValue({ workItemId: 123 });
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));
    jest.spyOn(RuleProcessor.prototype, 'process').mockResolvedValue([
      {
        id: 1,
        sourceState: 'New',
        title: '',
        type: '',
        updatedState: ''
      },
      {
        id: 2,
        sourceState: 'New',
        title: 'This would update',
        type: WorkItemNames.UserStory,
        updatedState: 'Active'
      }
    ]);

    render(<RuleTester />);

    await waitFor(() => screen.getAllByText(/Work item title for Task/));

    const dropdown = screen.getByRole('button', { name: 'Transition state' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getAllByText(/Active/));
    const selectableItem = screen.getByText('Active');
    fireEvent.click(selectableItem);

    const testButton = screen.getByRole('button', { name: 'Test' });
    fireEvent.click(testButton);

    await waitFor(() =>
      screen.getAllByText(/Testing rules.. This might take a few seconds. Please wait/)
    );

    await waitFor(() => screen.getAllByText(/This would update/));
  });

  it('should show error when failing', async () => {
    mockGetConfiguration.mockReturnValue({ workItemId: 123 });
    mockGetWorkItem.mockResolvedValue(getWorkItem(123, WorkItemNames.Task, 'New'));
    jest.spyOn(RuleProcessor.prototype, 'process').mockRejectedValue(new Error('Failed'));

    render(<RuleTester />);

    await waitFor(() => screen.getAllByText(/Work item title for Task/));

    const dropdown = screen.getByRole('button', { name: 'Transition state' });
    fireEvent.click(dropdown);
    await waitFor(() => screen.getAllByText(/Active/));
    const selectableItem = screen.getByText('Active');
    fireEvent.click(selectableItem);

    const testButton = screen.getByRole('button', { name: 'Test' });
    fireEvent.click(testButton);

    await waitFor(() =>
      screen.getAllByText(/n error occurred while testing the work item:/)
    );
  });
});
