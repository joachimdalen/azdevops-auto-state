import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  GroupHeader,
  IColumn,
  IDetailsGroupDividerProps,
  IGroup
} from '@fluentui/react';
import { IDialogOptions, IHostPageLayoutService } from 'azure-devops-extension-api';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import React, { useEffect, useMemo, useState } from 'react';

import AddRuleResult from '../common/models/AddRuleResult';
import ProjectConfigurationDocument from '../common/models/ProjectConfigurationDocument';
import Rule from '../common/models/Rule';
import MetaService from '../common/services/MetaService';
import RuleService from '../common/services/RuleService';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import LoadingSection from '../shared-ui/component/LoadingSection';
import WorkItemTypeTag from '../shared-ui/component/WorkItemTypeTag';
import { getCommandBarItems, getListColumns, groupBy, isGroup } from './helpers';

const AdminPage = (): React.ReactElement => {
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [configuration, setConfiguration] = useState<ProjectConfigurationDocument | undefined>(
    undefined
  );
  const [storageService, workItemService, metaService, ruleService] = useMemo(
    () => [new StorageService(), new WorkItemService(), new MetaService(), new RuleService()],
    []
  );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      const loadedTypes = await workItemService.getWorkItemTypes();
      const project = await metaService.getProject();
      setTypes(loadedTypes);

      try {
        if (project) {
          const config = await ruleService.load();
          setConfiguration(config);
        }
      } catch (error) {
        webLogger.error('Failed to get project configuration', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDialogResult = async (result: AddRuleResult | undefined) => {
    if (result?.result === 'CANCEL') return;
    if (!result?.rule || !result.workItemType) return;
    const updatedData = await ruleService.updateRule(result.workItemType, result.rule);
    setConfiguration(updatedData);
  };

  const handleDeleteRule = async (workItemType: string, ruleId: string): Promise<boolean> => {
    if (!configuration) return false;
    const documentIndex = configuration.workItemRules.findIndex(
      x => x.workItemType === workItemType
    );

    if (documentIndex >= 0) {
      const document = { ...configuration };
      const newRules = document.workItemRules[documentIndex].rules.filter(z => z.id !== ruleId);
      document.workItemRules[documentIndex].rules = newRules;
      const updatedDocument = await storageService.setData(document);
      setConfiguration(updatedDocument);
    }
    return true;
  };

  const showEditRule = async (rule: Rule) => {
    DevOps.getService<IHostPageLayoutService>('ms.vss-features.host-page-layout-service').then(
      dialogService => {
        const options: IDialogOptions<AddRuleResult> = {
          title: 'Edit rule',
          onClose: handleDialogResult,
          configuration: {
            rule: rule,
            editMode: true
          }
        };

        dialogService.openCustomDialog(DevOps.getExtensionContext().id + '.rule-modal', options);
      }
    );
  };

  const commandBarItems: IHeaderCommandBarItem[] = useMemo(
    () => getCommandBarItems(handleDialogResult),
    [handleDialogResult]
  );
  const columns: IColumn[] = useMemo(
    () => getListColumns(types, handleDeleteRule, showEditRule),
    [types, configuration]
  );

  const [ruleItems, groups]: [Rule[], IGroup[]] = useMemo(() => {
    if (!configuration) return [[], []];
    const rules = configuration?.workItemRules.flatMap(x => x.rules);
    const grouped = groupBy(rules, x => x.workItemType);
    const keys = Array.from(grouped.keys());
    let stIndex = 0;
    const groups = keys
      .map(key => {
        const type = types.find(x => x.referenceName === key);
        if (!type) return undefined;
        const count = grouped.get(key)?.length || 0;
        const group: IGroup = {
          key: type.referenceName,
          name: type.name,
          data: {
            icon: type.icon
          },
          startIndex: stIndex,
          count: count,
          level: 0
        };
        stIndex = stIndex + count;
        return group;
      })
      .filter(isGroup);
    return [rules, groups];
  }, [configuration, types]);

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header commandBarItems={commandBarItems} title="Auto State" />
        <div className="page-content padding-16">
          <LoadingSection isLoading={loading} text="Loading rules.." />
          <ConditionalChildren renderChildren={!loading && ruleItems.length === 0}>
            <ZeroData
              imageAltText=""
              primaryText="No rules added"
              actionText="Add rule"
              onActionClick={() => {
                DevOps.getService<IHostPageLayoutService>(
                  'ms.vss-features.host-page-layout-service'
                ).then(dialogService => {
                  const options: IDialogOptions<AddRuleResult> = {
                    title: 'Create new rule',
                    onClose: handleDialogResult
                  };

                  dialogService.openCustomDialog(
                    DevOps.getExtensionContext().id + '.rule-modal',
                    options
                  );
                });
              }}
              actionType={ZeroDataActionType.ctaButton}
              iconProps={{ iconName: 'Work' }}
            />
          </ConditionalChildren>
          <ConditionalChildren renderChildren={!loading && ruleItems.length > 0}>
            <DetailsList
              items={ruleItems}
              columns={columns}
              groups={groups}
              setKey="set"
              layoutMode={DetailsListLayoutMode.justified}
              selectionPreservedOnEmptyClick={true}
              ariaLabelForSelectionColumn="Toggle selection"
              ariaLabelForSelectAllCheckbox="Toggle selection for all items"
              checkboxVisibility={CheckboxVisibility.hidden}
              onItemInvoked={item => webLogger.information(item)}
              groupProps={{
                showEmptyGroups: false,
                onRenderHeader: (
                  props?: IDetailsGroupDividerProps,
                  defaultRender?: (props?: IDetailsGroupDividerProps) => JSX.Element | null
                ): JSX.Element | null => {
                  return (
                    <GroupHeader
                      onRenderTitle={props => (
                        <div className="flex-row flex-grow padding-right-16">
                          <WorkItemTypeTag
                            classNames="flex-grow"
                            iconUrl={props?.group?.data?.icon?.url}
                            text={props?.group?.name}
                          />
                          <div>{props?.group?.count} Rules</div>
                        </div>
                      )}
                      {...props}
                    />
                  );
                }
              }}
            />
          </ConditionalChildren>
        </div>
      </Page>
    </Surface>
  );
};
export default AdminPage;
