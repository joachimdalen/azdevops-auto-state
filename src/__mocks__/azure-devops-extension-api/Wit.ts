import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { WorkItem, WorkItemErrorPolicy, WorkItemExpand } from 'azure-devops-extension-api/WorkItemTracking';

export const mockGetWorkItem = jest.fn().mockRejectedValue(new Error('Not implemented'));
export const mockGetWorkItems = jest.fn().mockRejectedValue(new Error('Not implemented'));
export class WitRestClient {
  constructor(options: IVssRestClientOptions) {}

  getWorkItem(
    id: number,
    project?: string,
    fields?: string[],
    asOf?: Date,
    expand?: WorkItemExpand
  ): Promise<WorkItem> {
    return new Promise(resolve => resolve(mockGetWorkItem()));
  }

  getWorkItems(
    ids: number[],
    project?: string,
    fields?: string[],
    asOf?: Date,
    expand?: WorkItemExpand,
    errorPolicy?: WorkItemErrorPolicy
  ): Promise<WorkItem[]> {
    return new Promise(resolve => resolve(mockGetWorkItems()));
  }
}
