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
    test('should return when storage throws 404', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockRejectedValue({
        status: 404
      });

      const ruleService = new RuleService();
      const result = await ruleService.load();
      expect(result.success).toBeTruthy();
    });
    test('should throw if error is not 404', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockRejectedValue({
        status: 400
      });
      const ruleService = new RuleService();
      expect(async () => {
        await ruleService.load();
      }).rejects.toThrow();
    });
    test('should only load once', async () => {
      const getDataSpy = jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      const ruleService = new RuleService();
      await ruleService.load();
      await ruleService.load();

      expect(getDataSpy).toHaveBeenCalledTimes(1);
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
      };
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      const setDataSpy = jest.spyOn(StorageService.prototype, 'setData');
      setDataSpy.mockImplementation(data => Promise.resolve(data));

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
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      const setDataSpy = jest
        .spyOn(StorageService.prototype, 'setData')
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
      };

      const ruleService = new RuleService();
      await ruleService.load();
      const result = await ruleService.deleteRule(rule.workItemType, ruleId);

      expect(setDataSpy).not.toHaveBeenCalled();
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
      };
      const ruleDoc: RuleDocument = {
        id: WorkItemReferenceNames.Task,
        rules: [rule]
      };
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([ruleDoc]);
      const setDataSpy = jest
        .spyOn(StorageService.prototype, 'setData')
        .mockImplementation(data => {
          return Promise.resolve(data);
        });

      const ruleService = new RuleService();
      await ruleService.load();
      const result = await ruleService.deleteRule(rule.workItemType, ruleId);

      expect(setDataSpy).toHaveBeenCalledTimes(1);
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
      };
      const ruleDoc: RuleDocument = {
        id: WorkItemReferenceNames.Task,
        rules: [rule, ruleTwo]
      };
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([ruleDoc]);
      let setData: RuleDocument | undefined;
      const setDataSpy = jest
        .spyOn(StorageService.prototype, 'setData')
        .mockImplementation(data => {
          setData = data;
          return Promise.resolve(data);
        });

      const ruleService = new RuleService();
      await ruleService.load();
      const result = await ruleService.deleteRule(rule.workItemType, ruleId);

      expect(setDataSpy).toHaveBeenCalledTimes(1);
      expect(result.success).toBeTruthy();
      expect(setData?.rules?.filter(x => x.id === ruleId).length).toEqual(0);
      expect(setData?.rules?.length).toEqual(1);
    });
  });
});
