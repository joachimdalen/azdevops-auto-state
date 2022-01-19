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
      childrenLookup: false
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
      parentTargetState: 'Closed',
      processParent: true,
      disabled: false,
      childrenLookup: true
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
      childrenLookup: false
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
      childrenLookup: true
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
      transitionState: 'Resolved',
      parentExcludedStates: ['Resolved', 'Closed', 'Removed'],
      parentTargetState: 'Resolved',
      processParent: true,
      disabled: false,
      childrenLookup: true
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
      childrenLookup: false
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
      childrenLookup: false
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
      childrenLookup: false
    }
  },
  {
    id: 'scrum-task-approved',
    name: 'Task approved',
    description:
      'Rule that triggers when a task is approved and the product backlog item is not approved',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.ProductBacklogItem,
      transitionState: 'Approved',
      parentExcludedStates: ['Approved', 'Committed', 'Done', 'Removed'],
      parentTargetState: 'Approved',
      processParent: true,
      disabled: false,
      childrenLookup: false
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
      childrenLookup: true
    }
  },
  {
    id: 'scrum-pbi-approved',
    name: 'Product Backlog Item approved',
    description:
      'Rule that triggers when a PBI is approved and the product backlog item is not approved',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.ProductBacklogItem,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Approved',
      parentExcludedStates: ['Approved', 'Committed', 'Done', 'Removed'],
      parentTargetState: 'Approved',
      processParent: true,
      disabled: false,
      childrenLookup: false
    }
  },
  {
    id: 'scrum-pbi-done',
    name: 'Product Backlog Item done',
    description: 'Rule that triggers when a PBI is done and the product backlog item is not done',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.ProductBacklogItem,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Done',
      parentExcludedStates: ['Done', 'Removed'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: true
    }
  },
  {
    id: 'scrum-feature-approved',
    name: 'Feature approved',
    description: 'Rule that triggers when a feature is approved and the epic is not approved',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Approved',
      parentExcludedStates: ['Approved', 'Committed', 'Done', 'Removed'],
      parentTargetState: 'Approved',
      processParent: true,
      disabled: false,
      childrenLookup: false
    }
  },
  {
    id: 'scrum-feature-done',
    name: 'Feture done',
    description: 'Rule that triggers when a feature is closed and the epic is not closed',
    processes: [ProcessNames.Scrum],
    rule: {
      workItemType: WorkItemReferenceNames.Feature,
      parentType: WorkItemReferenceNames.Epic,
      transitionState: 'Done',
      parentExcludedStates: ['Done', 'Removed'],
      parentTargetState: 'Done',
      processParent: true,
      disabled: false,
      childrenLookup: false
    }
  }
];
