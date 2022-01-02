import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import {
  getWorkItemTypes,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import WorkItemStateDropdown from '../../../shared-ui/component/WorkItemStateDropdown';

describe('WorkItemStateDropdown', () => {
  it('should render default', () => {
    render(
      <WorkItemStateDropdown
        workItemType={WorkItemReferenceNames.UserStory}
        types={getWorkItemTypes()}
      />
    );
    const textElement = screen.getByText(/Select state/i);
    expect(textElement).toBeDefined();
  });
});
