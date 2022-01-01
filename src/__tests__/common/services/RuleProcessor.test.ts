import '@testing-library/jest-dom/extend-expect';

import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { v4 as uuidV4 } from 'uuid';

import {
  mockGetWorkItem,
  mockGetWorkItems,
  mockUpdateWorkItem
} from '../../../__mocks__/azure-devops-extension-api/Wit';
import {
  getWorkItem,
  getWorkItemTypes,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import Rule from '../../../common/models/Rule';
import RuleProcessor from '../../../common/services/RuleProcessor';
import { StorageService } from '../../../common/services/StorageService';
import WorkItemService from '../../../common/services/WorkItemService';

jest.mock('azure-devops-extension-api');
//jest.mock('../../../common/webLogger');
describe('RuleProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockGetWorkItem.mockClear();
    mockGetWorkItems.mockClear();
    mockUpdateWorkItem.mockClear();
  });

  describe('IsRuleMatch', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGetWorkItem.mockClear();
      mockGetWorkItems.mockClear();
      mockUpdateWorkItem.mockClear();
    });
    test('returns true when only child', async () => {
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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

      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' },
        { id: 113, type: 'children' },
        { id: 222, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItem = getWorkItem(113, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItemTwo = getWorkItem(222, WorkItemNames.Task, 'Closed', [
        { id: 9, type: 'parent' }
      ]);
      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem, taskItem, taskItemTwo]);

      const rule: Rule = {
        id: '1',
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeTruthy();
    });
    test('returns false when children of different types and missing rules', async () => {
      const rule: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
      };
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([
        {
          id: WorkItemReferenceNames.Task,
          rules: [rule]
        }
      ]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());

      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' },
        { id: 113, type: 'children' },
        { id: 222, type: 'children' },
        { id: 2232, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItem = getWorkItem(113, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItemTwo = getWorkItem(222, WorkItemNames.Task, 'Closed', [
        { id: 9, type: 'parent' }
      ]);
      const documentationItemOne = getWorkItem(2232, WorkItemNames.Documentation, 'Active', [
        { id: 9, type: 'parent' }
      ]);
      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([
        workItem,
        taskItem,
        taskItemTwo,
        documentationItemOne
      ]);

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns true when children of different types and matching rules', async () => {
      const rule: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
      };
      const ruleTwo: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Documentation,
        processParent: false
      };
      jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([
        {
          id: WorkItemReferenceNames.Task,
          rules: [rule]
        },
        {
          id: WorkItemReferenceNames.Documentation,
          rules: [ruleTwo]
        }
      ]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());

      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' },
        { id: 113, type: 'children' },
        { id: 222, type: 'children' },
        { id: 2232, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItem = getWorkItem(113, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItemTwo = getWorkItem(222, WorkItemNames.Task, 'Closed', [
        { id: 9, type: 'parent' }
      ]);
      const documentationItemOne = getWorkItem(2232, WorkItemNames.Documentation, 'Closed', [
        { id: 9, type: 'parent' }
      ]);
      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([
        workItem,
        taskItem,
        taskItemTwo,
        documentationItemOne
      ]);

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

      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [
        { id: 11, type: 'children' },
        { id: 113, type: 'children' },
        { id: 222, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItem = getWorkItem(113, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const taskItemTwo = getWorkItem(222, WorkItemNames.Task, 'Active', [
        { id: 9, type: 'parent' }
      ]);
      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem, taskItem, taskItemTwo]);

      const rule: Rule = {
        id: '1',
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);
      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.Epic,
        workItemType: WorkItemReferenceNames.Feature,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'New', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);

      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
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
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);
      mockGetWorkItems.mockResolvedValueOnce([workItem]);
      const rule: Rule = {
        id: '1',
        childrenLookup: false,
        transitionState: 'Active',
        parentExcludedStates: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);
      expect(res).toBeFalsy();
    });
  });

  describe('Process', () => {
    const getDataSpy = jest.spyOn(StorageService.prototype, 'getData');

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      mockGetWorkItem.mockClear();
      mockGetWorkItems.mockClear();
      mockUpdateWorkItem.mockClear();
      getDataSpy.mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
    });

    test('returns undefined if no parent is return', async () => {
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      mockGetWorkItem.mockImplementation(id => {
        switch (id) {
          case 123:
            return Promise.resolve(workItem);
          default:
            return Promise.resolve(undefined);
        }
      });
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.Process(workItem.id);

      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });

    test('returns undefined if unknown work item type', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, 'DemoTask' as any, 'Active', [{ id: 122, type: 'parent' }]);
      mockGetWorkItem.mockImplementation(id => {
        switch (id) {
          case 123:
            return Promise.resolve(workItem);
          case 122:
            return Promise.resolve(parentWorkItem);
          default:
            return Promise.reject('No such item');
        }
      });
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.Process(workItem.id);
      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });

    test('returns undefined if no rules for type', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      getDataSpy.mockResolvedValue([{ id: WorkItemReferenceNames.UserStory, rules: [] }]);
      mockGetWorkItem.mockImplementation(id => {
        switch (id) {
          case 123:
            return Promise.resolve(workItem);
          case 122:
            return Promise.resolve(parentWorkItem);
          default:
            return Promise.reject('No such item');
        }
      });
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.Process(workItem.id);
      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });

    test('update work item state when rule matches', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      getDataSpy.mockResolvedValue([
        {
          id: WorkItemReferenceNames.Task,
          rules: [
            {
              id: '1',
              parentType: WorkItemReferenceNames.UserStory,
              workItemType: WorkItemReferenceNames.Task,
              transitionState: 'Active',
              parentExcludedStates: ['Active', 'Resolved', 'Closed'],
              parentTargetState: 'Active',
              childrenLookup: false,
              processParent: false
            }
          ]
        }
      ]);
      mockUpdateWorkItem.mockImplementation((document, id) => {
        const newWi = { ...workItem };
        newWi.fields['System.State'] = document[0].value;
        return Promise.resolve(newWi);
      });

      mockGetWorkItem.mockImplementation(id => {
        switch (id) {
          case 123:
            return Promise.resolve(workItem);
          case 122:
            return Promise.resolve(parentWorkItem);
          default:
            return Promise.reject('No such item');
        }
      });

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      const res = await ruleProcessor.Process(workItem.id);

      expect(mockUpdateWorkItem).toHaveBeenCalledWith(
        [{ op: 'add', path: '/fields/System.State', value: 'Active' }],
        122,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(mockUpdateWorkItem).toHaveBeenCalledTimes(1);
      expect(res).toBeUndefined();
    });

    test('update work item and parent state when rule matches', async () => {
      const workItems = new Map<number, WorkItem>();
      const parentParentWorkItem = getWorkItem(121, WorkItemNames.Feature, 'New', [
        {
          id: 122,
          type: 'children'
        }
      ]);
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        {
          id: 123,
          type: 'children'
        },
        {
          id: 121,
          type: 'parent'
        }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        {
          id: 122,
          type: 'parent'
        }
      ]);

      workItems.set(workItem.id, workItem);
      workItems.set(parentWorkItem.id, parentWorkItem);
      workItems.set(parentParentWorkItem.id, parentParentWorkItem);

      getDataSpy.mockResolvedValue([
        {
          id: WorkItemReferenceNames.Task,
          rules: [
            {
              id: '1',
              parentType: WorkItemReferenceNames.UserStory,
              workItemType: WorkItemReferenceNames.Task,
              transitionState: 'Active',
              parentExcludedStates: ['Active', 'Resolved', 'Closed'],
              parentTargetState: 'Active',
              childrenLookup: false,
              processParent: true
            }
          ]
        },
        {
          id: WorkItemReferenceNames.UserStory,
          rules: [
            {
              id: '2',
              parentType: WorkItemReferenceNames.Feature,
              workItemType: WorkItemReferenceNames.UserStory,
              transitionState: 'Active',
              parentExcludedStates: ['Active', 'Resolved', 'Closed'],
              parentTargetState: 'Active',
              childrenLookup: false,
              processParent: false
            }
          ]
        }
      ]);
      mockUpdateWorkItem.mockImplementation((document, id) => {
        const newWi = workItems.get(id);

        if (newWi === undefined) {
          return Promise.reject('Err');
        }

        newWi.fields['System.State'] = document[0].value;
        workItems.set(id, newWi);

        return Promise.resolve(newWi);
      });

      mockGetWorkItem.mockImplementation(id => {
        return workItems.get(id);
      });

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      await ruleProcessor.Process(workItem.id);

      expect(mockUpdateWorkItem).toHaveBeenCalledWith(
        [{ op: 'add', path: '/fields/System.State', value: 'Active' }],
        122,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(mockUpdateWorkItem).toHaveBeenCalledWith(
        [{ op: 'add', path: '/fields/System.State', value: 'Active' }],
        121,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(mockUpdateWorkItem).toHaveBeenCalledTimes(2);
    });
    test('stops processing at first processParent=false', async () => {
      const workItems = new Map<number, WorkItem>();
      const epicWorkItem = getWorkItem(120, WorkItemNames.Epic, 'New', [
        {
          id: 121,
          type: 'children'
        }
      ]);
      const featureWorkItem = getWorkItem(121, WorkItemNames.Feature, 'New', [
        {
          id: 122,
          type: 'children'
        },
        {
          id: 120,
          type: 'parent'
        }
      ]);
      const usWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        {
          id: 123,
          type: 'children'
        },
        {
          id: 121,
          type: 'parent'
        }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        {
          id: 122,
          type: 'parent'
        }
      ]);

      workItems.set(workItem.id, workItem);
      workItems.set(usWorkItem.id, usWorkItem);
      workItems.set(featureWorkItem.id, featureWorkItem);
      workItems.set(epicWorkItem.id, epicWorkItem);

      getDataSpy.mockResolvedValue([
        {
          id: WorkItemReferenceNames.Task,
          rules: [
            {
              id: '1',
              parentType: WorkItemReferenceNames.UserStory,
              workItemType: WorkItemReferenceNames.Task,
              transitionState: 'Active',
              parentExcludedStates: ['Active', 'Resolved', 'Closed'],
              parentTargetState: 'Active',
              childrenLookup: false,
              processParent: true
            }
          ]
        },
        {
          id: WorkItemReferenceNames.UserStory,
          rules: [
            {
              id: '2',
              parentType: WorkItemReferenceNames.Feature,
              workItemType: WorkItemReferenceNames.UserStory,
              transitionState: 'Active',
              parentExcludedStates: ['Active', 'Resolved', 'Closed'],
              parentTargetState: 'Active',
              childrenLookup: false,
              processParent: false
            }
          ]
        },
        {
          id: WorkItemReferenceNames.Feature,
          rules: [
            {
              id: '3',
              parentType: WorkItemReferenceNames.Epic,
              workItemType: WorkItemReferenceNames.Feature,
              transitionState: 'Active',
              parentExcludedStates: ['Active', 'Resolved', 'Closed'],
              parentTargetState: 'Active',
              childrenLookup: false,
              processParent: false
            }
          ]
        }
      ]);
      mockUpdateWorkItem.mockImplementation((document, id) => {
        const newWi = workItems.get(id);

        if (newWi === undefined) {
          return Promise.reject('Err');
        }

        newWi.fields['System.State'] = document[0].value;
        workItems.set(id, newWi);

        return Promise.resolve(newWi);
      });

      mockGetWorkItem.mockImplementation(id => {
        return workItems.get(id);
      });

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.Init();
      await ruleProcessor.Process(workItem.id);

      console.log(mockUpdateWorkItem.mock.calls)
      expect(mockUpdateWorkItem).toHaveBeenCalledTimes(2);
    });
  });
});
