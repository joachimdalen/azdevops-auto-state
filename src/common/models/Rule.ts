export default interface Rule {
  id?: string;
  workItemType: string;
  parentType: string;
  transitionState: string;
  parentExcludedStates: string[];
  parentTargetState: string;
  childrenLookup: boolean;
}
