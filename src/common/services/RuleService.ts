import { IProjectInfo, IProjectPageService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { v4 as uuidV4 } from 'uuid';

import ProjectConfigurationDocument from '../models/ProjectConfigurationDocument';
import Rule from '../models/Rule';
import { StorageService } from './StorageService';

class RuleService {
  private readonly _dataStore: StorageService;
  private _data: ProjectConfigurationDocument | undefined;
  constructor() {
    this._dataStore = new StorageService();
  }

  public async getProject(): Promise<IProjectInfo | undefined> {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    const project = await projectService.getProject();
    return project;
  }
  public async load(): Promise<ProjectConfigurationDocument | undefined> {
    const project = await this.getProject();
    if (!project) return;

    const data = await this._dataStore.getDataForProject(project.id);
    this._data = data;
    return this._data;
  }

  public async updateRule(
    workItemType: string,
    rule: Rule
  ): Promise<ProjectConfigurationDocument | undefined> {
    const project = await this.getProject();
    if (!project) return;
    if (this._data === undefined) {
      const newDocument: ProjectConfigurationDocument = {
        id: project.id,
        workItemRules: [{ workItemType: rule.workItemType, rules: [{ ...rule, id: uuidV4() }] }]
      };
      const created = await this._dataStore.setData(newDocument);
      return created;
    }

    const wiIndex = this._data.workItemRules.findIndex(x => x.workItemType === workItemType);

    if (wiIndex !== undefined && wiIndex > 0) {
      const ruleDocument = this._data.workItemRules[wiIndex];
      const ruleIndex = ruleDocument.rules.findIndex(x => x.id === rule?.id);
      if (ruleIndex >= 0) {
        ruleDocument.rules[ruleIndex] = rule;
      } else {
        ruleDocument.rules = [...ruleDocument.rules, rule];
      }
      const nd = { ...this._data };
      nd.workItemRules[wiIndex] = ruleDocument;
      const updatedDocument = await this._dataStore.setData(nd);
      return updatedDocument;
    }
    const newDoc: ProjectConfigurationDocument = {
      ...this._data,
      workItemRules: [
        ...this._data.workItemRules,
        { workItemType: rule.workItemType, rules: [{ ...rule, id: uuidV4() }] }
      ]
    };
    const created = await this._dataStore.setData(newDoc);
    return created;
  }
}

export default RuleService;
