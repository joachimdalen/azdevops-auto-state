import { IDialogOptions, IHostPageLayoutService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

export default {
  execute: async (context: any): Promise<void> => {
    console.log(context);
    const dialogService = await DevOps.getService<IHostPageLayoutService>(
      'ms.vss-features.host-page-layout-service'
    );

    const options: IDialogOptions<any> = {
      title: 'Rule Tester',
      configuration: {
        workItemId: context.workItemId
      }
    };

    dialogService.openCustomDialog(DevOps.getExtensionContext().id + '.rule-tester', options);
  }
};
