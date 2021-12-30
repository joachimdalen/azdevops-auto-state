import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';

import RuleProcessor from '../common/services/RuleProcessor';
import webLogger from '../common/webLogger';

class WorkItemListener implements IWorkItemNotificationListener {
  private readonly _ruleProcessor: RuleProcessor;
  private _stateWasUpdated = false;
  private _isNewWorkItem = false;
  private _isReadOnly = false;

  constructor() {
    this._ruleProcessor = new RuleProcessor();
  }

  private resetState() {
    this._stateWasUpdated = false;
    this._isReadOnly = false;
    this._isNewWorkItem = false;
  }

  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    this._isNewWorkItem = args.isNew;
    this._isReadOnly = args.isReadOnly;
    if (!this._isReadOnly && !this._isNewWorkItem) {
      await this._ruleProcessor.Init();
    }
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {
    if (!this._isReadOnly && !this._isNewWorkItem) {
      if (args.changedFields && args.changedFields['System.State']) {
        this._stateWasUpdated = true;
      }
    }
  }
  async onSaved(args: IWorkItemChangedArgs): Promise<void> {
    if (this._stateWasUpdated && !this._isNewWorkItem && !this._isReadOnly) {
      try {
        await this._ruleProcessor.Process(args.id);
      } catch (error) {
        webLogger.error(error);
      }
    }
  }
  onRefreshed(args: IWorkItemChangedArgs): void {
    this.resetState();
  }
  onReset(args: IWorkItemChangedArgs): void {
    this.resetState();
  }
  onUnloaded(args: IWorkItemChangedArgs): void {
    this.resetState();
  }
}

export default WorkItemListener;
