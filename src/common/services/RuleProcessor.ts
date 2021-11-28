import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { Rule, RuleDocument } from '../models/RulesDocument';
import { getState, getWorkItemType, isInState } from '../workItemUtils';

class RuleProcessor {
  public async Process() {
    const currentWi: WorkItem = {} as any;
    const ruleDoc: RuleDocument = {} as any;
    const parentWi: WorkItem = {} as any;
    const matchingRules = ruleDoc.rules.filter(x => this.isRuleMatch(x, currentWi, parentWi));

    
  }

  private async isRuleMatch(rule: Rule, workItem: WorkItem, parent: WorkItem) {
    const childType = getWorkItemType(workItem);
    if (rule.workItemType !== childType) return false;

    const parentType = getWorkItemType(parent);
    if (rule.parentType !== parentType) return false;

    const childState = getState(workItem);
    if (rule.childState !== childState) return false;

    if (isInState(parent, rule.parentNotState)) return false;
    if (isInState(parent, [rule.parentTargetState])) return false;

    return true;
  }
}

export default RuleProcessor;
