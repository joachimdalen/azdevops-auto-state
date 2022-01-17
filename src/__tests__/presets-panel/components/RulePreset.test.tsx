import { prettyDOM, render, screen } from '@testing-library/react';

import RulePreset from '../../../presets-panel/components/RulePreset';

describe('RulePreset', () => {
  const clicked = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render default', () => {
    render(
      <RulePreset
        checked={false}
        id="rule-one"
        canCreate
        description="Some rule description"
        name="Rule One"
        onSelected={clicked}
      />
    );
    const textElement = screen.getByText(/Rule One/i);
    expect(textElement).toBeDefined();
  });
  it('should not render toggle when create disabled', () => {
    render(
      <RulePreset
        checked={false}
        id="rule-one"
        canCreate={false}
        description="Some rule description"
        name="Rule One"
        onSelected={clicked}
      />
    );
    const switchButton = screen.queryByRole('switch');
    expect(switchButton).toBeNull();
  });
});
