import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import { asyncFilter } from '../helpers';
import Rule from '../models/Rule';
import RuleDocument from '../models/RuleDocument';
import webLogger from '../webLogger';
import { getState, getWorkItemType, isInState } from '../workItemUtils';
import { IStorageService } from './StorageService';
import { IWorkItemService } from './WorkItemService';

export interface IRuleProcessor {
  Init(): Promise<void>;
  ProcessWorkItem(workItemId: number): Promise<void>;
  IsRuleMatch(rule: Rule, workItem: WorkItem, parent: WorkItem): Promise<boolean>;
}

class RuleProcessor implements IRuleProcessor {
  private _workItemTypes: WorkItemType[];

  constructor(
    private readonly _workItemService: IWorkItemService,
    private readonly _storageService: IStorageService
  ) {
    webLogger.trace('Setting up rule processor');

    this._workItemTypes = [];
  }

  public async Init(): Promise<void> {
    if (this._workItemTypes.length === 0) {
      webLogger.trace('Loading work item types');
      this._workItemTypes = await this._workItemService.getWorkItemTypes();
    }
  }

  public async ProcessWorkItem(workItemId: number): Promise<void> {
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
      return this.IsRuleMatch(x, currentWi, parentWi);
    });

    webLogger.trace('Found matching rules', matchingRules);

    if (matchingRules.length === 0) return;

    for (const rule of matchingRules) {
      const updated = await this._workItemService.setWorkItemState(
        parentWi.id,
        rule.parentTargetState
      );
      webLogger.trace('Updated ' + parentWi.id + ' to ' + updated.fields['System.State']);
    }
  }

  public async IsRuleMatch(rule: Rule, workItem: WorkItem, parent: WorkItem): Promise<boolean> {
    const childType = getWorkItemType(workItem, this._workItemTypes);
    webLogger.trace('Before 1');
    if (rule.workItemType !== childType) return false;

    const parentType = getWorkItemType(parent, this._workItemTypes);
    webLogger.trace('Before 2', rule.parentType, parentType);
    if (rule.parentType !== parentType) return false;
    const childState = getState(workItem);
    webLogger.trace('Before 3');
    if (rule.childState !== childState) return false;
    webLogger.trace('Before 4');
    if (isInState(parent, rule.parentNotState)) return false;
    webLogger.trace('Before 5');
    if (isInState(parent, [rule.parentTargetState])) return false;

    if (rule.allChildren) {
      const children = await this._workItemService.getChildrenForWorkItem(parent.id);
      if (children === undefined) return false;
      const match = children?.every(wi => isInState(wi, [rule.childState]));
      return match;
    }

    return true;
  }
}

export default RuleProcessor;
