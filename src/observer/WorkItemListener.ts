import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemFormService,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener,
  WorkItemTrackingServiceIds
} from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';

import WorkItemService from '../common/services/WorkItemService';

class WorkItemListener implements IWorkItemNotificationListener {
  private readonly _workItemService: WorkItemService;

  constructor() {
    this._workItemService = new WorkItemService();
  }

  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    console.log(`onLoaded`, args);
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {
    console.log(`onFieldChanged`, args);
  }
  async onSaved(args: IWorkItemChangedArgs): Promise<void> {
    try {
      if (args.id === 235) {
        const wi = await this._workItemService.getWorkItem(args.id);
        const parentWorkItem = await this._workItemService.getParentForWorkItem(args.id);

        if (
          wi.fields['System.State'] !== 'New' &&
          parentWorkItem?.fields['System.State'] !== 'Active'
        ) {
          if (parentWorkItem?.id) {
          //  await this._workItemService.setWorkItemState(parentWorkItem.id, 'Active');
          }
        }

        console.log(parentWorkItem, wi);
      } else {
        console.log('Triggered, but did not match condition');
      }

      console.log(`onSaved`, args);
    } catch (error) {
      console.log(error);
    }
  }
  onRefreshed(args: IWorkItemChangedArgs): void {
    console.log(`onRefreshed`, args);
  }
  onReset(args: IWorkItemChangedArgs): void {
    console.log(`onReset`, args);
  }
  onUnloaded(args: IWorkItemChangedArgs): void {
    console.log(`onUnloaded`, args);
  }
}

export default WorkItemListener;
