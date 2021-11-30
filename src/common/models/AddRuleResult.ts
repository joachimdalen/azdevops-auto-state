import Rule from './Rule';

export default interface AddRuleResult {
  result: 'SAVE' | 'CANCEL';
  id?: string;
  rule?: Rule;
}
