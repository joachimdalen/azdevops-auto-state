import { IPanel, Panel } from '@fluentui/react';
import {
  IGlobalMessagesService,
  IHostNavigationService,
  IHostPageLayoutService,
  IPanelOptions,
  IProjectInfo,
  IProjectPageService
} from 'azure-devops-extension-api';
import * as DevOps from 'azure-devops-extension-sdk';

export interface IDevOpsService {
  getProject(): Promise<IProjectInfo | undefined>;
  showToast(message: string): Promise<void>;
  showPanel<T>(id: PanelIds, options: IPanelOptions<T>): Promise<void>;
  openLink(url: string): Promise<void>;
}

export enum PanelIds {
  RulePanel = 'rule-modal',
  RuleTesterPanel = 'rule-tester',
  Settings = 'settings-panel'
}

export default class DevOpsService implements IDevOpsService {
  public async getProject(): Promise<IProjectInfo | undefined> {
    const projectService = await DevOps.getService<IProjectPageService>(
      'ms.vss-tfs-web.tfs-page-data-service'
    );
    const project = await projectService.getProject();
    return project;
  }
  public async showToast(message: string): Promise<void> {
    const messageService = await DevOps.getService<IGlobalMessagesService>(
      'ms.vss-tfs-web.tfs-global-messages-service'
    );
    messageService.addToast({
      duration: 2500,
      message: message
    });
  }
  public async showPanel<T>(id: PanelIds, options: IPanelOptions<T>): Promise<void> {
    const dialogService = await DevOps.getService<IHostPageLayoutService>(
      'ms.vss-features.host-page-layout-service'
    );
    const panelId = this.getPanelId(id);

    if (panelId === undefined) return;

    dialogService.openPanel(`${DevOps.getExtensionContext().id}.${panelId}`, options);
  }

  public getPanelId(id: PanelIds): string | undefined {
    switch (id) {
      case PanelIds.RulePanel:
        return 'rule-modal';
      case PanelIds.RuleTesterPanel:
        return 'rule-tester';
      case PanelIds.Settings:
        return 'settings-panel';
    }
  }

  public async openLink(url: string): Promise<void> {
    const navigationService = await DevOps.getService<IHostNavigationService>(
      'ms.vss-features.host-navigation-service'
    );
    navigationService.openNewWindow(url, '');
  }
}
