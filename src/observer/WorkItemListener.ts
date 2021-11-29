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

  constructor() {
    this._ruleProcessor = new RuleProcessor();
  }

  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    webLogger.trace(`onLoaded`, args);
    await this._ruleProcessor.Init();
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {
    webLogger.trace(`onFieldChanged`, args);
  }
  async onSaved(args: IWorkItemChangedArgs): Promise<void> {
    try {
      await this._ruleProcessor.ProcessWorkItem(args.id);
      webLogger.trace(`onSaved`, args);
    } catch (error) {
      webLogger.error(error);
    }
  }
  onRefreshed(args: IWorkItemChangedArgs): void {
    webLogger.trace(`onRefreshed`, args);
  }
  onReset(args: IWorkItemChangedArgs): void {
    webLogger.trace(`onReset`, args);
  }
  onUnloaded(args: IWorkItemChangedArgs): void {
    webLogger.trace(`onUnloaded`, args);
  }
}

export default WorkItemListener;
