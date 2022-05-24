import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { v4 as uuidV4 } from 'uuid';

import { WorkItemNames, WorkItemReferenceNames } from '../../../__test-utils__/WorkItemTestUtils';
import FilterItem, { FilterFieldType } from '../../../common/models/FilterItem';
import Rule from '../../../common/models/Rule';
import RuleDocument from '../../../common/models/WorkItemRules';
import RuleService from '../../../common/services/RuleService';
import { StorageService } from '../../../common/services/StorageService';
import { FilterOperation } from '../../../rule-modal/types';

describe('RuleService', () => {
  describe('load', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return when storage throws 404', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockRejectedValue({
        status: 404
      });

      const ruleService = new RuleService();
      const result = await ruleService.load();
      expect(result.success).toBeTruthy();
    });
    it('should throw if error is not 404', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockRejectedValue({
        status: 400
      });
      const ruleService = new RuleService();
      expect(async () => {
        await ruleService.load();
      }).rejects.toThrow();
    });
    it('should only load once', async () => {
      const getRuleDocumentsSpy = jest
        .spyOn(StorageService.prototype, 'getRuleDocuments')
        .mockResolvedValue([]);
      const ruleService = new RuleService();
      await ruleService.load();
      await ruleService.load();

      expect(getRuleDocumentsSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('updateRule', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should throw if not initialized', async () => {
      const workItemType = WorkItemReferenceNames.UserStory;
      const rule = {} as Rule;
      const ruleService = new RuleService();

      expect(async () => {
        await ruleService.updateRule(workItemType, rule);
      }).rejects.toThrow();
    });

    it('should create new doc if data is empty', async () => {
      const workItemType = WorkItemReferenceNames.UserStory;
      const rule: Rule = {
        workItemType,
        childrenLookup: false,
        transitionState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        parentExcludedStates: ['Active'],
        parentTargetState: 'Active',
        processParent: false,
        disabled: false
      };
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
      const setRuleDocumentSpy = jest.spyOn(StorageService.prototype, 'setRuleDocument');
      setRuleDocumentSpy.mockImplementation(data => Promise.resolve(data));

      const ruleService = new RuleService();
      await ruleService.load();

      const result = await ruleService.updateRule(workItemType, rule);

      expect(result.success).toBeTruthy();
      expect(result.data?.length).toEqual(1);
    });
  });
  describe('deleteRule', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return if no items loaded', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
      const setRuleDocumentSpy = jest
        .spyOn(StorageService.prototype, 'setRuleDocument')
        .mockRejectedValue(undefined);

      const ruleId = uuidV4();
      const rule: Rule = {
        id: ruleId,
        workItemType: WorkItemNames.Task,
        childrenLookup: false,
        transitionState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        parentExcludedStates: ['Active'],
        parentTargetState: 'Active',
        processParent: false,
        disabled: false
      };

      const ruleService = new RuleService();
      await ruleService.load();
      const result = await ruleService.deleteRule(rule.workItemType, ruleId);

      expect(setRuleDocumentSpy).not.toHaveBeenCalled();
      expect(result.success).toBeTruthy();
    });
    it('should delete rule when only rule', async () => {
      const ruleId = uuidV4();
      const rule: Rule = {
        id: ruleId,
        workItemType: WorkItemReferenceNames.Task,
        childrenLookup: false,
        transitionState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        parentExcludedStates: ['Active'],
        parentTargetState: 'Active',
        processParent: false,
        disabled: false
      };
      const ruleDoc: RuleDocument = {
        id: WorkItemReferenceNames.Task,
        rules: [rule]
      };
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([ruleDoc]);
      const setRuleDocumentSpy = jest
        .spyOn(StorageService.prototype, 'setRuleDocument')
        .mockImplementation(data => {
          return Promise.resolve(data);
        });

      const ruleService = new RuleService();
      await ruleService.load();
      const result = await ruleService.deleteRule(rule.workItemType, ruleId);

      expect(setRuleDocumentSpy).toHaveBeenCalledTimes(1);
      expect(result.success).toBeTruthy();
    });
    it('should delete correct rule when multiple', async () => {
      const ruleId = uuidV4();
      const rule: Rule = {
        id: ruleId,
        workItemType: WorkItemReferenceNames.Task,
        childrenLookup: false,
        transitionState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        parentExcludedStates: ['Active'],
        parentTargetState: 'Active',
        processParent: false,
        disabled: false
      };
      const ruleIdTwo = uuidV4();
      const ruleTwo: Rule = {
        id: ruleIdTwo,
        workItemType: WorkItemReferenceNames.Task,
        childrenLookup: false,
        transitionState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        parentExcludedStates: ['Active'],
        parentTargetState: 'Active',
        processParent: false,
        disabled: false
      };
      const ruleDoc: RuleDocument = {
        id: WorkItemReferenceNames.Task,
        rules: [rule, ruleTwo]
      };
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([ruleDoc]);
      let setRuleDocument: RuleDocument | undefined;
      const setRuleDocumentSpy = jest
        .spyOn(StorageService.prototype, 'setRuleDocument')
        .mockImplementation(data => {
          setRuleDocument = data;
          return Promise.resolve(data);
        });

      const ruleService = new RuleService();
      await ruleService.load();
      const result = await ruleService.deleteRule(rule.workItemType, ruleId);

      expect(setRuleDocumentSpy).toHaveBeenCalledTimes(1);
      expect(result.success).toBeTruthy();
      expect(setRuleDocument?.rules?.filter(x => x.id === ruleId).length).toEqual(0);
      expect(setRuleDocument?.rules?.length).toEqual(1);
    });
  });

  describe('isRuleSame', () => {
    const baseFilter: FilterItem = {
      field: 'System.Title',
      operator: FilterOperation.Equals,
      type: FilterFieldType.Boolean,
      value: '1234',
      group: 'default'
    };

    const baseRule: Rule = {
      id: '222',
      workItemType: WorkItemReferenceNames.Task,
      childrenLookup: false,
      transitionState: 'Active',
      parentType: WorkItemReferenceNames.UserStory,
      parentExcludedStates: ['Active'],
      parentTargetState: 'Active',
      processParent: false,
      disabled: false
    };
    const baseRuleWithFilter: Rule = {
      ...baseRule,
      filterGroups: [
        { name: 'default', workItemFilters: [baseFilter], parentFilters: [baseFilter] }
      ]
    };

    describe('rule properties', () => {
      it('returns false when same ID', () => {
        const ruleService = new RuleService();
        const result = ruleService.isRuleSame(baseRule, baseRule);
        expect(result).toBeFalsy();
      });
    });

    describe('filters', () => {
      it('returns true when same', () => {
        const ruleService = new RuleService();
        const result = ruleService.isRuleSame(baseRuleWithFilter, {
          ...baseRuleWithFilter,
          id: '234'
        });

        expect(result).toBeTruthy();
      });
      it('returns false when more filerts', () => {
        const ruleService = new RuleService();
        const result = ruleService.isRuleSame(baseRuleWithFilter, {
          ...baseRuleWithFilter,
          id: '234',
          filterGroups: [
            {
              name: 'default',
              workItemFilters: [
                ...baseRuleWithFilter.filterGroups![0].workItemFilters!,
                {
                  field: 'System.Tags',
                  operator: FilterOperation.Equals,
                  type: FilterFieldType.Boolean,
                  value: 'backend;frontend',
                  group: 'default'
                }
              ]
            }
          ]
        });

        expect(result).toBeFalsy();
      });
    });
  });
  describe('isFilterSame', () => {
    const baseFilter: FilterItem = {
      field: 'System.Title',
      operator: FilterOperation.Equals,
      type: FilterFieldType.Boolean,
      value: '1234',
      group: 'default'
    };

    const identityOne: IInternalIdentity = {
      displayName: 'Test User',
      entityId: '1234',
      entityType: 'User',
      id: '54321',
      descriptor: 'user1234',
      image: '/image.png'
    };
    const identityTwo: IInternalIdentity = {
      displayName: 'Test User 2',
      entityId: '4321',
      entityType: 'User',
      id: '123456',
      descriptor: 'user4321',
      image: '/image.png'
    };

    it('should return false when field is different', () => {
      const ruleService = new RuleService();
      const result = ruleService.isFilterSame(
        {
          ...baseFilter,
          field: 'System.Id'
        },
        baseFilter
      );

      expect(result).toBeFalsy();
    });
    it('should return false when operator is different', () => {
      const ruleService = new RuleService();
      const result = ruleService.isFilterSame(
        {
          ...baseFilter,
          operator: FilterOperation.GreaterThan
        },
        baseFilter
      );

      expect(result).toBeFalsy();
    });
    it('should return false when type is different', () => {
      const ruleService = new RuleService();
      const result = ruleService.isFilterSame(
        {
          ...baseFilter,
          type: FilterFieldType.Identity
        },
        baseFilter
      );

      expect(result).toBeFalsy();
    });
    it('should return false when value is different', () => {
      const ruleService = new RuleService();
      const result = ruleService.isFilterSame(
        {
          ...baseFilter,
          value: 'false'
        },
        baseFilter
      );

      expect(result).toBeFalsy();
    });
    it('should return false when value is identity and is different', () => {
      const ruleService = new RuleService();
      const result = ruleService.isFilterSame(
        {
          ...baseFilter,
          type: FilterFieldType.Identity,
          value: identityOne
        },
        {
          ...baseFilter,
          type: FilterFieldType.Identity,
          value: identityTwo
        }
      );

      expect(result).toBeFalsy();
    });
    it('should return true when same', () => {
      const ruleService = new RuleService();
      const result = ruleService.isFilterSame(baseFilter, baseFilter);

      expect(result).toBeTruthy();
    });
  });
});
