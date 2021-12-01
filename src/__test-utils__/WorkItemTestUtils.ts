import {
  WorkItem,
  WorkItemRelation,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';

const getWorkItem = (
  id: number,
  type: WorkItemNames,
  state: string,
  related?: WorkItem[],
  relatedType?: 'parent' | 'children'
): WorkItem => {
  const relations: WorkItemRelation[] = (related || [])?.map(wi => {
    const rel: WorkItemRelation = {
      rel:
        relatedType == 'parent'
          ? 'System.LinkTypes.Hierarchy-Reverse'
          : 'System.LinkTypes.Hierarchy-Forward',
      url: `https://dev.azure.com/demoorg/demoproj/${wi.id}`,
      attributes: {}
    };
    return rel;
  });

  const wi: WorkItem = {
    id: id,
    fields: {
      'System.State': state,
      'System.WorkItemType': type
    },
    relations: relations,
    _links: {},
    commentVersionRef: {} as any,
    rev: 1,
    url: `https://dev.azure.com/demoorg/demoproj/${id}`
  };

  return wi;
};

const getWorkItemTypes = (): WorkItemType[] => {
  return [
    getWorkItemType(WorkItemNames.Epic, WorkItemReferenceNames.Epic),
    getWorkItemType(WorkItemNames.Feature, WorkItemReferenceNames.Feature),
    getWorkItemType(WorkItemNames.UserStory, WorkItemReferenceNames.UserStory),
    getWorkItemType(WorkItemNames.Task, WorkItemReferenceNames.Task)
  ];
};

const getWorkItemType = (
  name: WorkItemNames,
  referenceName: WorkItemReferenceNames
): WorkItemType => {
  const p: Partial<WorkItemType> = {
    name: name,
    referenceName: referenceName
  };
  return p as WorkItemType;
};

enum WorkItemReferenceNames {
  Epic = 'Microsoft.VSTS.WorkItemTypes.Epic',
  Feature = 'Microsoft.VSTS.WorkItemTypes.Feature',
  UserStory = 'Microsoft.VSTS.WorkItemTypes.UserStory',
  Task = 'Microsoft.VSTS.WorkItemTypes.Task'
}
enum WorkItemNames {
  Epic = 'Epic',
  Feature = 'Feature',
  UserStory = 'User Story',
  Task = 'Task'
}

export { getWorkItem, getWorkItemTypes, WorkItemReferenceNames, WorkItemNames };
