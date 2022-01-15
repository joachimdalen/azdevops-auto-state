import { IVssRestClientOptions } from 'azure-devops-extension-api';
import {
  GetWorkItemTypeExpand,
  ProcessWorkItemType
} from 'azure-devops-extension-api/WorkItemTrackingProcess';

export const mockGetProcessWorkItemTypes = jest
  .fn()
  .mockRejectedValue(new Error('Not implemented'));
export class WorkItemTrackingProcessRestClient {
  public TYPE = 'WorkItemTrackingProcessRestClient';
  constructor(options: IVssRestClientOptions) {}

  getProcessWorkItemTypes(
    processId: string,
    expand?: GetWorkItemTypeExpand
  ): Promise<ProcessWorkItemType[]> {
    return new Promise(resolve => resolve(mockGetProcessWorkItemTypes(processId, expand)));
  }
}
