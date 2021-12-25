import {
  IGlobalMessagesService,
  IProjectInfo,
  IProjectPageService
} from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

export interface IDevOpsService {
  getProject(): Promise<IProjectInfo | undefined>;
}
export default class DevOpsService implements IDevOpsService {
  public async getProject(): Promise<IProjectInfo | undefined> {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    const project = await projectService.getProject();
    return project;
  }
  public async showToast(message: string): Promise<void> {
    const messageService = await DevOps.getService<IGlobalMessagesService>(
      'ms.vss-tfs-web.tfs-global-messages-service'
    );
    messageService.addToast({
      duration: 2500,
      message: message
    });
  }
}
