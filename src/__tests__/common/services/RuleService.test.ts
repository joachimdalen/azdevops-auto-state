import { v4 as uuidV4 } from 'uuid';

import { WorkItemNames, WorkItemReferenceNames } from '../../../__test-utils__/WorkItemTestUtils';
import Rule from '../../../common/models/Rule';
import RuleDocument from '../../../common/models/WorkItemRules';
import RuleService from '../../../common/services/RuleService';
import { StorageService } from '../../../common/services/StorageService';



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
});
