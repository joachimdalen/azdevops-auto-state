import { FilterGroup } from './FilterGroup';

export default interface Rule {
  id?: string;
  disabled: boolean;
  workItemType: string;
  parentType: string;
  transitionState: string;
  parentExcludedStates: string[];
  parentTargetState: string;
  childrenLookup: boolean;
  processParent: boolean;
  keepAssigneeState?: boolean;
  filterGroups?: FilterGroup[];
}
