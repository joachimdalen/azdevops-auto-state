import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import VersionDisplay from '../../../shared-ui/component/VersionDisplay';

describe('VersionDisplay', () => {
  process.env.EXTENSION_VERSION = '1.2.3';
  it('renders', () => {
    render(<VersionDisplay moduleVersion="3.2.1" />);
    const textElement = screen.getByText(/Extension Version:/i);
    const versionOne = screen.getByText(/1\.2\.3/i);
    const versionTwo = screen.getByText(/3\.2\.1/i);
    expect(textElement).toBeDefined();
    expect(versionOne).toBeDefined();
    expect(versionTwo).toBeDefined();
  });
  it('should not render extension version when disabled', () => {
    render(<VersionDisplay showExtensionVersion={false} moduleVersion="3.2.1" />);

    const textElement = screen.queryByText(/Extension Version:/i);
    expect(textElement).toBeNull();
  });
});
