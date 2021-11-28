import { IExtensionDataService } from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';
import { RuleDocument } from '../models/RulesDocument';

enum ScopeType {
  Default = 'Default',
  User = 'User'
}

enum CollectionNames {
  WorkItemRules = 'WorkItemRules'
}

class StorageService {
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

  public async getRulesForWorkItemType(id: string): Promise<RuleDocument | undefined> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocument(CollectionNames.WorkItemRules, id, {
      scopeType: this.scopeType,
      defaultValue: undefined
    });
  }
  public async deleteById(id: string): Promise<void> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.deleteDocument(CollectionNames.WorkItemRules, id);
  }
  public async getData(): Promise<RuleDocument[]> {
    const dataService = await this.getDataService();
    const dataManager = await dataService.getExtensionDataManager(
      DevOps.getExtensionContext().id,
      await DevOps.getAccessToken()
    );
    return dataManager.getDocuments(CollectionNames.WorkItemRules, {
      scopeType: this.scopeType
    });
  }

  public async setData(data: RuleDocument): Promise<RuleDocument> {
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
