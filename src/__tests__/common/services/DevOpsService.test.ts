
import { IProjectInfo, IToast } from 'azure-devops-extension-api';

import { mockAddToast, mockGetProject } from '../../../__mocks__/azure-devops-extension-sdk';
import DevOpsService from '../../../common/services/DevOpsService';

describe('DevOpsService', () => {
  describe('getProject', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return project info when called', async () => {
      const projectData: IProjectInfo = {
        id: 'demo-id',
        name: 'demoproject'
      };

      mockGetProject.mockResolvedValue(projectData);

      const devOpsService = new DevOpsService();
      const project = await devOpsService.getProject();

      expect(project).toBeDefined();
      expect(project?.id).toEqual('demo-id');
      expect(project?.name).toEqual('demoproject');
    });
  });
  describe('showToast', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should show toast with data', async () => {
      expect.assertions(1);

      mockAddToast.mockImplementation((options: IToast) => {
        expect(options.message).toEqual('This is message');
      });

      const devOpsService = new DevOpsService();

      await devOpsService.showToast('This is message');
    });
  });
});
