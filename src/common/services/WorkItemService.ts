import { getClient } from 'azure-devops-extension-api/Common';
import {
  WorkItem,
  WorkItemExpand,
  WorkItemField,
  WorkItemTrackingRestClient,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';

import { getChildIds, getParentId } from '../workItemUtils';
import DevOpsService, { IDevOpsService } from './DevOpsService';

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
  private _devOpsService: IDevOpsService;
  constructor(devOpsService?: IDevOpsService) {
    this._devOpsService = devOpsService ?? new DevOpsService();
  }

  public async getParentForWorkItem(
    id: number,
    workItem?: WorkItem
  ): Promise<WorkItem | undefined> {
    const wi = workItem || (await this.getWorkItem(id));
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

  private sortWorkItemTypes(a: WorkItemType, b: WorkItemType) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  public async getWorkItemTypes(): Promise<WorkItemType[]> {
    const project = await this._devOpsService.getProject();
    if (project) {
      const client = getClient(WorkItemTrackingRestClient);
      const types = await client.getWorkItemTypes(project.name);
      return types.sort(this.sortWorkItemTypes);
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
