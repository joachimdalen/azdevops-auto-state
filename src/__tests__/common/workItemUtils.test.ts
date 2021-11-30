import '@testing-library/jest-dom/extend-expect';

import { getWorkItem, getWorkItemTypes } from '../../__test-utils__/WorkItemTestUtils';
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
      const state = getWorkItemType(getWorkItem(1, 'User Story', 'Closed'), types);
      expect(state).toEqual('Microsoft.VSTS.WorkItemTypes.UserStory');
    });
  });

  describe('getState', () => {
    test('returns state', () => {
      const state = getState(getWorkItem(1, 'User Story', 'Closed'));
      expect(state).toEqual('Closed');
    });
  });
  describe('isInState', () => {
    test('returns true if in state', () => {
      const state = isInState(getWorkItem(1, 'User Story', 'Closed'), ['Closed', 'Resolved']);
      expect(state).toBeTruthy();
    });
    test('returns false if not in state', () => {
      const state = isInState(getWorkItem(1, 'User Story', 'Closed'), ['New', 'Active']);
      expect(state).toBeFalsy();
    });
  });
  describe('getIdFormWorkItemUrl', () => {
    test('returns correct id', () => {
      const id = getIdFormWorkItemUrl(getWorkItem(1889, 'User Story', 'Closed').url);
      expect(id).toEqual(1889);
    });
  });

  describe('getParentId', () => {
    test('returns correct id', () => {
      const parent = getWorkItem(8999, 'Feature', 'Active');
      const id = getParentId(getWorkItem(1255, 'User Story', 'New', [parent], 'parent'));
      expect(id).toEqual(8999);
    });
  });

  describe('getChildIds', () => {
    test('returns correct ids', () => {
      const children = [
        getWorkItem(1234, 'User Story', 'New'),
        getWorkItem(1235, 'User Story', 'Active'),
        getWorkItem(1855, 'User Story', 'New')
      ];
      const ids = getChildIds(getWorkItem(8999, 'Feature', 'Active', children, 'children'));
      expect(ids).toEqual([1234, 1235, 1855]);
    });
  });
});
