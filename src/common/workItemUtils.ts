import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
const stateField = 'System.State';
const parentField = 'System.LinkTypes.Hierarchy-Reverse';
const workItemType = 'System.WorkItemType';

export const getState = (workItem: WorkItem): string => {
  return workItem.fields[stateField];
};

export const isInState = (workItem: WorkItem, states: string[]): boolean => {
  const state = getState(workItem);
  return states.includes(state);
};

export const getWorkItemType = (workItem: WorkItem): string => {
  return workItem.fields[workItemType];
};

export const getParentId = (workItem: WorkItem): number | undefined => {
  const parent = workItem.relations.find(x => x.rel === parentField);
  if (parent === undefined) return undefined;

  const idString = parent.url.split('/').pop();
  if (idString === undefined) return undefined;

  const parentId = parseInt(idString);
  if (isNaN(parentId)) return undefined;

  return parentId;
};
