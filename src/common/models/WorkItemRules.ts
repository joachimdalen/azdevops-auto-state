import Rule from './Rule';
export enum RuleDocumentVersion {
  V1
}

export default interface WorkItemRules {
  workItemType: string;
  rules: Rule[];
}
