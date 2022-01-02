import { IHostPageLayoutService, IPanelOptions } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

interface WorkItemActionContext {
  workItemId: number;
  workItemTypeName: string;
  workItemAvailable: boolean;
  workItemDirty: boolean;
  hideDelete: boolean;
  currentProjectName: string;
  currentProjectGuid: string;
}

export default {
  execute: async (context: WorkItemActionContext): Promise<void> => {
    console.log(context);
    const dialogService = await DevOps.getService<IHostPageLayoutService>(
      'ms.vss-features.host-page-layout-service'
    );

    const options: IPanelOptions<any> = {
      title: 'Rule Tester',
      size: 2,
      configuration: {
        workItemId: context.workItemId
      }
    };

    dialogService.openPanel(DevOps.getExtensionContext().id + '.rule-tester', options);
  }
};
