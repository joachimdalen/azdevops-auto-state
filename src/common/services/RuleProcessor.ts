import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';

import { asyncFilter, groupBy } from '../helpers';
import ProcessedItem from '../models/ProcessedItem';
import Rule from '../models/Rule';
import RuleDocument from '../models/WorkItemRules';
import WorkItemRules from '../models/WorkItemRules';
import webLogger from '../webLogger';
import {
  getDryRunState,
  getState,
  getWorkItemTitle,
  getWorkItemType,
  getWorkItemTypeField,
  getWorkItemTypeFromName,
  isInDryRunState,
  isInState
} from '../workItemUtils';
import { IStorageService, StorageService } from './StorageService';
import WorkItemService, { IWorkItemService } from './WorkItemService';

export interface IRuleProcessor {
  init(): Promise<void>;
  process(workItemId: number, dryRun: boolean, initialState?: string): Promise<ProcessedItem[]>;
  isRuleMatch(
    rule: Rule,
    workItem: WorkItem,
    parent: WorkItem,
    checkChildren: boolean,
    dryRun: boolean,
    processedItems: ProcessedItem[]
  ): Promise<boolean>;
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
      this._ruleDocs = await this._storageService.getRuleDocuments();
    }
  }

  private getRulesForWorkItemType(workItemType: string): RuleDocument | undefined {
    return this._ruleDocs.find(x => x.id === workItemType);
  }

  private async processInternal(
    workItemId: number,
    processed: number[],
    dryRun: boolean,
    processedItems: ProcessedItem[]
  ) {
    webLogger.debug('processing ', workItemId);
    const procsessedIds: number[] = [...processed];
    const parentToProcess = await this.processWorkItem(workItemId, dryRun, processedItems);
    webLogger.debug('parentToProcess ', parentToProcess);

    if (parentToProcess !== undefined) {
      if (procsessedIds.includes(parentToProcess)) {
        webLogger.warning('Parent ' + parentToProcess + ' already processed');
      } else {
        webLogger.debug('Processing work item ' + parentToProcess);
        const nextLevelForWorkItem = await this.processWorkItem(
          parentToProcess,
          dryRun,
          processedItems
        );
        procsessedIds.push(parentToProcess);
        webLogger.debug('Next process', nextLevelForWorkItem);
        if (nextLevelForWorkItem !== undefined) {
          await this.processInternal(nextLevelForWorkItem, procsessedIds, dryRun, processedItems);
        }
      }
    }
  }

  public async process(
    workItemId: number,
    dryRun: boolean,
    initialState?: string
  ): Promise<ProcessedItem[]> {
    const processLog: ProcessedItem[] = [
      ...(dryRun && initialState
        ? [{ id: workItemId, sourceState: '', updatedState: initialState, title: '', type: '' }]
        : [])
    ];
    await this.processInternal(workItemId, [], dryRun, processLog);
    return processLog;
  }

  private async processWorkItem(
    workItemId: number,
    dryRun: boolean,
    processedItems: ProcessedItem[]
  ): Promise<number | undefined> {
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
      return this.isRuleMatch(x, currentWi, parentWi, true, dryRun, processedItems);
    });

    if (matchingRules.length === 0) {
      webLogger.debug('No matching rules');
      return;
    }

    for (const rule of matchingRules) {
      if (dryRun) {
        processedItems.push({
          id: parentWi.id,
          title: getWorkItemTitle(parentWi),
          type: getWorkItemTypeField(parentWi),
          sourceState: getDryRunState(parentWi, processedItems),
          updatedState: rule.parentTargetState
        });
      } else {
        const updated = await this._workItemService.setWorkItemState(
          parentWi.id,
          rule.parentTargetState
        );
        webLogger.information('Updated ' + parentWi.id + ' to ' + updated.fields['System.State']);
      }

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
    checkChildren = true,
    dryRun: boolean,
    processedItems: ProcessedItem[]
  ): Promise<boolean> {
    if (rule.disabled) return false;

    const childType = getWorkItemType(workItem, this._workItemTypes);
    if (rule.workItemType !== childType) return false;

    const parentType = getWorkItemType(parent, this._workItemTypes);
    if (rule.parentType !== parentType) return false;
    const transitionState = dryRun ? getDryRunState(workItem, processedItems) : getState(workItem);
    if (rule.transitionState !== transitionState) return false;
    if (
      dryRun
        ? isInDryRunState(parent, rule.parentExcludedStates, processedItems)
        : isInState(parent, rule.parentExcludedStates)
    )
      return false;
    if (
      dryRun
        ? isInDryRunState(parent, [rule.parentTargetState], processedItems)
        : isInState(parent, [rule.parentTargetState])
    )
      return false;

    if (rule.childrenLookup && checkChildren) {
      return await this.isChildrenRuleMatch(rule, childType, parent, dryRun, processedItems);
    }

    return true;
  }
  private async isChildrenRuleMatch(
    rule: Rule,
    childType: string,
    parentWorkItem: WorkItem,
    dryRun: boolean,
    processedItems: ProcessedItem[]
  ) {
    const children = await this._workItemService.getChildrenForWorkItem(
      parentWorkItem.id,
      parentWorkItem
    );
    if (children === undefined) return true;

    if (children.every(wi => getWorkItemType(wi, this._workItemTypes) === childType)) {
      const match = children?.every(wi =>
        dryRun
          ? isInDryRunState(wi, [rule.transitionState], processedItems)
          : isInState(wi, [rule.transitionState])
      );
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
            const isMatch = await this.isRuleMatch(
              typeRule,
              workItem,
              parentWorkItem,
              false,
              dryRun,
              processedItems
            );
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
      return (
        x.parentTargetState === parentState && x.parentType === parentType && x.disabled !== true
      );
    });
    return matchedRules;
  }
}

export default RuleProcessor;
