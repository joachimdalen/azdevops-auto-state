import Rule from '../../common/models/Rule';
import DevOpsService, { IDevOpsService, PanelIds } from '../../common/services/DevOpsService';
import RuleService from '../../common/services/RuleService';
import { StorageService } from '../../common/services/StorageService';
import { RuleCopyResult } from '../types';

class RuleCopyService {
  private readonly _devOpsService: IDevOpsService;

  constructor() {
    this._devOpsService = new DevOpsService();
  }

  public async showCopyRule(rule: Rule): Promise<void> {
    this._devOpsService.showPanel(PanelIds.RuleCopyModal, {
      title: 'Copy rule to project',
      onClose: (async (result: RuleCopyResult) => {
        if (result.projectId) {
          await this.copyRule(result.projectId,rule);
        }
      }) as any,
      size: 2
    });
  }
  public async copyRule(projectId: string, rule: Rule): Promise<void> {
    const storageService = new StorageService(projectId);
    const ruleService = new RuleService(storageService);
    await ruleService.load();
    await ruleService.updateRule(rule.workItemType, rule);
  }
}
export default RuleCopyService;
