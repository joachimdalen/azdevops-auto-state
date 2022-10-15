import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

import SettingDocument from '../models/SettingDocument';
import RuleDocument from '../models/WorkItemRules';
import DevOpsService, { IDevOpsService } from './DevOpsService';

export interface IStorageService {
  getRulesForWorkItemType(
    workItemType: string,
    projectId: string
  ): Promise<RuleDocument | undefined>;
  getRuleDocuments(): Promise<RuleDocument[]>;
  setRuleDocument(data: RuleDocument): Promise<RuleDocument>;
}

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  WorkItemRules = 'WorkItemRules',
  Settings = 'Settings'
}

class StorageService implements IStorageService {
  private readonly _devOpsService: IDevOpsService;
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;
  private _collectionName?: string;
  private _projectId?: string;

  public constructor(projectId?: string) {
    this._devOpsService = new DevOpsService();
    this.scopeType = ScopeType.Default;
    this._projectId = projectId;
  }

  private async getDataService(): Promise<IExtensionDataService> {
    if (this.dataService === undefined) {
      this.dataService = await DevOps.getService<IExtensionDataService>(
        'ms.vss-features.extension-data-service'
      );
    }
    if (this._projectId === undefined) {
      const project = await this._devOpsService.getProject();

      if (project === undefined) {
        throw new Error('Failed to find project');
      }
      this._projectId = project.id;
    }
    
    if (this._collectionName === undefined) {
      this._collectionName = `${this._projectId}-${CollectionNames.WorkItemRules}`;
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
  public async getRuleDocuments(): Promise<RuleDocument[]> {
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

  public async setRuleDocument(data: RuleDocument): Promise<RuleDocument> {
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

  public async getSettings(): Promise<SettingDocument> {
    const defaultDocument: SettingDocument = {
      id: '',
      __etag: '-1',
      useScopedWorkItemTypes: false
    };
    try {
      const dataService = await this.getDataService();
      if (!this._projectId) {
        return defaultDocument;
      }
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );

      const document = await dataManager.getDocument(CollectionNames.Settings, this._projectId, {
        defaultValue: defaultDocument
      });

      return document;
    } catch (error: any) {
      if (error?.status !== 404) {
        throw new Error(error);
      } else {
        return defaultDocument;
      }
    }
  }

  public async setSettings(data: SettingDocument): Promise<SettingDocument> {
    const dataService = await this.getDataService();

    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(CollectionNames.Settings, {
      ...data,
      id: this._projectId
    });
  }
}

export { ScopeType, StorageService };
