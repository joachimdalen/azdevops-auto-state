import {
  WorkItem,
  WorkItemRelation,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';

const getWorkItem = (
  id: number,
  type: string,
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
    getWorkItemType('Epic', 'Microsoft.VSTS.WorkItemTypes.Epic'),
    getWorkItemType('Feature', 'Microsoft.VSTS.WorkItemTypes.Feature'),
    getWorkItemType('User Story', 'Microsoft.VSTS.WorkItemTypes.UserStory'),
    getWorkItemType('Task', 'Microsoft.VSTS.WorkItemTypes.Task')
  ];
};

const getWorkItemType = (name: string, referenceName: string): WorkItemType => {
  const p: Partial<WorkItemType> = {
    name: name,
    referenceName: referenceName
  };
  return p as WorkItemType;
};

export { getWorkItem, getWorkItemTypes };
