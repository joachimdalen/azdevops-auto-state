import { IProjectInfo, IProjectPageService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

export interface IMetaService {
  getProject(): Promise<IProjectInfo | undefined>;
}
export default class MetaService implements IMetaService {
  public async getProject(): Promise<IProjectInfo | undefined> {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    const project = await projectService.getProject();
    return project;
  }
}
