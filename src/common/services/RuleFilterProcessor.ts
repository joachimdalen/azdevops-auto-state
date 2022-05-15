import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';

import { FilterOperation } from '../../rule-modal/types';
import { asyncFilter } from '../helpers';
import FilterItem, { FilterFieldType } from '../models/FilterItem';
import Rule from '../models/Rule';
import { getTagsAsList } from '../workItemUtils';

export class RuleFilterProcessor {
  public async isFilterMatch(
    rule: Rule,
    workItem: WorkItem,
    parentWorkItem: WorkItem
  ): Promise<boolean> {
    if (rule.filters === undefined && rule.parentFilters === undefined) return true;

    const results: boolean[] = [];

    if (rule.filters) {
      const res = await this.internalCheck(rule.filters, workItem);
      results.push(res);
    } else {
      results.push(true);
    }

    if (rule.parentFilters) {
      const res = await this.internalCheck(rule.parentFilters, parentWorkItem);
      results.push(res);
    } else {
      results.push(true);
    }

    return results.every(x => x === true);
  }
  private async internalCheck(filters: FilterItem[], workItem: WorkItem) {
    const matchesFilters = await asyncFilter(filters, async x => {
      const field = workItem.fields[x.field];
      console.log(x.field, field);
      if (field === undefined) return false;

      if (x.field === 'System.Tags') {
        return this.isTagsMatch(x.operator, x.value as string, field);
      }

      switch (x.type) {
        case FilterFieldType.PlainText:
        case FilterFieldType.String:
          return this.isTextMatch(x.operator, x.value as string, field);
        case FilterFieldType.Boolean:
          return this.isBoolMatch(x.operator, x.value as boolean, field);
        case FilterFieldType.Integer:
          return this.isIntegerMatch(x.operator, x.value as number, parseInt(field));
        case FilterFieldType.Identity:
          return this.isIdentityMatch(x.operator, x.value as IInternalIdentity, field);
      }
    });

    return matchesFilters.length === filters.length;
  }

  private isTagsMatch(operation: FilterOperation, filterValue: string, workItemValue: string) {
    const filterTags = getTagsAsList(filterValue);
    const workItemTags = getTagsAsList(workItemValue);
    console.log([filterTags, workItemTags]);

    if (operation === FilterOperation.Equals)
      return filterTags.every(x => workItemTags.includes(x));
    return workItemTags.every(x => !filterTags.includes(x));
  }

  private isTextMatch(operation: FilterOperation, filterValue: string, workItemValue: string) {
    if (operation === FilterOperation.Equals) return filterValue === workItemValue;
    return filterValue !== workItemValue;
  }
  private isBoolMatch(operation: FilterOperation, filterValue: boolean, workItemValue: boolean) {
    if (operation === FilterOperation.Equals) return filterValue === workItemValue;
    return filterValue !== workItemValue;
  }
  private isIdentityMatch(
    operation: FilterOperation,
    filterValue: IInternalIdentity,
    workItemValue: IInternalIdentity
  ) {
    if (operation === FilterOperation.Equals)
      return filterValue?.descriptor === workItemValue?.descriptor;
    return filterValue?.descriptor !== workItemValue?.descriptor;
  }

  private isIntegerMatch(operation: FilterOperation, filterValue: number, workItemValue: number) {
    if (operation === FilterOperation.Equals) return filterValue === workItemValue;
    if (operation === FilterOperation.NotEquals) return filterValue !== workItemValue;
    if (operation === FilterOperation.GreaterThan) return filterValue > workItemValue;
    if (operation === FilterOperation.GreaterThanEquals) return filterValue >= workItemValue;
    if (operation === FilterOperation.LessThan) return filterValue < workItemValue;
    if (operation === FilterOperation.LessThanEquals) return filterValue <= workItemValue;
    return false;
  }
}
