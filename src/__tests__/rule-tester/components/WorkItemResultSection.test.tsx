import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import {
  getWorkItemTypes,
  WorkItemNames,
  WorkItemReferenceNames
} from '../../../__test-utils__/WorkItemTestUtils';
import WorkItemResultSection from '../../../rule-tester/components/WorkItemResultSection';

jest.mock('azure-devops-extension-api');

describe('WorkItemResultSection', () => {
  it('should render default', async () => {
    render(<WorkItemResultSection items={[]} types={getWorkItemTypes()} />);
    const textElement = await screen.findByText(/Result/i);
    expect(textElement).toBeDefined();
  });
  it('should render ZeroData when no result returned', async () => {
    render(
      <WorkItemResultSection
        items={[
          {
            id: 1,
            sourceState: 'New',
            title: '',
            type: '',
            updatedState: ''
          }
        ]}
        types={getWorkItemTypes()}
      />
    );
    const textElement = await screen.findByText(/No work items will be changed/i);
    expect(textElement).toBeDefined();
  });

  it('should render changed work items when returned', async () => {
    render(
      <WorkItemResultSection
        items={[
          {
            id: 1,
            sourceState: 'New',
            title: '',
            type: '',
            updatedState: ''
          },
          {
            id: 2,
            sourceState: 'New',
            title: 'Some user state',
            type: WorkItemNames.UserStory,
            updatedState: 'Active'
          }
        ]}
        types={getWorkItemTypes()}
      />
    );
    const textElement = await screen.findByText(/Some user state/i);
    expect(textElement).toBeDefined();
  });
});
