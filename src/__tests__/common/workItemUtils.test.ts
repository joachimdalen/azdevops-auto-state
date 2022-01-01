import '@testing-library/jest-dom/extend-expect';

import {
  getWorkItem,
  getWorkItemTypes,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../__test-utils__/WorkItemTestUtils';
import {
  getChildIds,
  getIdFormWorkItemUrl,
  getParentId,
  getState,
  getWorkItemType,
  isInState
} from '../../common/workItemUtils';

describe('workItemUtils', () => {
  describe('getWorkItemType', () => {
    const types = getWorkItemTypes();
    test('returns correct reference name', () => {
      const state = getWorkItemType(getWorkItem(1, WorkItemNames.UserStory, 'Closed'), types);
      expect(state).toEqual(WorkItemReferenceNames.UserStory);
    });
  });

  describe('getState', () => {
    test('returns state', () => {
      const state = getState(getWorkItem(1, WorkItemNames.UserStory, 'Closed'));
      expect(state).toEqual('Closed');
    });
  });
  describe('isInState', () => {
    test('returns true if in state', () => {
      const state = isInState(getWorkItem(1, WorkItemNames.UserStory, 'Closed'), [
        'Closed',
        'Resolved'
      ]);
      expect(state).toBeTruthy();
    });
    test('returns false if not in state', () => {
      const state = isInState(getWorkItem(1, WorkItemNames.UserStory, 'Closed'), ['New', 'Active']);
      expect(state).toBeFalsy();
    });
  });
  describe('getIdFormWorkItemUrl', () => {
    test('returns correct id', () => {
      const id = getIdFormWorkItemUrl(getWorkItem(1889, WorkItemNames.UserStory, 'Closed').url);
      expect(id).toEqual(1889);
    });
  });

  describe('getParentId', () => {
    test('returns correct id', () => {
      const id = getParentId(
        getWorkItem(1255, WorkItemNames.UserStory, 'New', [{ id: 8999, type: 'parent' }])
      );
      expect(id).toEqual(8999);
    });
    test('returns undefined when no parent', () => {
      const id = getParentId(getWorkItem(1255, WorkItemNames.UserStory, 'New'));
      expect(id).toBeUndefined();
    });
  });

  describe('getChildIds', () => {
    test('returns correct ids', () => {
      const ids = getChildIds(
        getWorkItem(8999, WorkItemNames.Feature, 'Active', [
          { id: 1234, type: 'children' },
          { id: 1235, type: 'children' },
          { id: 1855, type: 'children' }
        ])
      );
      expect(ids).toEqual([1234, 1235, 1855]);
    });
    test('returns undefined when empty relations', () => {
      const wi = getWorkItem(8999, WorkItemNames.Feature, 'Active');
      const ids = getChildIds(wi);
      expect(ids).toBeUndefined();
    });
  });
});
