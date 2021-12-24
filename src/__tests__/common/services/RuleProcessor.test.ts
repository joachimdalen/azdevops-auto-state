import '@testing-library/jest-dom/extend-expect';

import {
  getWorkItem,
  getWorkItemTypes,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import Rule from '../../../common/models/Rule';
import RuleProcessor from '../../../common/services/RuleProcessor';
import { IStorageService, StorageService } from '../../../common/services/StorageService';
import WorkItemService, { IWorkItemService } from '../../../common/services/WorkItemService';
import {
  mockGetWorkItem,
  mockGetWorkItems
} from '../../../__mocks__/azure-devops-extension-api/Wit';

jest.mock('../../../common/webLogger');
jest.mock('azure-devops-extension-api');
describe('RuleProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkItem.mockClear();
    mockGetWorkItems.mockClear();
  });

  describe('IsRuleMatch - childrenLookup=true', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGetWorkItem.mockClear();
      mockGetWorkItems.mockClear();
    });
    test('returns true when only child', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeTruthy();
    });
    test('returns true when only children of same type', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());

      const parentWorkItem = getWorkItem(
        9,
        WorkItemNames.UserStory,
        'Active',
        [11, 113, 222],
        'children'
      );
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [9], 'parent');
      const taskItem = getWorkItem(113, WorkItemNames.Task, 'Closed', [9], 'parent');
      const taskItemTwo = getWorkItem(222, WorkItemNames.Task, 'Closed', [9], 'parent');
      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem, taskItem, taskItemTwo]);

      const rule: Rule = {
        id: '1',
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeTruthy();
    });
    test('returns false when only children of same but rule does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());

      const parentWorkItem = getWorkItem(
        9,
        WorkItemNames.UserStory,
        'New',
        [11, 113, 222],
        'children'
      );
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [9], 'parent');
      const taskItem = getWorkItem(113, WorkItemNames.Task, 'Closed', [9], 'parent');
      const taskItemTwo = getWorkItem(222, WorkItemNames.Task, 'Active', [9], 'parent');
      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem, taskItem, taskItemTwo]);

      const rule: Rule = {
        id: '1',
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns false when parent state is already target state', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);
      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
    test('returns true when matches', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeTruthy();
    });
    test('returns false when not matches', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
    test('returns false when child type does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.Epic,
        workItemType: WorkItemReferenceNames.Feature
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
    test('returns false when parent type does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
    test('returns false when child state does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'New', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
    test('returns false when parent states does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [11], 'children');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [9], 'parent');

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);
      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
  });
});
