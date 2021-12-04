import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  GroupHeader,
  IColumn,
  IDetailsGroupDividerProps,
  IGroup
} from '@fluentui/react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import AddRuleResult from '../common/models/AddRuleResult';
import ProjectConfigurationDocument from '../common/models/ProjectConfigurationDocument';
import Rule from '../common/models/Rule';
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
  const storageService = useMemo(() => new StorageService(), []);
  const workItemService = useMemo(() => new WorkItemService(), []);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      const service = new WorkItemService();
      const loadedTypes = await service.getWorkItemTypes();
      const project = await service.getProject();
      setTypes(loadedTypes);

      try {
        if (project) {
          const config = await storageService.getDataForProject(project.id);
          setConfiguration(config);
          webLogger.information(config);
        }
      } catch (error) {
        webLogger.information('Failed to get project configuration', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDialogResult = async (result: AddRuleResult | undefined) => {
    if (result?.result === 'CANCEL') return;
    if (!result?.rule) return;
    const project = await workItemService.getProject();
    if (!project) return;
    if (configuration === undefined) {
      const newDocument: ProjectConfigurationDocument = {
        id: project.id,
        workItemRules: [
          { workItemType: result.rule.workItemType, rules: [{ ...result.rule, id: uuidV4() }] }
        ]
      };
      const created = await storageService.setData(newDocument);
      setConfiguration(created);
    } else {
      const wiIndex = configuration?.workItemRules.findIndex(
        x => x.workItemType === result.workItemType
      );
      if (wiIndex !== undefined && wiIndex > 0) {
        const ruleDocument = configuration.workItemRules[wiIndex];
        const ruleIndex = ruleDocument.rules.findIndex(x => x.id === result.rule?.id);
        if (ruleIndex >= 0) {
          ruleDocument.rules[ruleIndex] = result.rule;
        } else {
          ruleDocument.rules = [...ruleDocument.rules, result.rule];
        }
        const nd = { ...configuration };
        nd.workItemRules[wiIndex] = ruleDocument;
        const updatedDocument = await storageService.setData(nd);
        setConfiguration(updatedDocument);
      } else {
        const newDoc: ProjectConfigurationDocument = {
          ...configuration,
          workItemRules: [
            ...configuration.workItemRules,
            { workItemType: result.rule.workItemType, rules: [{ ...result.rule, id: uuidV4() }] }
          ]
        };
        const created = await storageService.setData(newDoc);
        setConfiguration(created);
      }
    }
  };

  const handleDeleteRule = async (workItemType: string, ruleId: string): Promise<boolean> => {
    if (!configuration) return false;
    const documentIndex = configuration.workItemRules.findIndex(
      x => x.workItemType === workItemType
    );
    console.log(documentIndex, workItemType, ruleId, configuration);
    if (documentIndex && documentIndex >= 0) {
      const document = { ...configuration };
      const newRules = document.workItemRules[documentIndex].rules.filter(z => z.id !== ruleId);
      document.workItemRules[documentIndex].rules = newRules;
      const updatedDocument = await storageService.setData(document);
      setConfiguration(updatedDocument);
    }
    return true;
  };
  const commandBarItems: IHeaderCommandBarItem[] = useMemo(
    () => getCommandBarItems(handleDialogResult),
    [handleDialogResult]
  );
  const columns: IColumn[] = useMemo(() => getListColumns(types, handleDeleteRule), [
    types,
    configuration
  ]);

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

  useEffect(() => {
    webLogger.information([ruleItems, groups]);
  }, [ruleItems, groups]);

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header commandBarItems={commandBarItems} title="Auto State" />
        <div className="page-content padding-16">
          <LoadingSection isLoading={loading} text="Loading rules.." />
          <ConditionalChildren renderChildren={!loading}>
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
