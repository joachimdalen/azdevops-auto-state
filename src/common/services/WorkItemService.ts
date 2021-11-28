import { getClient, IProjectPageService } from 'azure-devops-extension-api';
import {
  WorkItem,
  WorkItemField,
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';

class WorkItemService {
  private readonly _parentRelation: string = 'System.LinkTypes.Hierarchy-Reverse';
  private readonly _stateIdentifier: string = 'System.State';
  private readonly _workItemTypeIdentifier: string = 'System.WorkItemType';

  public async getParentWorkItem(wi: WorkItem) {
    return wi.relations.filter(x => x.rel === this._parentRelation);
  }

  public async getWorkItemTypes() {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    const project = await projectService.getProject();
    if (project) {
      const client = getClient(WorkItemTrackingRestClient);
      const types = client.getWorkItemTypes(project.name);
      return types;
    }
    return [];
  }
  public async getWorkItemStates() {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    console.log(projectService);
    const project = await projectService.getProject();
    console.log(project);
    if (project) {
      const client = getClient(WorkItemTrackingRestClient);
      const ii = client.getWorkItemStateColors([project.name]);
      return ii;
    }
    return '';
  }

  public async getWorkItem(id: number): Promise<WorkItem> {
    const client = getClient(WorkItemTrackingRestClient);
    const wit = await client.getWorkItem(id);
    return wit;
  }
  public async getFields(): Promise<WorkItemField[]> {
    const client = getClient(WorkItemTrackingRestClient);
    const fields = await client.getFields();
    return fields;
  }
}
export default WorkItemService;
