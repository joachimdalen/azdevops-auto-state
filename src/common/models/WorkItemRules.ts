import Rule from './Rule';
export default interface RuleDocument {
  // Also the reference name to the work item type
  id: string;
  rules: Rule[];
}
