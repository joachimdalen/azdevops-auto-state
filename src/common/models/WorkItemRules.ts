import Rule from './Rule';
export default interface RuleDocument {
  __etag?: string;
  // Also the reference name to the work item type
  id: string;
  rules: Rule[];
}
