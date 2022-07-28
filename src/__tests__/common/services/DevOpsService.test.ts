import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { IPanelOptions, IProjectInfo, IToast } from 'azure-devops-extension-api';

import {
  mockAddToast,
  mockGetProject,
  mockOpenNewWindow,
  mockOpenPanel
} from '../../../__mocks__/azure-devops-extension-sdk';
import { PanelIds } from '../../../common/common';

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
  describe('showPanel', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should open correct panel', async () => {
      expect.assertions(2);

      mockOpenPanel.mockImplementation((id: string, options: IPanelOptions<any>) => {
        expect(id).toEqual('as-pub.auto-state.settings-panel');
        expect(options.size).toEqual(2);
      });

      const devOpsService = new DevOpsService();

      await devOpsService.showPanel(PanelIds.Settings, {
        size: 2
      });
    });
  });

  describe('openLink', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should open correct link', async () => {
      expect.assertions(2);

      mockOpenNewWindow.mockImplementation((url: string, features: string) => {
        expect(url).toEqual('https://example.com');
        expect(features).toEqual('');
      });

      const devOpsService = new DevOpsService();

      await devOpsService.openLink('https://example.com');
    });
  });
});
