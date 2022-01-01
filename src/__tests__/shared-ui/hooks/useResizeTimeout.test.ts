import { renderHook } from '@testing-library/react-hooks';

import { mockResize } from '../../../__mocks__/azure-devops-extension-sdk';
import useResizeTimeout from '../../../shared-ui/hooks/useResizeTimeout';

describe('useResizeTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  it('should call resize', () => {
    mockResize.mockResolvedValue('');
    renderHook(() => useResizeTimeout(1000));

    jest.runOnlyPendingTimers();

    expect(mockResize).toHaveBeenCalledTimes(1);
  });
});
