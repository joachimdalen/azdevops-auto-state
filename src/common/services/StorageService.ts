import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

import ProjectConfigurationDocument from '../models/ProjectConfigurationDocument';
import WorkItemRules from '../models/WorkItemRules';

export interface IStorageService {
  getRulesForWorkItemType(
    workItemType: string,
    projectId: string
  ): Promise<WorkItemRules | undefined>;
  getData(): Promise<ProjectConfigurationDocument[]>;
  getDataForProject(projectId: string): Promise<ProjectConfigurationDocument | undefined>;
  setData(data: ProjectConfigurationDocument): Promise<ProjectConfigurationDocument>;
}

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  WorkItemRules = 'WorkItemRules'
}

class StorageService implements IStorageService {
  private scopeType: ScopeType;
  private dataService?: IExtensionDataService;

  public constructor() {
    this.scopeType = ScopeType.Default;
  }

  private async getDataService(): Promise<IExtensionDataService> {
    if (this.dataService === undefined) {
      this.dataService = await DevOps.getService<IExtensionDataService>(
        'ms.vss-features.extension-data-service'
      );
    }
    return this.dataService;
  }

  public async getRulesForWorkItemType(
    workItemType: string,
    projectId: string
  ): Promise<WorkItemRules | undefined> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    const document: ProjectConfigurationDocument | undefined = await dataManager.getDocument(
      CollectionNames.WorkItemRules,
      projectId,
      {
        scopeType: this.scopeType,
        defaultValue: undefined
      }
    );

    if (!document) return undefined;

    const types = document.workItemRules?.find(x => x.workItemType === workItemType);
    return types;
  }
  public async getDataForProject(
    projectId: string
  ): Promise<ProjectConfigurationDocument | undefined> {
    try {
      const dataService = await this.getDataService();
      const dataManager = await dataService.getExtensionDataManager(
        DevOps.getExtensionContext().id,
        await DevOps.getAccessToken()
      );
      const data = await dataManager.getDocument(CollectionNames.WorkItemRules, projectId, {
        scopeType: this.scopeType
      });
      return data;
    } catch (error) {
      return undefined;
    }
  }

  public async getData(): Promise<ProjectConfigurationDocument[]> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocuments(CollectionNames.WorkItemRules, {
      scopeType: this.scopeType
    });
  }

  public async setData(data: ProjectConfigurationDocument): Promise<ProjectConfigurationDocument> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.setDocument(CollectionNames.WorkItemRules, data, {
      scopeType: ScopeType.Default
    });
  }
}

export { ScopeType, StorageService };
