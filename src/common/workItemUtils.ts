import { IdentityRef } from 'azure-devops-extension-api/WebApi';
import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import ProcessedItem from './models/ProcessedItem';

const stateField = 'System.State';
const titleField = 'System.Title';
const parentField = 'System.LinkTypes.Hierarchy-Reverse';
const childField = 'System.LinkTypes.Hierarchy-Forward';
const workItemType = 'System.WorkItemType';
const assignedToField = 'System.AssignedTo';

export const getState = (workItem: WorkItem): string => {
  return workItem.fields[stateField];
};

export const getDryRunState = (workItem: WorkItem, items: ProcessedItem[]): string => {
  const fromItems = items.find(x => x.id === workItem.id);
  return fromItems?.updatedState || getState(workItem);
};

export const isInState = (workItem: WorkItem, states: string[]): boolean => {
  const state = getState(workItem);
  return states.includes(state);
};

export const isInDryRunState = (
  workItem: WorkItem,
  states: string[],
  items: ProcessedItem[]
): boolean => {
  const state = getDryRunState(workItem, items);
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
export const getWorkTypeFromReferenceName = (
  referenceName: string,
  workItemTypes: WorkItemType[]
): WorkItemType | undefined => workItemTypes.find(x => x.referenceName === referenceName);
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

export const getTagsAsList = (tags: string): string[] => {
  return tags.split(';').map(x => x.trim());
};

export const getAssignedTo = (workItem: WorkItem): IdentityRef | undefined => {
  const fieldValue = workItem.fields[assignedToField];
  if (fieldValue === undefined) return undefined;
  return fieldValue as IdentityRef;
};
