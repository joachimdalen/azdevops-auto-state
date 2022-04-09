import { ProcessNames, WorkItemReferenceNames } from '../common/constants';
import Rule from '../common/models/Rule';

export interface PresetRule {
  id: string;
  name: string;
  processes: ProcessNames[];
  description: string;
  rule: Rule;
}

export const presets: PresetRule[] = [
  {
    id: 'agile-task-active',
    name: 'Task activated',
    description: 'Rule that triggers when a task is activated and the User Story is not active',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.UserStory,
      transitionState: 'Active',
      parentExcludedStates: ['Active', 'Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Active',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-task-closed',
    name: 'Task closed',
    description:
      'Rule that triggers when a task is closed and the User Story is not resolved or closed',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.UserStory,
      transitionState: 'Closed',
      parentExcludedStates: ['Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Resolved',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-user-story-active',
    name: 'User Story activated',
    description: 'Rule that triggers when a user story is activated and the feature is not active',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.UserStory,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Active',
      parentExcludedStates: ['Active', 'Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Active',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-user-story-resolved',
    name: 'User Story resolved',
    description: 'Rule that triggers when a user story is resolved and the feature is not resolved',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.UserStory,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Resolved',
      parentExcludedStates: ['Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Resolved',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-user-story-closed',
    name: 'User Story closed',
    description: 'Rule that triggers when a user story is closed and the feature is not closed',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.UserStory,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Closed',
      parentExcludedStates: ['Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Closed',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-feature-active',
    name: 'Feature activated',
    description: 'Rule that triggers when a feature is activated and the epic is not active',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Active',
      parentExcludedStates: ['Active', 'Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Active',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-feature-resolved',
    name: 'Feature resolved',
    description: 'Rule that triggers when a feature is resolved and the epic is not resolved',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Resolved',
      parentExcludedStates: ['Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Resolved',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'agile-feature-closed',
    name: 'Feture closed',
    description: 'Rule that triggers when a feature is closed and the epic is not closed',
    processes: [ProcessNames.Agile],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Closed',
      parentExcludedStates: ['Closed', 'Removed'],
      parentTargetState: 'Closed',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'scrum-task-in-progress',
    name: 'Task in progress',
    description:
      'Rule that triggers when a task is in progress and the product backlog item is not committed',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.ProductBacklogItem,
      transitionState: 'In Progress',
      parentExcludedStates: ['Committed', 'Done', 'Removed'],
      parentTargetState: 'Committed',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'scrum-task-done',
    name: 'Task done',
    description: 'Rule that triggers when a task is done and the product backlog item is not done',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.ProductBacklogItem,
      transitionState: 'Done',
      parentExcludedStates: ['Done', 'Removed'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'scrum-pbi-committed',
    name: 'Product Backlog Item approved',
    description:
      'Rule that triggers when a PBI is approved and the product backlog item is not approved',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.ProductBacklogItem,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Committed',
      parentExcludedStates: ['In Progress', 'Done', 'Removed'],
      parentTargetState: 'In Progress',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'scrum-pbi-done',
    name: 'Product Backlog Item done',
    description: 'Rule that triggers when a PBI is done and the feature is not done',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.ProductBacklogItem,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Done',
      parentExcludedStates: ['Done', 'Removed'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'scrum-feature-in-progress',
    name: 'Feature in progress',
    description: 'Rule that triggers when a feature is in progress and the epic is not in progress',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'In Progress',
      parentExcludedStates: ['In Progress', 'Done', 'Removed'],
      parentTargetState: 'In Progress',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'scrum-feature-done',
    name: 'Feature done',
    description: 'Rule that triggers when a feature is closed and the epic is not done',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Done',
      parentExcludedStates: ['Done', 'Removed'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'basic-task-doing',
    name: 'Task Doing',
    description: 'Rule that triggers when a task is doing and issue is not doing',
    processes: [ProcessNames.Basic],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.Issue,
      transitionState: 'Doing',
      parentExcludedStates: ['Doing', 'Done'],
      parentTargetState: 'Doing',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'basic-task-done',
    name: 'Task Done',
    description: 'Rule that triggers when a task is done and issue is not done',
    processes: [ProcessNames.Basic],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.Issue,
      transitionState: 'Done',
      parentExcludedStates: ['Done'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  },
  {
    id: 'basic-issue-doing',
    name: 'Issue Doing',
    description: 'Rule that triggers when a issue is doing and epic is not doing',
    processes: [ProcessNames.Basic],
    rule: {
      workItemType: WorkItemReferenceNames.Issue,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Doing',
      parentExcludedStates: ['Doing', 'Done'],
      parentTargetState: 'Doing',
      processParent: true,
      disabled: false,
      childrenLookup: false,
      relationType: 'parent-child'
    }
  },
  {
    id: 'basic-issue-done',
    name: 'Issue Done',
    description: 'Rule that triggers when a issue is done and epic is not done',
    processes: [ProcessNames.Basic],
    rule: {
      workItemType: WorkItemReferenceNames.Issue,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Done',
      parentExcludedStates: ['Done'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: true,
      relationType: 'parent-child'
    }
  }
];
