import '@testing-library/jest-dom/extend-expect';

import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { v4 as uuidV4 } from 'uuid';

import {
  mockGetWorkItem,
  mockGetWorkItems,
  mockUpdateWorkItem
} from '../../../__mocks__/azure-devops-extension-api/WorkItemTracking';
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
jest.mock('../../../common/webLogger');
describe('RuleProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockGetWorkItem.mockClear();
    mockGetWorkItems.mockClear();
    mockUpdateWorkItem.mockClear();
  });

  describe('isRuleMatch', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGetWorkItem.mockClear();
      mockGetWorkItems.mockClear();
      mockUpdateWorkItem.mockClear();
    });
    it('returns true when only child', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeTruthy();
    });
    it('returns true when only children of same type', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);

      expect(res).toBeTruthy();
    });
    it('returns false when children of different types and missing rules', async () => {
      const rule: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false,
        disabled: false
      };
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([
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
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);

      expect(res).toBeFalsy();
    });
    it('returns false when disabled', async () => {
      const rule: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false,
        disabled: true
      };
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([
        {
          id: WorkItemReferenceNames.Task,
          rules: [rule]
        }
      ]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());

      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' }
      ]);
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);

      mockGetWorkItem.mockResolvedValueOnce(parentWorkItem);

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);

      expect(res).toBeFalsy();
    });
    it('returns true when children of different types and matching rules', async () => {
      const rule: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task,
        processParent: false,
        disabled: false
      };
      const ruleTwo: Rule = {
        id: uuidV4(),
        childrenLookup: true,
        transitionState: 'Closed',
        parentExcludedStates: ['Resolved', 'Closed'],
        parentTargetState: 'Resolved',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Documentation,
        processParent: false,
        disabled: false
      };
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([
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
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);

      expect(res).toBeTruthy();
    });
    it('returns false when only children of same but rule does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);

      expect(res).toBeFalsy();
    });
    it('returns false when parent state is already target state', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };
      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeFalsy();
    });
    it('returns true when matches', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeTruthy();
    });
    it('returns false when not matches', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeFalsy();
    });
    it('returns false when child type does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeFalsy();
    });
    it('returns false when parent type does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeFalsy();
    });
    it('returns false when child state does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeFalsy();
    });
    it('returns false when parent states does not match', async () => {
      jest.spyOn(StorageService.prototype, 'getRuleDocuments').mockResolvedValue([]);
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
        processParent: false,
        disabled: false
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.isRuleMatch(rule, workItem, parentWorkItem, true, false, []);
      expect(res).toBeFalsy();
    });
  });

  describe('Process', () => {
    const getRuleDocumentsSpy = jest.spyOn(StorageService.prototype, 'getRuleDocuments');

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      mockGetWorkItem.mockClear();
      mockGetWorkItems.mockClear();
      mockUpdateWorkItem.mockClear();
      getRuleDocumentsSpy.mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
    });

    it('should not update if no parent is returned', async () => {
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
    });

    it('should not update if unknown work item type', async () => {
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);
      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
    });

    it('should not update if no rules are defined for work item type', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      getRuleDocumentsSpy.mockResolvedValue([{ id: WorkItemReferenceNames.UserStory, rules: [] }]);
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);
      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
    });

    it('should update work item state when rule matches', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: false,
              disabled: false
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

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
    });

    it('should not update work item state when rule is diabled', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: false,
              disabled: true
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
    });

    it('should update work item and parent state when rule matches', async () => {
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

      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: true,
              disabled: false
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
              processParent: false,
              disabled: false
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

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
    it('should stop processing at first processParent=false', async () => {
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

      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: true,
              disabled: false
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
              processParent: false,
              disabled: false
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
              processParent: false,
              disabled: false
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

      expect(mockUpdateWorkItem).toHaveBeenCalledTimes(2);
    });
    it('should process all the way to the top', async () => {
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

      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: true,
              disabled: false
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
              processParent: true,
              disabled: false
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
              processParent: true,
              disabled: false
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

      expect(mockUpdateWorkItem).toHaveBeenCalledTimes(3);
    });
    it('should stop processing when hitting disabled rule', async () => {
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

      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: true,
              disabled: false
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
              processParent: true,
              disabled: false
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
              processParent: true,
              disabled: true
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
      await ruleProcessor.init();
      await ruleProcessor.process(workItem.id, false);

      expect(mockUpdateWorkItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('Process - Dry Run', () => {
    const getRuleDocumentsSpy = jest.spyOn(StorageService.prototype, 'getRuleDocuments');

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      mockGetWorkItem.mockClear();
      mockGetWorkItems.mockClear();
      mockUpdateWorkItem.mockClear();
      getRuleDocumentsSpy.mockResolvedValue([]);
      jest
        .spyOn(WorkItemService.prototype, 'getWorkItemTypes')
        .mockResolvedValue(getWorkItemTypes());
    });

    it('should update work item state when rule matches', async () => {
      const parentWorkItem = getWorkItem(122, WorkItemNames.UserStory, 'New', [
        { id: 123, type: 'children' }
      ]);
      const workItem = getWorkItem(123, WorkItemNames.Task, 'Active', [
        { id: 122, type: 'parent' }
      ]);
      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: false,
              disabled: false
            }
          ]
        }
      ]);

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
      await ruleProcessor.init();
      const res = await ruleProcessor.process(workItem.id, true);

      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
      expect(res.length).toEqual(1);
      expect(res).toEqual([
        {
          id: 122,
          sourceState: 'New',
          title: 'Work item title for User Story',
          type: 'User Story',
          updatedState: 'Active'
        }
      ]);
    });
    it('should update work item and parent state when rule matches', async () => {
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

      getRuleDocumentsSpy.mockResolvedValue([
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
              processParent: true,
              disabled: false
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
              processParent: false,
              disabled: false
            }
          ]
        }
      ]);

      mockGetWorkItem.mockImplementation(id => {
        return workItems.get(id);
      });

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.init();
      const res = await ruleProcessor.process(workItem.id, true);

      expect(mockUpdateWorkItem).not.toHaveBeenCalled();
      expect(res).toEqual([
        {
          id: 122,
          sourceState: 'New',
          title: 'Work item title for User Story',
          type: 'User Story',
          updatedState: 'Active'
        },
        {
          id: 121,
          sourceState: 'New',
          title: 'Work item title for Feature',
          type: 'Feature',
          updatedState: 'Active'
        }
      ]);
    });
  });
});
