import { mockOpenPanel } from '../../__mocks__/azure-devops-extension-sdk';
import menuProvider from '../../rule-tester-action/menu-provider';

describe('menu-provider', () => {
  it('should open modal when called', async () => {
    const options = {
      workItemAvailable: true,
      workItemDirty: false,
      workItemId: 1,
      workItemTypeName: 'User Story',
      currentProjectGuid: '',
      currentProjectName: 'DemoProject',
      hideDelete: false
    };
    await menuProvider.execute(options);

    expect(mockOpenPanel).toHaveBeenCalledWith('as-pub.auto-state.rule-tester', {
      title: 'Rule Tester',
      size: 2,
      configuration: {
        workItemId: options.workItemId
      }
    });
  });
});
