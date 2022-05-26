import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';

import testTheory from '../../../__test-utils__/JestTheory';
import {
  getWorkItem,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import { FilterFieldType } from '../../../common/models/FilterItem';
import Rule from '../../../common/models/Rule';
import { RuleFilterProcessor } from '../../../common/services/RuleFilterProcessor';
import { FilterOperation } from '../../../rule-modal/types';

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

const mainParentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
  { id: 11, type: 'children' }
]);

describe('RuleFilterProcessor', () => {
  describe('isFilterMatch', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return true when no filters', async () => {
      const filterProcessor = new RuleFilterProcessor();
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const result = await filterProcessor.isFilterMatch(rule, workItem, mainParentWorkItem);
      expect(result).toBeTruthy();
    });

    it('should return true when both filter and parent has match', async () => {
      const filterProcessor = new RuleFilterProcessor();
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }], {
        'System.AreaID': 10
      });
      const parentWorkItem = getWorkItem(
        9,
        WorkItemNames.UserStory,
        'Active',
        [{ id: 11, type: 'children' }],
        {
          'System.AreaID': 11
        }
      );
      const innerRule: Rule = {
        ...rule,
        filterGroups: [
          {
            name: 'default',
            workItemFilters: [
              {
                field: 'System.AreaID',
                operator: FilterOperation.Equals,
                type: FilterFieldType.Integer,
                value: 10
              }
            ],
            parentFilters: [
              {
                field: 'System.AreaID',
                operator: FilterOperation.NotEquals,
                type: FilterFieldType.Integer,
                value: 10
              }
            ]
          }
        ]
      };

      const result = await filterProcessor.isFilterMatch(innerRule, workItem, parentWorkItem);
      expect(result).toBeTruthy();
    });
    it('should return true when only parent and matches', async () => {
      const filterProcessor = new RuleFilterProcessor();
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }]);
      const parentWorkItem = getWorkItem(
        9,
        WorkItemNames.UserStory,
        'Active',
        [{ id: 11, type: 'children' }],
        {
          'System.AreaID': 10
        }
      );
      const innerRule: Rule = {
        ...rule,
        filterGroups: [
          {
            name: 'default',
            parentFilters: [
              {
                field: 'System.AreaID',
                operator: FilterOperation.Equals,
                type: FilterFieldType.Integer,
                value: 10
              }
            ]
          }
        ]
      };

      const result = await filterProcessor.isFilterMatch(innerRule, workItem, parentWorkItem);
      expect(result).toBeTruthy();
    });
    it('should return false with multiple filters when only one filter matches', async () => {
      const filterProcessor = new RuleFilterProcessor();
      const workItem = getWorkItem(11, WorkItemNames.Task, 'Closed', [{ id: 9, type: 'parent' }], {
        'System.AreaID': 10,
        'System.AreaPath': '/Path/Project'
      });
      const parentWorkItem = getWorkItem(9, WorkItemNames.UserStory, 'Active', [
        { id: 11, type: 'children' }
      ]);
      const innerRule: Rule = {
        ...rule,
        filterGroups: [
          {
            name: 'default',
            workItemFilters: [
              {
                field: 'System.AreaID',
                operator: FilterOperation.Equals,
                type: FilterFieldType.Integer,
                value: 10
              },
              {
                field: 'System.AreaPath',
                operator: FilterOperation.NotEquals,
                type: FilterFieldType.String,
                value: '/Path/Project'
              }
            ]
          }
        ]
      };

      const result = await filterProcessor.isFilterMatch(innerRule, workItem, parentWorkItem);
      expect(result).toBeFalsy();
    });

    describe('workItem - string', () => {
      testTheory(
        '{operator} returns {expected} when field type is {fieldType}',
        [
          { operator: FilterOperation.Equals, fieldType: FilterFieldType.String, expected: true },
          {
            operator: FilterOperation.NotEquals,
            fieldType: FilterFieldType.String,
            expected: false
          },
          {
            operator: FilterOperation.Equals,
            fieldType: FilterFieldType.PlainText,
            expected: true
          },
          {
            operator: FilterOperation.NotEquals,
            fieldType: FilterFieldType.PlainText,
            expected: false
          }
        ],
        async theory => {
          const filterProcessor = new RuleFilterProcessor();
          const workItem = getWorkItem(
            11,
            WorkItemNames.Task,
            'Closed',
            [{ id: 9, type: 'parent' }],
            {
              'System.AreaPath': 'Area One/This Path'
            }
          );

          const result = await filterProcessor.isFilterMatch(
            {
              ...rule,
              filterGroups: [
                {
                  name: 'default',
                  workItemFilters: [
                    {
                      field: 'System.AreaPath',
                      operator: theory.operator,
                      value: 'Area One/This Path',
                      type: theory.fieldType
                    }
                  ]
                }
              ]
            },
            workItem,
            mainParentWorkItem
          );
          expect(result).toEqual(theory.expected);
        }
      );
    });
    describe('workItem - integer', () => {
      testTheory(
        '{operator} returns {expected} when value is {value} and field value is 10',
        [
          {
            operator: FilterOperation.Equals,
            expected: true,
            value: 10
          },
          {
            operator: FilterOperation.Equals,
            expected: false,
            value: 11
          },
          {
            operator: FilterOperation.NotEquals,
            expected: true,
            value: 11
          },
          {
            operator: FilterOperation.NotEquals,
            expected: false,
            value: 10
          },
          {
            operator: FilterOperation.GreaterThan,
            expected: false,
            value: 8
          },
          {
            operator: FilterOperation.GreaterThanEquals,
            expected: false,
            value: 9
          },
          {
            operator: FilterOperation.GreaterThanEquals,
            expected: true,
            value: 10
          },
          {
            operator: FilterOperation.LessThan,
            expected: true,
            value: 9
          },
          {
            operator: FilterOperation.LessThan,
            expected: false,
            value: 11
          },
          {
            operator: FilterOperation.LessThanEquals,
            expected: true,
            value: 10
          },
          {
            operator: FilterOperation.LessThanEquals,
            expected: false,
            value: 11
          }
        ],
        async theory => {
          const filterProcessor = new RuleFilterProcessor();
          const workItem = getWorkItem(
            11,
            WorkItemNames.Task,
            'Closed',
            [{ id: 9, type: 'parent' }],
            {
              'System.ItemCount': 10
            }
          );

          const result = await filterProcessor.isFilterMatch(
            {
              ...rule,
              filterGroups: [
                {
                  name: 'default',
                  workItemFilters: [
                    {
                      field: 'System.ItemCount',
                      operator: theory.operator,
                      value: theory.value,
                      type: FilterFieldType.Integer
                    }
                  ]
                }
              ]
            },
            workItem,
            mainParentWorkItem
          );
          expect(result).toEqual(theory.expected);
        }
      );
    });
    describe('workItem - bool', () => {
      testTheory(
        '{operator} returns {expected} when field type is {fieldType}',
        [
          {
            operator: FilterOperation.Equals,
            fieldType: FilterFieldType.Boolean,
            expected: true
          },
          {
            operator: FilterOperation.NotEquals,
            fieldType: FilterFieldType.Boolean,
            expected: false
          }
        ],
        async theory => {
          const filterProcessor = new RuleFilterProcessor();
          const workItem = getWorkItem(
            11,
            WorkItemNames.Task,
            'Closed',
            [{ id: 9, type: 'parent' }],
            {
              'System.Approved': true
            }
          );

          const result = await filterProcessor.isFilterMatch(
            {
              ...rule,
              filterGroups: [
                {
                  name: 'default',
                  workItemFilters: [
                    {
                      field: 'System.Approved',
                      operator: theory.operator,
                      value: true,
                      type: theory.fieldType
                    }
                  ]
                }
              ]
            },
            workItem,
            mainParentWorkItem
          );
          expect(result).toEqual(theory.expected);
        }
      );
    });
    describe('workItem - identity', () => {
      testTheory(
        '{operator} returns {expected}',
        [
          { operator: FilterOperation.Equals, expected: true, value: identityOne },
          { operator: FilterOperation.Equals, expected: false, value: identityTwo },
          { operator: FilterOperation.NotEquals, expected: false, value: identityOne },
          { operator: FilterOperation.NotEquals, expected: true, value: identityTwo }
        ],
        async theory => {
          const filterProcessor = new RuleFilterProcessor();
          const workItem = getWorkItem(
            11,
            WorkItemNames.Task,
            'Closed',
            [{ id: 9, type: 'parent' }],
            {
              'System.AssignedTo': identityOne
            }
          );

          const result = await filterProcessor.isFilterMatch(
            {
              ...rule,
              filterGroups: [
                {
                  name: 'default',
                  workItemFilters: [
                    {
                      field: 'System.AssignedTo',
                      operator: theory.operator,
                      value: theory.value,
                      type: FilterFieldType.Identity
                    }
                  ]
                }
              ]
            },
            workItem,
            mainParentWorkItem
          );
          expect(result).toEqual(theory.expected);
        }
      );
    });
    describe('workItem - tags', () => {
      testTheory(
        '{operator} returns {expected}',
        [
          { operator: FilterOperation.Equals, expected: true, value: 'backend;frontend' },
          {
            operator: FilterOperation.Equals,
            expected: false,
            value: 'backend;frontend;full-stack'
          },
          {
            operator: FilterOperation.NotEquals,
            expected: false,
            value: 'backend;frontend;full-stack'
          },
          { operator: FilterOperation.NotEquals, expected: true, value: 'full-stack' }
        ],
        async theory => {
          const filterProcessor = new RuleFilterProcessor();
          const workItem = getWorkItem(
            11,
            WorkItemNames.Task,
            'Closed',
            [{ id: 9, type: 'parent' }],
            {
              'System.Tags': 'backend;frontend'
            }
          );

          const result = await filterProcessor.isFilterMatch(
            {
              ...rule,
              filterGroups: [
                {
                  name: 'default',
                  workItemFilters: [
                    {
                      field: 'System.Tags',
                      operator: theory.operator,
                      value: theory.value,
                      type: FilterFieldType.Identity
                    }
                  ]
                }
              ]
            },
            workItem,
            mainParentWorkItem
          );
          expect(result).toEqual(theory.expected);
        }
      );
    });
  });
});
