import { WorkItemType } from "azure-devops-extension-api/WorkItemTracking";

export interface WorkItemFilterInternalProps {
  workItem?: WorkItemType;
  parent?: WorkItemType;
}

export interface SimpleWorkItemInfo {
  name: string;
  icon?: string;
}
