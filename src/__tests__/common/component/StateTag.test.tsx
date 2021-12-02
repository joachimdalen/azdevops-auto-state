import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import StateTag from '../../../shared-ui/component/StateTag';

describe('StateTag', () => {
  test('StateTag - rendering', () => {
    render(<StateTag color="000000" text="Active" />);
    const textElement = screen.getByText(/Active/i);
    expect(textElement).toBeDefined();
  });
});
