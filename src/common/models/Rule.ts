export default interface Rule {
    id?: string;
    workItemType: string;
    parentType: string;
    childState: string;
    parentNotState: string[];
    parentTargetState: string;
    allChildren: boolean;
  }