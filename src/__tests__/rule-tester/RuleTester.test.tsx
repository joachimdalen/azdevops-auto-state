import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import { getWorkItemTypes } from '../../__test-utils__/WorkItemTestUtils';
import { StorageService } from '../../common/services/StorageService';
import WorkItemService from '../../common/services/WorkItemService';
import RuleTester from '../../rule-tester/RuleTester';

jest.mock('azure-devops-extension-api');
jest.mock('../../common/webLogger');

describe('RuleTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(WorkItemService.prototype, 'getWorkItemTypes').mockResolvedValue(getWorkItemTypes());
    jest.spyOn(StorageService.prototype, 'getData').mockResolvedValue([]);
  });

  it('should render default', async () => {
    render(<RuleTester />);
    const textElement = await screen.findByText(/Work item id/i);
    expect(textElement).toBeDefined();
  });
});
