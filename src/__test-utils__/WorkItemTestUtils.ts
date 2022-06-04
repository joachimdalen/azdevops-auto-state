import {
  FieldType,
  FieldUsage,
  WorkItem,
  WorkItemField,
  WorkItemRelation,
  WorkItemType
} from 'azure-devops-extension-api/WorkItemTracking';
import { ProcessWorkItemType } from 'azure-devops-extension-api/WorkItemTrackingProcess';

const parentField = 'System.LinkTypes.Hierarchy-Reverse';
const childField = 'System.LinkTypes.Hierarchy-Forward';

const getWorkItem = (
  id: number,
  type: WorkItemNames,
  state: string,
  related?: { id: number; type: 'parent' | 'children' }[],
  fields?: { [key: string]: any }
): WorkItem => {
  const relations: WorkItemRelation[] = (related || [])?.map(wi => {
    const rel: WorkItemRelation = {
      rel: wi.type === 'parent' ? parentField : childField,
      url: `https://dev.azure.com/demoorg/demoproj/${wi.id}`,
      attributes: {
        name: wi.type === 'parent' ? 'Parent' : 'Child'
      }
    };
    return rel;
  });

  const wi: WorkItem = {
    id: id,
    fields: {
      'System.State': state,
      'System.WorkItemType': type,
      'System.Title': 'Work item title for ' + type,
      ...fields
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
    getWorkItemType(WorkItemNames.Task, WorkItemReferenceNames.Task),
    getWorkItemType(WorkItemNames.Documentation, WorkItemReferenceNames.Documentation)
  ];
};

const getProcessWorkItemTypes = (): ProcessWorkItemType[] => {
  return [
    getProcessWorkItemType(WorkItemNames.Epic, WorkItemReferenceNames.Epic),
    getProcessWorkItemType(WorkItemNames.Feature, WorkItemReferenceNames.Feature),
    getProcessWorkItemType(WorkItemNames.UserStory, WorkItemReferenceNames.UserStory)
  ];
};

const getProcessWorkItemType = (
  name: WorkItemNames,
  referenceName: WorkItemReferenceNames
): ProcessWorkItemType => {
  const p: Partial<ProcessWorkItemType> = {
    name: name,
    referenceName: referenceName
  };
  return p as ProcessWorkItemType;
};

const getWorkItemType = (
  name: WorkItemNames,
  referenceName: WorkItemReferenceNames
): WorkItemType => {
  const p: Partial<WorkItemType> = {
    name: name,
    referenceName: referenceName,
    icon: {
      id: 'id_string',
      url: 'https://localhost/icon.png'
    },
    states: [
      {
        category: 'Propsed',
        name: 'New',
        color: 'FFF'
      },
      {
        category: 'In Progress',
        name: 'Active',
        color: 'FFF'
      },
      {
        category: 'Resolved',
        name: 'Closed',
        color: 'FFF'
      }
    ],
    fields: [
      {
        name: 'Area Path',
        referenceName: 'System.AreaPath',
        allowedValues: [],
        dependentFields: [],
        alwaysRequired: false,
        defaultValue: '',
        url: '',
        helpText: ''
      }
    ]
  };
  return p as WorkItemType;
};

export const getWorkItemFields = (): WorkItemField[] => {
  return [
    {
      name: 'Area Path',
      referenceName: 'System.AreaPath',
      description: 'The area of the product with which this bug is associated',
      type: FieldType.TreePath,
      usage: FieldUsage.WorkItem,
      readOnly: false,
      canSortBy: true,
      isQueryable: true,
      supportedOperations: [
        { referenceName: 'SupportedOperations.Under', name: 'Under' },
        {
          referenceName: 'SupportedOperations.NotUnder',
          name: 'Not Under'
        },
        { referenceName: 'SupportedOperations.Equals', name: '=' },
        { referenceName: 'SupportedOperations.NotEquals', name: '<>' },
        { referenceName: 'SupportedOperations.In', name: 'In' }
      ],
      isIdentity: false,
      isPicklist: false,
      isPicklistSuggested: false,
      url: '',
      isDeleted: false,
      _links: {},
      picklistId: ''
    }
  ];
};

enum WorkItemReferenceNames {
  Epic = 'Microsoft.VSTS.WorkItemTypes.Epic',
  Feature = 'Microsoft.VSTS.WorkItemTypes.Feature',
  UserStory = 'Microsoft.VSTS.WorkItemTypes.UserStory',
  Task = 'Microsoft.VSTS.WorkItemTypes.Task',
  Documentation = 'DemoProject.Documentation'
}
enum WorkItemNames {
  Epic = 'Epic',
  Feature = 'Feature',
  UserStory = 'User Story',
  Task = 'Task',
  Documentation = 'Documentation'
}

export {
  getWorkItem,
  getWorkItemType,
  getWorkItemTypes,
  getProcessWorkItemType,
  getProcessWorkItemTypes,
  WorkItemReferenceNames,
  WorkItemNames
};
