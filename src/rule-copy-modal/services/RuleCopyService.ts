import { ActionResult } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { v4 as uuidV4 } from 'uuid';
import Rule from '../../common/models/Rule';
import RuleDocument from '../../common/models/WorkItemRules';
import DevOpsService, { IDevOpsService, PanelIds } from '../../common/services/DevOpsService';
import RuleService from '../../common/services/RuleService';
import { StorageService } from '../../common/services/StorageService';

class RuleCopyService {
  private readonly _devOpsService: IDevOpsService;

  constructor() {
    this._devOpsService = new DevOpsService();
  }

  public async showCopyRule(rule: Rule): Promise<void> {
    this._devOpsService.showPanel(PanelIds.RuleCopyModal, {
      title: 'Copy rule to project',
      configuration: {
        rule
      }
    });
  }
  public async copyRule(projectId: string, rule: Rule): Promise<ActionResult<RuleDocument[]>> {
    const storageService = new StorageService(projectId);
    const ruleService = new RuleService(storageService);
    await ruleService.load();
    const newRule = {
      ...rule,
      id: uuidV4()
    };

    const result = await ruleService.updateRule(rule.workItemType, newRule);
    return result;
  }
}
export default RuleCopyService;
