import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { mockGetConfiguration } from '../../__mocks__/azure-devops-extension-sdk';
import { getWorkItemTypes } from '../../__test-utils__/WorkItemTestUtils';
import RuleDocument from '../../common/models/WorkItemRules';
import RuleService from '../../common/services/RuleService';
import { StorageService } from '../../common/services/StorageService';
import WorkItemService from '../../common/services/WorkItemService';
import { presets } from '../../presets-panel/constants';
import PresetsPanel from '../../presets-panel/PresetsPanel';

jest.mock('../../common/webLogger');

const defaultRules: RuleDocument[] = [
  {
    id: 'Microsoft.VSTS.WorkItemTypes.Task',
    rules: [
      {
        id: 'e16dbbd7-1727-42c9-a722-8681b6d25942',
        workItemType: 'Microsoft.VSTS.WorkItemTypes.Task',
        parentType: 'Microsoft.VSTS.WorkItemTypes.UserStory',
        transitionState: 'Active',
        parentExcludedStates: ['Removed', 'Closed', 'Resolved', 'Active'],
        parentTargetState: 'Active',
        childrenLookup: false,
        processParent: true,
        disabled: false,
        groups: []
      },
      {
        id: '81646635-5da4-4af4-b8b0-f05845e575fc',
        workItemType: 'Microsoft.VSTS.WorkItemTypes.Task',
        parentType: 'Microsoft.VSTS.WorkItemTypes.UserStory',
        transitionState: 'Closed',
        parentExcludedStates: ['Removed', 'Closed', 'Resolved'],
        parentTargetState: 'Resolved',
        childrenLookup: true,
        processParent: true,
        disabled: false,
        groups: []
      }
    ]
  }
];
describe('PresetsPanel', () => {
  const getProcessTemplateNameSpy = jest.spyOn(WorkItemService.prototype, 'getProcessTemplateName');
  const getRuleDocumentsSpy = jest.spyOn(StorageService.prototype, 'getRuleDocuments');
  const updateRuleSpy = jest.spyOn(RuleService.prototype, 'updateRule');
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(WorkItemService.prototype, 'getWorkItemTypes').mockResolvedValue(getWorkItemTypes());
    getProcessTemplateNameSpy.mockResolvedValue('MyProcess');
    getRuleDocumentsSpy.mockResolvedValue([]);
  });

  it('should render default', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    render(<PresetsPanel />);
    await screen.findAllByText(/Hide already created rules/);

    const textElement = screen.getByText(/Hide already created rules/i);
    expect(textElement).toBeDefined();
  });

  it('should render loader', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    render(<PresetsPanel />);
    await screen.findAllByText(/Loading.../);
  });

  it('should render ZeroData when process has no presets', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Dummy');
    render(<PresetsPanel />);
    await screen.findAllByText(/No preset rules found for the current process/);

    const textElement = screen.getByText(/No preset rules found for the current process/i);
    expect(textElement).toBeDefined();
  });

  it('should only render toggle for non existing rules', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    getRuleDocumentsSpy.mockResolvedValue(defaultRules);
    render(<PresetsPanel />);
    await screen.findAllByText(/Hide already created rules/);

    const toggles = screen.queryAllByRole('switch');
    const toggle = screen.queryByTestId('__bolt-agile-task-active');

    expect(toggles.length).not.toEqual(0);
    expect(toggle).toBeNull();
  });

  it('should render create button initially disabled', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    getRuleDocumentsSpy.mockResolvedValue(defaultRules);
    render(<PresetsPanel />);
    await screen.findAllByText(/Hide already created rules/);

    const button = screen.getByRole('button', {
      name: /create/i
    });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render selected count in button', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    getRuleDocumentsSpy.mockResolvedValue(defaultRules);
    render(<PresetsPanel />);
    await screen.findAllByText(/Hide already created rules/);

    const toggle = screen.getByTestId('__bolt-agile-feature-active');

    fireEvent.click(toggle);

    const button = screen.getByRole('button', {
      name: /create/i
    });

    expect(button).toHaveTextContent('Create (1)');
    expect(button).toHaveAttribute('aria-disabled', 'false');
  });

  it('should enable and disabled button', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    getRuleDocumentsSpy.mockResolvedValue(defaultRules);
    render(<PresetsPanel />);
    await screen.findAllByText(/Hide already created rules/);

    const toggle = screen.getByTestId('__bolt-agile-feature-active');

    fireEvent.click(toggle);

    const button = screen.getByRole('button', {
      name: /create/i
    });

    expect(button).toHaveTextContent('Create (1)');
    expect(button).toHaveAttribute('aria-disabled', 'false');

    fireEvent.click(toggle);
    expect(button).toHaveTextContent('Create');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should create rules', async () => {
    getProcessTemplateNameSpy.mockResolvedValueOnce('Agile');
    getRuleDocumentsSpy.mockResolvedValue(defaultRules);
    updateRuleSpy.mockResolvedValue({ success: true });

    mockGetConfiguration.mockResolvedValue({
      panel: true,
      close: (result: any) => jest.fn()
    });

    render(<PresetsPanel />);
    await screen.findAllByText(/Hide already created rules/);

    const rules = presets.find(x => x.id === 'agile-feature-active');
    const toggle = screen.getByTestId('__bolt-agile-feature-active');

    fireEvent.click(toggle);

    const button = screen.getByRole('button', {
      name: /create/i
    });

    fireEvent.click(button);

    await waitFor(() => expect(updateRuleSpy).toHaveBeenCalledTimes(1));

    expect(updateRuleSpy).toHaveBeenCalledWith(rules?.rule.workItemType, rules?.rule);
  });
});
