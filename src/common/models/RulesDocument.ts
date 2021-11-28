export interface RuleDocument {
  __etag?: string;
  id: string; // WorkItemType
  rules: Rule[];
}

export interface Rule {
  id?: string;
  workItemType: string;
  parentType: string;
  childState: string;
  parentNotState: string[];
  parentTargetState: string;
  allChildren: boolean;
}

export interface AddRuleResult {
  result: 'SAVE' | 'CANCEL';
  id?: string;
  rule?: Rule;
}
