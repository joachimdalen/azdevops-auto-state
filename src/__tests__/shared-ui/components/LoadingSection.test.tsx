import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import LoadingSection from '../../../shared-ui/component/LoadingSection';

describe('LoadingSection', () => {
  it('LoadingSection - rendering', () => {
    render(<LoadingSection isLoading={true} text="Loading some content" />);
    const textElement = screen.getByText(/Loading some content/i);
    expect(textElement).toBeDefined();
  });
});
