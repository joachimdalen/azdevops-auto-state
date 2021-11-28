import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import { Rule, RuleDocument } from '../models/RulesDocument';
import { getState, getWorkItemType, isInState } from '../workItemUtils';
import { StorageService } from './StorageService';
import WorkItemService from './WorkItemService';

class RuleProcessor {
  private readonly _workItemService: WorkItemService;
  private readonly _storageService: StorageService;
  private _workItemTypes: WorkItemType[];

  constructor() {
    console.log('Setting up rule processor');
    this._workItemService = new WorkItemService();
    this._storageService = new StorageService();
    this._workItemTypes = [];
  }

  public async Init(): Promise<void> {
    if (this._workItemTypes.length === 0) {
      console.log('Loading work item types');
      this._workItemTypes = await this._workItemService.getWorkItemTypes();
    }
  }

  public async ProcessWorkItem(workItemId: number): Promise<void> {
    const asyncFilter = async (arr: Rule[], predicate: (x: Rule) => Promise<boolean>) => {
      const results = await Promise.all(arr.map(predicate));
      console.log(results);
      return arr.filter((_v, index) => results[index]);
    };
    const currentWi: WorkItem = await this._workItemService.getWorkItem(workItemId);
    const parentWi: WorkItem | undefined = await this._workItemService.getParentForWorkItem(
      workItemId
    );

    if (parentWi === undefined) return;

    const workItemType = getWorkItemType(currentWi, this._workItemTypes);

    if (workItemType === undefined) return;

    const ruleDoc: RuleDocument | undefined = await this._storageService.getRulesForWorkItemType(
      workItemType
    );

    if (ruleDoc === undefined) return;

    const matchingRules = await asyncFilter(ruleDoc.rules, async x => {
      return this.isRuleMatch(x, currentWi, parentWi);
    });

    console.log('Found matching rules', matchingRules);

    if (matchingRules.length === 0) return;

    for (const rule of matchingRules) {
      const updated = await this._workItemService.setWorkItemState(
        parentWi.id,
        rule.parentTargetState
      );
      console.log('Updated ' + parentWi.id + ' to ' + updated.fields['System.State']);
    }
  }

  public async isRuleMatch(rule: Rule, workItem: WorkItem, parent: WorkItem): Promise<boolean> {
    const childType = getWorkItemType(workItem, this._workItemTypes);
    console.log('Before 1');
    if (rule.workItemType !== childType) return false;

    const parentType = getWorkItemType(parent, this._workItemTypes);
    console.log('Before 2', rule.parentType, parentType);
    if (rule.parentType !== parentType) return false;
    const childState = getState(workItem);
    console.log('Before 3');
    if (rule.childState !== childState) return false;
    console.log('Before 4');
    if (isInState(parent, rule.parentNotState)) return false;
    console.log('Before 5');
    if (isInState(parent, [rule.parentTargetState])) return false;
    return true;
  }
}

export default RuleProcessor;
