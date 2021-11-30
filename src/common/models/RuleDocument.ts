import Rule from './Rule';

export default interface RuleDocument {
  __etag?: string;
  id: string; // WorkItemType
  rules: Rule[];
}
