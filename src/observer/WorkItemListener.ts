import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';

import RuleProcessor from '../common/services/RuleProcessor';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';

class WorkItemListener implements IWorkItemNotificationListener {
  private readonly _ruleProcessor: RuleProcessor;
  private _stateWasUpdated = false;

  constructor() {
    this._ruleProcessor = new RuleProcessor(new WorkItemService(), new StorageService());
  }

  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    webLogger.trace(`onLoaded`, args);
    await this._ruleProcessor.Init();
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {
    webLogger.trace(`onFieldChanged`, args);

    if (args.changedFields && args.changedFields['System.State']) {
      this._stateWasUpdated = true;
      webLogger.information("State was updated");
    }
  }
  async onSaved(args: IWorkItemChangedArgs): Promise<void> {
    if (this._stateWasUpdated) {
      try {
        await this._ruleProcessor.ProcessWorkItem(args.id);
        webLogger.trace(`onSaved`, args);
      } catch (error) {
        webLogger.error(error);
      }
    } else {
      webLogger.information('State was not updated');
    }
  }
  onRefreshed(args: IWorkItemChangedArgs): void {
    webLogger.trace(`onRefreshed`, args);
  }
  onReset(args: IWorkItemChangedArgs): void {
    this._stateWasUpdated = false;
  }
  onUnloaded(args: IWorkItemChangedArgs): void {
    webLogger.trace(`onUnloaded`, args);
  }
}

export default WorkItemListener;
