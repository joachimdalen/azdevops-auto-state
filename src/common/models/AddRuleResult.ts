import Rule from './Rule';

export default interface AddRuleResult {
  result: 'SAVE' | 'CANCEL';
  workItemType?: string;
  rule?: Rule;
}
