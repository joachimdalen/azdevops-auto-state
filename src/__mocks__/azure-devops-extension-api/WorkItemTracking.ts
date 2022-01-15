/** Needed to not break the mock with AMD related ReferenceError: define is not defined */
export const WorkItemTrackingServiceIds = {
  WorkItemFormService: 'ms.vss-work-web.work-item-form'
};
import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { JsonPatchDocument } from 'azure-devops-extension-api/WebApi';
import {
  WorkItem,
  WorkItemErrorPolicy,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';
export enum WorkItemExpand {
  /**
   * Default behavior.
   */
  None = 0,
  /**
   * Relations work item expand.
   */
  Relations = 1,
  /**
   * Fields work item expand.
   */
  Fields = 2,
  /**
   * Links work item expand.
   */
  Links = 3,
  /**
   * Expands all.
   */
  All = 4
}
export const mockGetWorkItem = jest.fn().mockRejectedValue(new Error('Not implemented'));
export const mockGetWorkItems = jest.fn().mockRejectedValue(new Error('Not implemented'));
export const mockUpdateWorkItem = jest.fn().mockRejectedValue(new Error('Not implemented'));
export const mockGetWorkItemTypes = jest.fn().mockRejectedValue(new Error('Not implemented'));

export class WorkItemTrackingRestClient {
  public TYPE = 'WorkItemTrackingRestClient';
  constructor(options: IVssRestClientOptions) {}

  getWorkItem(
    id: number,
    project?: string,
    fields?: string[],
    asOf?: Date,
    expand?: WorkItemExpand
  ): Promise<WorkItem> {
    return new Promise(resolve => resolve(mockGetWorkItem(id, project, fields, asOf, expand)));
  }

  getWorkItems(
    ids: number[],
    project?: string,
    fields?: string[],
    asOf?: Date,
    expand?: WorkItemExpand,
    errorPolicy?: WorkItemErrorPolicy
  ): Promise<WorkItem[]> {
    return new Promise(resolve =>
      resolve(mockGetWorkItems(ids, project, fields, asOf, expand, errorPolicy))
    );
  }

  updateWorkItem(
    document: JsonPatchDocument,
    id: number,
    project?: string,
    validateOnly?: boolean,
    bypassRules?: boolean,
    suppressNotifications?: boolean,
    expand?: WorkItemExpand
  ): Promise<WorkItem> {
    return new Promise(resolve =>
      resolve(
        mockUpdateWorkItem(
          document,
          id,
          project,
          validateOnly,
          bypassRules,
          suppressNotifications,
          expand
        )
      )
    );
  }
  getWorkItemTypes(project: string): Promise<WorkItemType[]> {
    return new Promise(resolve => {
      resolve(mockGetWorkItemTypes(project));
    });
  }
}
