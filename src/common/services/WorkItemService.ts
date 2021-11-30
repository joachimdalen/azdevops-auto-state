import { getClient, IProjectInfo, IProjectPageService } from 'azure-devops-extension-api';
import {
  WorkItem,
  WorkItemExpand,
  WorkItemField,
  WorkItemTrackingRestClient,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';

import { getChildIds, getParentId } from '../workItemUtils';

export interface IWorkItemService {
  getParentForWorkItem(id: number): Promise<WorkItem | undefined>;
  getChildrenForWorkItem(workItemId: number): Promise<WorkItem[] | undefined>;
  getWorkItemTypes(): Promise<WorkItemType[]>;
  getWorkItem(id: number): Promise<WorkItem>;
  getWorkItems(ids: number[]): Promise<WorkItem[]>;
  getFields(): Promise<WorkItemField[]>;
  setWorkItemState(id: number, state: string): Promise<WorkItem>;
}

class WorkItemService implements IWorkItemService {
  private async getProject(): Promise<IProjectInfo | undefined> {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    const project = await projectService.getProject();
    return project;
  }

  public async getParentForWorkItem(id: number): Promise<WorkItem | undefined> {
    const wi = await this.getWorkItem(id);
    const parentId = getParentId(wi);
    if (parentId === undefined) return undefined;
    const parentWi = await this.getWorkItem(parentId);
    return parentWi;
  }

  public async getChildrenForWorkItem(workItemId: number): Promise<WorkItem[] | undefined> {
    const wi = await this.getWorkItem(workItemId);
    const childIds = getChildIds(wi);

    if (childIds === undefined) return undefined;
    const wis = await this.getWorkItems(childIds);
    return wis;
  }

  public async getWorkItemTypes(): Promise<WorkItemType[]> {
    const project = await this.getProject();
    if (project) {
      const client = getClient(WorkItemTrackingRestClient);
      const types = client.getWorkItemTypes(project.name);
      return types;
    }
    return [];
  }

  public async getWorkItem(id: number): Promise<WorkItem> {
    const client = getClient(WorkItemTrackingRestClient);
    const wit = await client.getWorkItem(
      id,
      undefined,
      undefined,
      undefined,
      WorkItemExpand.Relations
    );
    return wit;
  }

  public async getWorkItems(ids: number[]): Promise<WorkItem[]> {
    const client = getClient(WorkItemTrackingRestClient);
    const wit = await client.getWorkItems(
      ids,
      undefined,
      undefined,
      undefined,
      WorkItemExpand.Relations
    );
    return wit;
  }

  public async getFields(): Promise<WorkItemField[]> {
    const client = getClient(WorkItemTrackingRestClient);
    const fields = await client.getFields();
    return fields;
  }

  public async setWorkItemState(id: number, state: string): Promise<WorkItem> {
    const client = getClient(WorkItemTrackingRestClient);
    const updated = await client.updateWorkItem(
      [
        {
          op: 'add',
          path: '/fields/System.State',
          value: state
        }
      ],
      id
    );
    return updated;
  }
}
export default WorkItemService;
