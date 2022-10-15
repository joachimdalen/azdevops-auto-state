import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import { IProjectInfo } from 'azure-devops-extension-api';
import { ProcessInfo } from 'azure-devops-extension-api/WorkItemTrackingProcess';

import { mockGetProjectProperties } from '../../__mocks__/azure-devops-extension-api/Core';
import { mockGetProcessByItsId } from '../../__mocks__/azure-devops-extension-api/WorkItemTrackingProcess';
import { mockGetConfiguration, mockGetProject } from '../../__mocks__/azure-devops-extension-sdk';
import { getWorkItemTypes } from '../../__test-utils__/WorkItemTestUtils';
import { StorageService } from '../../common/services/StorageService';
import WorkItemService from '../../common/services/WorkItemService';
import RuleCopyPanel from '../../rule-copy-panel/RuleCopyPanel';
import userEvent from '@testing-library/user-event';

jest.mock('azure-devops-extension-api');
//jest.mock('../../common/webLogger');

describe('RuleCopyModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(WorkItemService.prototype, 'getWorkItemTypes').mockResolvedValue(getWorkItemTypes());
    jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
  });

  it('should render default', async () => {
    mockGetConfiguration.mockReturnValue({
      rule: {}
    });
    const projectData: IProjectInfo = {
      id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375',
      name: 'demoproject'
    };

    mockGetProject.mockResolvedValue(projectData);
    mockGetProjectProperties.mockResolvedValue([
      { name: 'System.ProcessTemplateType', value: '42ced9cb-88cb-4b3b-9ee8-6f707978c375' }
    ]);

    const processInfo: Partial<ProcessInfo> = {
      name: 'MyProcess',
      parentProcessTypeId: '00000000-0000-0000-0000-000000000000',
      projects: [
        { id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375', name: 'Project1' },
        { id: '42ced9cb-88cb-4b3b-9ee8-6f707978c309', name: 'Project2' }
      ]
    } as ProcessInfo;

    mockGetProcessByItsId.mockResolvedValue(processInfo);

    render(<RuleCopyPanel />);
    const textElement = await screen.findByText(/Select project to copy rule to/i);
    expect(textElement).toBeDefined();
  });

  it('should render warning when single project in process', async () => {
    mockGetConfiguration.mockReturnValue({
      rule: {}
    });
    const projectData: IProjectInfo = {
      id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375',
      name: 'demoproject'
    };

    mockGetProject.mockResolvedValue(projectData);
    mockGetProjectProperties.mockResolvedValue([
      { name: 'System.ProcessTemplateType', value: '42ced9cb-88cb-4b3b-9ee8-6f707978c375' }
    ]);

    const processInfo: Partial<ProcessInfo> = {
      name: 'MyProcess',
      parentProcessTypeId: '00000000-0000-0000-0000-000000000000',
      projects: [{ id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375', name: 'Project1' }]
    } as ProcessInfo;

    mockGetProcessByItsId.mockResolvedValue(processInfo);

    render(<RuleCopyPanel />);
    const textElement = await screen.findByText(/No other projects using the current process/i);
    expect(textElement).toBeDefined();
  });

  it('should disable copy when no project selected', async () => {
    mockGetConfiguration.mockReturnValue({
      rule: {}
    });
    const projectData: IProjectInfo = {
      id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375',
      name: 'demoproject'
    };

    mockGetProject.mockResolvedValue(projectData);
    mockGetProjectProperties.mockResolvedValue([
      { name: 'System.ProcessTemplateType', value: '42ced9cb-88cb-4b3b-9ee8-6f707978c375' }
    ]);

    const processInfo: Partial<ProcessInfo> = {
      name: 'MyProcess',
      parentProcessTypeId: '00000000-0000-0000-0000-000000000000',
      projects: [
        { id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375', name: 'Project1' },
        { id: '42ced9cb-88cb-4b3b-9ee8-6f707978c309', name: 'Project2' }
      ]
    } as ProcessInfo;

    mockGetProcessByItsId.mockResolvedValue(processInfo);

    render(<RuleCopyPanel />);

    await screen.findByText(/Select project to copy rule to/i);

    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
  it('should activate copy when project is selected', async () => {
    mockGetConfiguration.mockReturnValue({
      rule: {}
    });

    const user = userEvent.setup();
    const projectData: IProjectInfo = {
      id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375',
      name: 'demoproject'
    };

    mockGetProject.mockResolvedValue(projectData);
    mockGetProjectProperties.mockResolvedValue([
      { name: 'System.ProcessTemplateType', value: '42ced9cb-88cb-4b3b-9ee8-6f707978c375' }
    ]);

    const processInfo: Partial<ProcessInfo> = {
      name: 'MyProcess',
      parentProcessTypeId: '00000000-0000-0000-0000-000000000000',
      projects: [
        { id: '42ced9cb-88cb-4b3b-9ee8-6f707978c375', name: 'Project1' },
        { id: '42ced9cb-88cb-4b3b-9ee8-6f707978c309', name: 'Project2' }
      ]
    } as ProcessInfo;

    mockGetProcessByItsId.mockResolvedValue(processInfo);

    render(<RuleCopyPanel />);

    await screen.findByText(/Select project to copy rule to/i);

    const projectDropdown = screen.getByRole('button', { name: 'Select project to copy rule to' });
    await user.click(projectDropdown);

    await screen.findAllByText('Project2');

    const projectOption = screen.getByRole('option', { name: 'Project2' });
    await user.click(projectOption);


    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).not.toHaveAttribute('aria-disabled', 'true');
  });
});
