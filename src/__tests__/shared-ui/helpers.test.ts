import { getWorkItemTypes, WorkItemReferenceNames } from '../../__test-utils__/WorkItemTestUtils';
import { getStatesForWorkItemType } from '../../shared-ui/helpers';

describe('ShareUI - Helpers', () => {
  describe('getStatesForWorkItemType', () => {
    it('should include when defined', () => {
      const result = getStatesForWorkItemType(
        getWorkItemTypes(),
        WorkItemReferenceNames.UserStory,
        ['New'],
        true
      );

      expect(result.every(x => x.id === 'New')).toBeTruthy();
      expect(result.length).toEqual(1);
    });
    it('should exclude when defined', () => {
      const result = getStatesForWorkItemType(
        getWorkItemTypes(),
        WorkItemReferenceNames.UserStory,
        ['New']
      );

      expect(result.length).toEqual(2);
      expect(result.every(x => x.id !== 'New')).toBeTruthy();
    });
  });
});
