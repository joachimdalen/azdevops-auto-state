import { IDialogOptions, IHostPageLayoutService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { v4 as uuidV4 } from 'uuid';

import { ActionResult } from '../models/ActionResult';
import AddRuleResult from '../models/AddRuleResult';
import Rule from '../models/Rule';
import RuleDocument from '../models/WorkItemRules';
import { IStorageService, StorageService } from './StorageService';

class RuleService {
  private readonly _dataStore: IStorageService;
  private _isInitialized = false;
  private _data: RuleDocument[];

  constructor(dataStore?: IStorageService) {
    this._dataStore = dataStore || new StorageService();
    this._data = [];
  }

  public async load(): Promise<ActionResult<RuleDocument[]>> {
    if (this._isInitialized) return { success: true };
    try {
      const data = await this._dataStore.getData();
      this._data = data;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      }
    }
    this._isInitialized = true;
    return { success: true, data: this._data };
  }

  public async deleteRule(
    workItemType: string,
    ruleId: string
  ): Promise<ActionResult<RuleDocument[]>> {
    if (!this._data) {
      return { success: true, data: this._data };
    }

    const documentIndex = this._data.findIndex(x => x.id === workItemType);

    if (documentIndex >= 0) {
      const document = { ...this._data[documentIndex] };
      const newRules = document.rules.filter(z => z.id !== ruleId);
      document.rules = newRules;
      const updatedDocument = await this._dataStore.setData(document);
      const newDocs = [...this._data];
      newDocs[documentIndex] = updatedDocument;
      this._data = newDocs;

      return {
        success: true,
        data: newDocs
      };
    }

    return {
      success: true
    };
  }

  public async updateRule(workItemType: string, rule: Rule): Promise<ActionResult<RuleDocument[]>> {
    if (this._isInitialized === false) {
      throw new Error('RuleService is not initialized. Call Load() first.');
    }

    const docIndex = this._data?.findIndex(x => x.id === workItemType);
    if (docIndex !== undefined && docIndex >= 0) {
      const doc = this._data[docIndex];
      const uResult = await this.updateOrAddRule(doc, rule);

      if (!uResult.success) {
        return {
          success: false,
          message: uResult.message
        };
      }

      const data = uResult.data;

      if (data) {
        const newDocs = [...this._data];
        newDocs[docIndex] = data;

        this._data = newDocs;
        return {
          success: true,
          data: newDocs
        };
      }
    } else {
      const createResult = await this.createRootDocument(rule);

      if (!createResult.success) {
        return {
          success: false,
          message: createResult.message
        };
      }
      const newData = createResult.data ? [...this._data, createResult.data] : this._data;

      this._data = newData;

      return {
        success: true,
        data: newData
      };
    }
    return {
      success: false
    };
  }

  private async createRootDocument(rule: Rule): Promise<ActionResult<RuleDocument>> {
    const newDocument: RuleDocument = {
      id: rule.workItemType,
      rules: [{ ...rule, id: uuidV4() }]
    };
    const created = await this._dataStore.setData(newDocument);

    return {
      success: true,
      data: created
    };
  }

  private async updateOrAddRule(
    rootDoc: RuleDocument,
    rule: Rule
  ): Promise<ActionResult<RuleDocument>> {
    const ruleIndex = rootDoc.rules.findIndex(x => x.id === rule?.id);
    if (ruleIndex >= 0) {
      const oldRule = rootDoc.rules[ruleIndex];
      if (this.isRuleSame(oldRule, rule)) {
        return {
          success: false,
          message: 'Duplicate rule'
        };
      }
      rootDoc.rules[ruleIndex] = rule;
    } else {
      if (rootDoc.rules.some(r => this.isRuleSame(r, rule))) {
        return {
          success: false,
          message: 'Duplicate rule'
        };
      }
      rootDoc.rules = [...rootDoc.rules, rule];
    }
    const updatedDocument = await this._dataStore.setData(rootDoc);

    return {
      success: true,
      data: updatedDocument
    };
  }

  public isValid(rule?: Rule): ActionResult<boolean> {
    if (rule === undefined) {
      return {
        success: false
      };
    }

    if (this._isInitialized === false) {
      throw new Error('RuleService is not initialized. Call Load() first.');
    }
    const docIndex = this._data?.findIndex(x => x.id === rule.workItemType);
    if (docIndex === undefined || docIndex < 0)
      return {
        success: false
      };

    const rootDoc = this._data[docIndex];

    if (rootDoc.rules.some(r => this.isRuleSame(r, rule))) {
      return {
        success: false,
        message: 'Duplicate rule'
      };
    }
    return {
      success: false
    };
  }

  private isRuleSame(ruleOne: Rule, ruleTwo: Rule) {
    if (ruleOne.workItemType !== ruleTwo.workItemType) return false;
    if (ruleOne.parentType !== ruleTwo.parentType) return false;
    if (ruleOne.parentTargetState !== ruleTwo.parentTargetState) return false;
    if (ruleOne.childState !== ruleTwo.childState) return false;
    if (ruleOne.allChildren !== ruleTwo.allChildren) return false;
    if (!ruleOne.parentNotState.every(x => ruleTwo.parentNotState.includes(x))) return false;
    return true;
  }

  public async showEdit(
    handleDialogResult: (result: AddRuleResult | undefined) => void,
    isValid: (result: AddRuleResult | undefined) => ActionResult<boolean>,
    rule?: Rule
  ): Promise<void> {
    const dialogService = await DevOps.getService<IHostPageLayoutService>(
      'ms.vss-features.host-page-layout-service'
    );

    const options: IDialogOptions<AddRuleResult> = {
      title: rule === undefined ? 'Add rule' : 'Edit rule',
      onClose: handleDialogResult,
      lightDismiss: false,
      configuration: { rule: rule, validate: isValid }
    };

    dialogService.openCustomDialog(DevOps.getExtensionContext().id + '.rule-modal', options);
  }
}

export default RuleService;
