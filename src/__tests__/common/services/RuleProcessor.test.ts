import '@testing-library/jest-dom/extend-expect';

import {
  getWorkItem,
  getWorkItemTypes,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import Rule from '../../../common/models/Rule';
import { IMetaService } from '../../../common/services/MetaService';
import RuleProcessor from '../../../common/services/RuleProcessor';
import { IStorageService } from '../../../common/services/StorageService';
import { IWorkItemService } from '../../../common/services/WorkItemService';

jest.mock('../../../common/webLogger');
describe('RuleProcessor', () => {
  describe('IsRuleMatch', () => {
    test('returns true when matches', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeTruthy();
    });
    test('returns false when not matches', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns false when child type does not match', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.Epic,
        workItemType: WorkItemReferenceNames.Feature
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns false when parent type does not match', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.Feature,
        workItemType: WorkItemReferenceNames.Task
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns false when child state does not match', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'New');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'New', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns false when parent states does not match', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Active', 'Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
    test('returns false when parent state is already target state', async () => {
      const storageService: IStorageService = {} as IStorageService;
      const metaService: IMetaService = {} as IMetaService;
      const workItemService: IWorkItemService = {
        getWorkItemTypes() {
          return Promise.resolve(getWorkItemTypes());
        }
      } as IWorkItemService;

      const rule: Rule = {
        id: '1',
        allChildren: false,
        childState: 'Active',
        parentNotState: ['Resolved', 'Closed'],
        parentTargetState: 'Active',
        parentType: WorkItemReferenceNames.UserStory,
        workItemType: WorkItemReferenceNames.Task
      };
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active');
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Active', [parentWorkItem], 'parent');
      const ruleProcessor = new RuleProcessor(workItemService, storageService, metaService);
      await ruleProcessor.Init();
      const res = await ruleProcessor.IsRuleMatch(rule, workItem, parentWorkItem);

      expect(res).toBeFalsy();
    });
  });
});
