import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

import RuleDocument from '../models/WorkItemRules';
import DevOpsService, { IDevOpsService } from './DevOpsService';

export interface IStorageService {
  getRulesForWorkItemType(
    workItemType: string,
    projectId: string
  ): Promise<RuleDocument | undefined>;
  getData(): Promise<RuleDocument[]>;
  setData(data: RuleDocument): Promise<RuleDocument>;
}

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  WorkItemRules = 'WorkItemRules'
}

class StorageService implements IStorageService {
  private readonly _devOpsService: IDevOpsService;
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;
  private _collectionName?: string;

  public constructor() {
    this._devOpsService = new DevOpsService();
    this.scopeType = ScopeType.Default;
  }

  private async getDataService(): Promise<IExtensionDataService> {
    if (this.dataService === undefined) {
      this.dataService = await DevOps.getService<IExtensionDataService>(
        'ms.vss-features.extension-data-service'
      );
    }

    if (this._collectionName === undefined) {
      const project = await this._devOpsService.getProject();

      if (project === undefined) {
        throw new Error('Failed to find project');
      }

      this._collectionName = `${project.id}-${CollectionNames.WorkItemRules}`;
    }

    return this.dataService;
  }

  public async getRulesForWorkItemType(workItemType: string): Promise<RuleDocument | undefined> {
    const dataService = await this.getDataService();

    if (this._collectionName === undefined) {
      throw new Error('Failed to initialize ');
    }

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const document: RuleDocument | undefined = await dataManager.getDocument(
      this._collectionName,
      workItemType,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    return document;
  }

  public async getData(): Promise<RuleDocument[]> {
    const dataService = await this.getDataService();
    if (this._collectionName === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocuments(this._collectionName, {
      scopeType: this.scopeType
    });
  }

  public async setData(data: RuleDocument): Promise<RuleDocument> {
    const dataService = await this.getDataService();
    if (this._collectionName === undefined) {
      throw new Error('Failed to initialize ');
    }
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(this._collectionName, data, {
      scopeType: ScopeType.Default
    });
  }
}

export { ScopeType, StorageService };
