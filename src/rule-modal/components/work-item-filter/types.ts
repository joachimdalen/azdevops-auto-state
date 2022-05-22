export interface WorkItemFilterInternalProps {
  workItem?: SimpleWorkItemInfo;
  parent?: SimpleWorkItemInfo;
}

export interface SimpleWorkItemInfo {
  name: string;
  icon?: string;
}
