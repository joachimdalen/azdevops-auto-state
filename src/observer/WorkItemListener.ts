import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
  IWorkItemNotificationListener
} from 'azure-devops-extension-api/WorkItemTracking';

import RuleProcessor from '../common/services/RuleProcessor';
import WorkItemService from '../common/services/WorkItemService';

class WorkItemListener implements IWorkItemNotificationListener {
  private readonly _ruleProcessor: RuleProcessor;
  private readonly _witService: WorkItemService;

  constructor() {
    this._ruleProcessor = new RuleProcessor();
    this._witService = new WorkItemService();
  }

  async onLoaded(args: IWorkItemLoadedArgs): Promise<void> {
    console.log(`onLoaded`, args);
    await this._ruleProcessor.Init();
  }
  onFieldChanged(args: IWorkItemFieldChangedArgs): void {
    console.log(`onFieldChanged`, args);
  }
  async onSaved(args: IWorkItemChangedArgs): Promise<void> {
    try {
      await this._ruleProcessor.ProcessWorkItem(args.id);
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
