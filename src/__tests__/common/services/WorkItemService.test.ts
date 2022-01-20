import { IProjectInfo } from 'azure-devops-extension-api';
import { ProjectProperty } from 'azure-devops-extension-api/Core';
import { ProcessInfo } from 'azure-devops-extension-api/WorkItemTrackingProcess';

import { mockGetProjectProperties } from '../../../__mocks__/azure-devops-extension-api/Core';
import { mockGetWorkItemTypes } from '../../../__mocks__/azure-devops-extension-api/WorkItemTracking';
import {
  mockGetProcessByItsId,
  mockGetProcessWorkItemTypes
} from '../../../__mocks__/azure-devops-extension-api/WorkItemTrackingProcess';
import { mockGetProject } from '../../../__mocks__/azure-devops-extension-sdk';
import {
  getProcessWorkItemTypes,
  getWorkItemTypes,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import WorkItemService from '../../../common/services/WorkItemService';

jest.mock('azure-devops-extension-api');

const rootItems = [
  WorkItemReferenceNames.Epic,
  WorkItemReferenceNames.Feature,
  WorkItemReferenceNames.UserStory,
  WorkItemReferenceNames.Task,
  WorkItemReferenceNames.Documentation
] as string[];
const processItems = [
  WorkItemReferenceNames.Epic,
  WorkItemReferenceNames.Feature,
  WorkItemReferenceNames.UserStory
] as string[];

describe('WorkItemService', () => {
  describe('getWorkItemTypes', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return empty when failing to load project', async () => {
      mockGetProject.mockResolvedValue(undefined);
      mockGetWorkItemTypes.mockResolvedValue(getWorkItemTypes());

      const wiService = new WorkItemService();
      const wiTypes = await wiService.getWorkItemTypes();

      expect(wiTypes).toEqual([]);
    });
    it('should load all types when setting is false', async () => {
      const project: IProjectInfo = {
        id: '5395360b-3cb4-456c-acb8-b2107d72395e',
        name: 'Demo Project'
      };
      mockGetProject.mockResolvedValue(project);
      mockGetWorkItemTypes.mockResolvedValue(getWorkItemTypes());

      const wiService = new WorkItemService();
      const wiTypes = await wiService.getWorkItemTypes();

      expect(wiTypes.every(x => rootItems.includes(x.referenceName))).toBeTruthy();
    });
    it('should load return default when failing to get template', async () => {
      const project: IProjectInfo = {
        id: '5395360b-3cb4-456c-acb8-b2107d72395e',
        name: 'Demo Project'
      };
      mockGetProject.mockResolvedValue(project);
      mockGetWorkItemTypes.mockResolvedValue(getWorkItemTypes());
      mockGetProjectProperties.mockResolvedValue([]);

      const wiService = new WorkItemService();
      const wiTypes = await wiService.getWorkItemTypes(true);

      expect(wiTypes.every(x => rootItems.includes(x.referenceName))).toBeTruthy();
    });
    it('should only load types from process', async () => {
      const project: IProjectInfo = {
        id: '5395360b-3cb4-456c-acb8-b2107d72395e',
        name: 'Demo Project'
      };
      mockGetProject.mockResolvedValue(project);
      mockGetWorkItemTypes.mockResolvedValue(getWorkItemTypes());
      mockGetProjectProperties.mockResolvedValue([
        { name: 'System.ProcessTemplateType', value: '42ced9cb-88cb-4b3b-9ee8-6f707978c375' }
      ]);
      mockGetProcessWorkItemTypes.mockResolvedValue(getProcessWorkItemTypes());

      const wiService = new WorkItemService();
      const wiTypes = await wiService.getWorkItemTypes(true);

      expect(wiTypes.every(x => processItems.includes(x.referenceName))).toBeTruthy();
    });
  });

  describe('getProcessTemplateName', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return undefined if failing to get project', async () => {
      mockGetProject.mockResolvedValue(undefined);
      const wiService = new WorkItemService();
      const processName = await wiService.getProcessTemplateName();

      expect(processName).toBeUndefined();
    });
    it('should return process name if not inherited', async () => {
      const project: IProjectInfo = {
        id: '5395360b-3cb4-456c-acb8-b2107d72395e',
        name: 'Demo Project'
      };
      mockGetProject.mockResolvedValue(project);

      const properties: ProjectProperty[] = [
        {
          name: 'System.ProcessTemplateType',
          value: 'df42e8eb-40c9-4509-a282-3da50e967849'
        }
      ];
      mockGetProjectProperties.mockResolvedValue(properties);

      const processInfo: Partial<ProcessInfo> = {
        name: 'MyProcess',
        parentProcessTypeId: '00000000-0000-0000-0000-000000000000'
      } as ProcessInfo;

      mockGetProcessByItsId.mockResolvedValue(processInfo);

      const wiService = new WorkItemService();
      const processName = await wiService.getProcessTemplateName();

      expect(processName).toEqual('MyProcess');
      expect(mockGetProcessByItsId).toHaveBeenCalledTimes(1);
    });

    it('should return process name if not inherited', async () => {
      const project: IProjectInfo = {
        id: '5395360b-3cb4-456c-acb8-b2107d72395e',
        name: 'Demo Project'
      };
      mockGetProject.mockResolvedValue(project);

      const properties: ProjectProperty[] = [
        {
          name: 'System.ProcessTemplateType',
          value: 'df42e8eb-40c9-4509-a282-3da50e967849'
        }
      ];
      mockGetProjectProperties.mockResolvedValue(properties);

      const processInfoRoot: Partial<ProcessInfo> = {
        typeId: 'e39394c0-c27b-45dd-a4cc-40e4e9b8070d',
        name: 'MyProcess',
        parentProcessTypeId: '00000000-0000-0000-0000-000000000000'
      } as ProcessInfo;

      const processInfoCurrent: Partial<ProcessInfo> = {
        typeId: 'df42e8eb-40c9-4509-a282-3da50e967849',
        name: 'MyInheritedProcess',
        parentProcessTypeId: 'e39394c0-c27b-45dd-a4cc-40e4e9b8070d'
      } as ProcessInfo;

      mockGetProcessByItsId
        .mockResolvedValueOnce(processInfoCurrent)
        .mockResolvedValueOnce(processInfoRoot);

      const wiService = new WorkItemService();
      const processName = await wiService.getProcessTemplateName();

      expect(processName).toEqual('MyProcess');
      expect(mockGetProcessByItsId).toHaveBeenCalledTimes(2);
    });
  });
});
