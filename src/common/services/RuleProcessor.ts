import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import { groupBy } from '../../admin-hub/helpers';
import { asyncFilter } from '../helpers';
import Rule from '../models/Rule';
import RuleDocument from '../models/WorkItemRules';
import WorkItemRules from '../models/WorkItemRules';
import webLogger from '../webLogger';
import {
  getState,
  getWorkItemType,
  getWorkItemTypeField,
  getWorkItemTypeFromName,
  isInState
} from '../workItemUtils';
import { IStorageService, StorageService } from './StorageService';
import WorkItemService, { IWorkItemService } from './WorkItemService';

export interface IRuleProcessor {
  Init(): Promise<void>;
  ProcessWorkItem(workItemId: number): Promise<void>;
  IsRuleMatch(rule: Rule, workItem: WorkItem, parent: WorkItem): Promise<boolean>;
}

class RuleProcessor implements IRuleProcessor {
  private _workItemTypes: WorkItemType[];
  private _ruleDocs: RuleDocument[];
  private readonly _workItemService: IWorkItemService;
  private readonly _storageService: IStorageService;
  constructor(workItemService?: IWorkItemService, storageService?: IStorageService) {
    webLogger.trace('Setting up rule processor');
    this._storageService = storageService || new StorageService();
    this._workItemService = workItemService || new WorkItemService();
    this._workItemTypes = [];
    this._ruleDocs = [];
  }

  public async Init(): Promise<void> {
    if (this._workItemTypes.length === 0) {
      this._workItemTypes = await this._workItemService.getWorkItemTypes();
    } else {
      webLogger.information('Already initialized');
    }

    if (this._ruleDocs.length === 0) {
      this._ruleDocs = await this._storageService.getData();
    }
  }
  private getRulesForWorkItemType(workItemType: string): RuleDocument | undefined {
    return this._ruleDocs.find(x => x.id === workItemType);
  }

  public async ProcessWorkItem(workItemId: number): Promise<void> {
    const currentWi: WorkItem = await this._workItemService.getWorkItem(workItemId);
    const parentWi: WorkItem | undefined = await this._workItemService.getParentForWorkItem(
      workItemId
    );

    if (parentWi === undefined) return;

    const workItemType = getWorkItemType(currentWi, this._workItemTypes);

    if (workItemType === undefined) return;

    const ruleDoc: WorkItemRules | undefined = await this.getRulesForWorkItemType(workItemType);

    if (ruleDoc === undefined) return;

    const matchingRules = await asyncFilter(ruleDoc.rules, async x => {
      return this.IsRuleMatch(x, currentWi, parentWi);
    });

    if (matchingRules.length === 0) return;

    for (const rule of matchingRules) {
      const updated = await this._workItemService.setWorkItemState(
        parentWi.id,
        rule.parentTargetState
      );
      webLogger.information('Updated ' + parentWi.id + ' to ' + updated.fields['System.State']);
    }
  }

  public async IsRuleMatch(
    rule: Rule,
    workItem: WorkItem,
    parent: WorkItem,
    checkChildren = true
  ): Promise<boolean> {
    const childType = getWorkItemType(workItem, this._workItemTypes);
    if (rule.workItemType !== childType) return false;

    const parentType = getWorkItemType(parent, this._workItemTypes);
    if (rule.parentType !== parentType) return false;
    const transitionState = getState(workItem);
    if (rule.transitionState !== transitionState) return false;
    if (isInState(parent, rule.parentExcludedStates)) return false;
    if (isInState(parent, [rule.parentTargetState])) return false;

    if (rule.childrenLookup && checkChildren) {
      return await this.IsChildrenRuleMatch(rule, childType, parent);
    }

    return true;
  }
  private async IsChildrenRuleMatch(rule: Rule, childType: string, parentWorkItem: WorkItem) {
    const children = await this._workItemService.getChildrenForWorkItem(parentWorkItem.id);
    if (children === undefined) return true;

    if (children.every(wi => getWorkItemType(wi, this._workItemTypes) === childType)) {
      const match = children?.every(wi => isInState(wi, [rule.transitionState]));
      return match;
    }

    const groupedTypes = groupBy(children, wi => getWorkItemTypeField(wi));
    const results: boolean[] = [];

    for (const [type, workItems] of groupedTypes) {
      const rulesForType = this.getChildRule(type, rule.parentTargetState, rule.parentType);
      if (rulesForType === undefined) {
        results.push(false);
      } else {
        for (const workItem of workItems) {
          const isMatch = rulesForType?.every(y =>
            this.IsRuleMatch(y, workItem, parentWorkItem, false)
          );
          results.push(isMatch);
        }
      }
    }

    if (results.length === 0) return false;
    return results.every(x => x === true);
  }
  private getChildRule(
    workItemType: string,
    parentType: string,
    parentState: string
  ): Rule[] | undefined {
    const docs = this._ruleDocs.find(
      x => x.id === getWorkItemTypeFromName(workItemType, this._workItemTypes)
    );

    return docs?.rules.filter(
      x => x.parentTargetState === parentState && x.parentType === parentType
    );
  }
}

export default RuleProcessor;
