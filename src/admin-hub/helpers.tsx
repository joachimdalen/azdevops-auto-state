import { IGroup } from '@fluentui/react';
import { WorkItemStateColor, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

const getWorkItemType = (types: WorkItemType[], type: string): WorkItemType | undefined =>
  types.find(x => x.referenceName === type);
const getState = (
  types: WorkItemType[],
  type: string,
  state: string
): WorkItemStateColor | undefined =>
  getWorkItemType(types, type)?.states?.find(x => x.name === state);

const isGroup = (item: IGroup | undefined): item is IGroup => {
  return !!item;
};

function groupBy<T>(list: T[], keyGetter: (value: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

export { getState, getWorkItemType, isGroup, groupBy };
