import { IProjectInfo } from 'azure-devops-extension-api';

import { mockGetProjectProperties } from '../../../__mocks__/azure-devops-extension-api/Core';
import { mockGetWorkItemTypes } from '../../../__mocks__/azure-devops-extension-api/Wit';
import { mockGetProcessWorkItemTypes } from '../../../__mocks__/azure-devops-extension-api/WorkItemTrackingProcess';
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
      const wiTypes = await wiService.getWorkItemTypes();

      expect(wiTypes.every(x => processItems.includes(x.referenceName))).toBeTruthy();
    });
  });
});
