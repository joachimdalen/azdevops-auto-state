import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import { asyncFilter, groupBy } from '../helpers';
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
  init(): Promise<void>;
  process(workItemId: number): Promise<void>;
  processWorkItem(workItemId: number): Promise<number | undefined>;
  isRuleMatch(rule: Rule, workItem: WorkItem, parent: WorkItem): Promise<boolean>;
}

class RuleProcessor implements IRuleProcessor {
  private _workItemTypes: WorkItemType[];
  private _ruleDocs: RuleDocument[];
  private readonly _workItemService: IWorkItemService;
  private readonly _storageService: IStorageService;
  constructor(workItemService?: IWorkItemService, storageService?: IStorageService) {
    webLogger.debug('Setting up rule processor');
    this._storageService = storageService || new StorageService();
    this._workItemService = workItemService || new WorkItemService();
    this._workItemTypes = [];
    this._ruleDocs = [];
  }

  public async init(): Promise<void> {
    if (this._workItemTypes.length === 0) {
      this._workItemTypes = await this._workItemService.getWorkItemTypes();
    }

    if (this._ruleDocs.length === 0) {
      this._ruleDocs = await this._storageService.getData();
    }
  }

  private getRulesForWorkItemType(workItemType: string): RuleDocument | undefined {
    return this._ruleDocs.find(x => x.id === workItemType);
  }

  private async processInternal(workItemId: number, processed: number[]) {
    webLogger.debug('processing ', workItemId);
    const procsessedIds: number[] = [...processed];
    const parentToProcess = await this.processWorkItem(workItemId);
    webLogger.debug('parentToProcess ', parentToProcess);

    if (parentToProcess !== undefined) {
      if (procsessedIds.includes(parentToProcess)) {
        webLogger.warning('Parent ' + parentToProcess + ' already processed');
      } else {
        webLogger.debug('Processing work item ' + parentToProcess);
        const nextLevelForWorkItem = await this.processWorkItem(parentToProcess);
        procsessedIds.push(parentToProcess);
        webLogger.debug('Next process', nextLevelForWorkItem);
        if (nextLevelForWorkItem !== undefined) {
          await this.processInternal(nextLevelForWorkItem, procsessedIds);
        }
      }
    }
  }

  public async process(workItemId: number): Promise<void> {
    await this.processInternal(workItemId, []);
  }

  public async processWorkItem(workItemId: number): Promise<number | undefined> {
    let parentToProcess: number | undefined = undefined;
    const currentWi: WorkItem = await this._workItemService.getWorkItem(workItemId);
    const parentWi: WorkItem | undefined = await this._workItemService.getParentForWorkItem(
      workItemId,
      currentWi
    );

    if (parentWi === undefined) {
      webLogger.debug('Parent is undefined');
      return;
    }

    const workItemType = getWorkItemType(currentWi, this._workItemTypes);

    if (workItemType === undefined) {
      webLogger.debug('workItemType is undefined');
      return;
    }

    const ruleDoc: WorkItemRules | undefined = this.getRulesForWorkItemType(workItemType);

    if (ruleDoc === undefined) {
      webLogger.debug('ruleDoc is undefined');
      return;
    }

    const matchingRules = await asyncFilter(ruleDoc.rules, async x => {
      return this.isRuleMatch(x, currentWi, parentWi);
    });

    if (matchingRules.length === 0) {
      webLogger.debug('No matching rules');
      return;
    }

    for (const rule of matchingRules) {
      const updated = await this._workItemService.setWorkItemState(
        parentWi.id,
        rule.parentTargetState
      );
      webLogger.information('Updated ' + parentWi.id + ' to ' + updated.fields['System.State']);

      if (rule.processParent) {
        webLogger.debug(
          'process parent ' + rule.processParent + ' ' + workItemId + ' ' + parentWi.id
        );
        parentToProcess = parentWi.id;
      }
    }

    return parentToProcess;
  }

  public async isRuleMatch(
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
      return await this.isChildrenRuleMatch(rule, childType, parent);
    }

    return true;
  }
  private async isChildrenRuleMatch(rule: Rule, childType: string, parentWorkItem: WorkItem) {
    const children = await this._workItemService.getChildrenForWorkItem(
      parentWorkItem.id,
      parentWorkItem
    );
    if (children === undefined) return true;

    if (children.every(wi => getWorkItemType(wi, this._workItemTypes) === childType)) {
      const match = children?.every(wi => isInState(wi, [rule.transitionState]));
      return match;
    }

    const groupedTypes = groupBy(children, wi => getWorkItemTypeField(wi));
    const results: boolean[] = [];

    for (const [type, workItems] of groupedTypes) {
      const rulesForType = this.getChildRule(type, rule.parentType, rule.parentTargetState);
      if (rulesForType === undefined || rulesForType?.length === 0) {
        results.push(false);
      } else {
        for (const workItem of workItems) {
          for (const typeRule of rulesForType) {
            const isMatch = await this.isRuleMatch(typeRule, workItem, parentWorkItem, false);
            results.push(isMatch);
          }
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
    const matchedRules = docs?.rules.filter(x => {
      return x.parentTargetState === parentState && x.parentType === parentType;
    });
    return matchedRules;
  }
}

export default RuleProcessor;
