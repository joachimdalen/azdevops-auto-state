import { v4 as uuidV4 } from 'uuid';

import { WorkItemReferenceNames } from '../../../__test-utils__/WorkItemTestUtils';
import Rule from '../../../common/models/Rule';
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
        allChildren: false,
        childState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        parentNotState: ['Active'],
        parentTargetState: 'Active'
      };
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      const setDataSpy = jest.spyOn(StorageService.prototype, 'setData');
      setDataSpy.mockResolvedValue({
        id: rule.workItemType,
        rules: [{ ...rule, id: uuidV4() }]
      });

      const ruleService = new RuleService();
      await ruleService.load();

      const result = await ruleService.updateRule(workItemType, rule);

      expect(result.success).toBeTruthy();
      expect(result.data?.length).toEqual(1);
    });
  });
});
