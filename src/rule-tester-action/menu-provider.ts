import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';

import { PanelIds } from '../common/common';

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
    const devOpsService = new DevOpsService();

    await devOpsService.showPanel(PanelIds.RuleTesterPanel, {
      title: 'Rule Tester',
      size: 2,
      configuration: {
        workItemId: context.workItemId
      }
    });
  }
};
