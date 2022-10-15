import { IVssRestClientOptions } from 'azure-devops-extension-api';
import {
  GetWorkItemTypeExpand,
  ProcessInfo,
  ProcessWorkItemType
} from 'azure-devops-extension-api/WorkItemTrackingProcess';

export const mockGetProcessWorkItemTypes = jest
  .fn()
  .mockRejectedValue(new Error('Not implemented'));

export const mockGetProcessByItsId = jest.fn().mockRejectedValue(new Error('Not implemented'));
export enum GetProcessExpandLevel {
  /**
   * No expand level.
   */
  None = 0,
  /**
   * Projects expand level.
   */
  Projects = 1
}
export class WorkItemTrackingProcessRestClient {
  public TYPE = 'WorkItemTrackingProcessRestClient';
  constructor(options: IVssRestClientOptions) {}

  getProcessWorkItemTypes(
    processId: string,
    expand?: GetWorkItemTypeExpand
  ): Promise<ProcessWorkItemType[]> {
    return new Promise(resolve => resolve(mockGetProcessWorkItemTypes(processId, expand)));
  }
  getProcessByItsId(processTypeId: string, expand?: GetProcessExpandLevel): Promise<ProcessInfo> {
    return new Promise(resolve => resolve(mockGetProcessByItsId(processTypeId, expand)));
  }
}
