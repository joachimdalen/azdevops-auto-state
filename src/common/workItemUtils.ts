import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
const stateField = 'System.State';
const titleField = 'System.Title';
const parentField = 'System.LinkTypes.Hierarchy-Reverse';
const childField = 'System.LinkTypes.Hierarchy-Forward';
const workItemType = 'System.WorkItemType';

export const getState = (workItem: WorkItem): string => {
  return workItem.fields[stateField];
};

export const isInState = (workItem: WorkItem, states: string[]): boolean => {
  const state = getState(workItem);
  return states.includes(state);
};

export const getWorkItemTitle = (workItem: WorkItem): string => workItem.fields[titleField];

export const getWorkItemType = (
  workItem: WorkItem,
  workItemTypes: WorkItemType[]
): string | undefined => {
  const type = getWorkItemTypeField(workItem);
  return getWorkItemTypeFromName(type, workItemTypes);
};

export const getWorkItemTypeFromName = (
  name: string,
  workItemTypes: WorkItemType[]
): string | undefined => workItemTypes.find(x => x.name === name)?.referenceName;
export const getWorkItemTypeField = (workItem: WorkItem): string => workItem.fields[workItemType];

export const getIdFormWorkItemUrl = (url: string): number | undefined => {
  const idString = url.split('/').pop();
  if (idString === undefined) return undefined;

  const id = parseInt(idString);
  if (isNaN(id)) return undefined;

  return id;
};

const isSetNumber = (item: number | undefined): item is number => {
  return !!item;
};

export const getParentId = (workItem: WorkItem): number | undefined => {
  const parent = workItem.relations.find(x => x.rel === parentField);
  if (parent === undefined) return undefined;
  return getIdFormWorkItemUrl(parent.url);
};

export const getChildIds = (workItem: WorkItem): number[] | undefined => {
  const children = workItem.relations.filter(x => x.rel === childField);
  if (children === undefined) return undefined;
  if (children.length === 0) return undefined;

  return children.map(c => getIdFormWorkItemUrl(c.url)).filter(isSetNumber);
};
