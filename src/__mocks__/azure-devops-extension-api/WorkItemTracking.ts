/** Needed to not break the mock with AMD related ReferenceError: define is not defined */
export const WorkItemTrackingServiceIds = {
  WorkItemFormService: 'ms.vss-work-web.work-item-form'
};

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
