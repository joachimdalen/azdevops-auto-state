import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import WorkItemTypeTag from '../../../shared-ui/component/WorkItemTypeTag';

describe('WorkItemTypeTag', () => {
  it('WorkItemTypeTag - rendering', () => {
    render(<WorkItemTypeTag iconSize={20} iconUrl="http://localhost/1.svg" text="User Story" />);
    const textElement = screen.getByText(/User Story/i);
    expect(textElement).toBeDefined();
  });

  it('WorkItemTypeTag - does not render icon when no url is provided', () => {
    render(<WorkItemTypeTag iconSize={20} text="User Story" />);
    const imgElement = screen.queryAllByRole('img');
    expect(imgElement).toEqual([]);
  });

  it('WorkItemTypeTag - render icon when url is provided', () => {
    render(<WorkItemTypeTag iconSize={20} iconUrl="http://localhost/1.svg" text="User Story" />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeDefined();
  });
});
