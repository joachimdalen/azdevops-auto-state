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
export enum FieldType {
  /**
   * String field type.
   */
  String = 0,
  /**
   * Integer field type.
   */
  Integer = 1,
  /**
   * Datetime field type.
   */
  DateTime = 2,
  /**
   * Plain text field type.
   */
  PlainText = 3,
  /**
   * HTML (Multiline) field type.
   */
  Html = 4,
  /**
   * Treepath field type.
   */
  TreePath = 5,
  /**
   * History field type.
   */
  History = 6,
  /**
   * Double field type.
   */
  Double = 7,
  /**
   * Guid field type.
   */
  Guid = 8,
  /**
   * Boolean field type.
   */
  Boolean = 9,
  /**
   * Identity field type.
   */
  Identity = 10,
  /**
   * String picklist field type. When creating a string picklist field from REST API, use "String" FieldType.
   */
  PicklistString = 11,
  /**
   * Integer picklist field type. When creating a integer picklist field from REST API, use "Integer" FieldType.
   */
  PicklistInteger = 12,
  /**
   * Double picklist field type. When creating a double picklist field from REST API, use "Double" FieldType.
   */
  PicklistDouble = 13
}
export enum FieldUsage {
  /**
   * Empty usage.
   */
  None = 0,
  /**
   * Work item field usage.
   */
  WorkItem = 1,
  /**
   * Work item link field usage.
   */
  WorkItemLink = 2,
  /**
   * Treenode field usage.
   */
  Tree = 3,
  /**
   * Work Item Type Extension usage.
   */
  WorkItemTypeExtension = 4
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
