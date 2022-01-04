import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import {
  getWorkItemTypes} from '../../../__test-utils__/WorkItemTestUtils';
import WorkItemTypeDropdown from '../../../shared-ui/component/WorkItemTypeDropdown';

describe('WorkItemTypeDropdown', () => {
  it('should render default', () => {
    render(<WorkItemTypeDropdown types={getWorkItemTypes()} />);
    const textElement = screen.getByText(/Select type/i);
    expect(textElement).toBeDefined();
  });
});
