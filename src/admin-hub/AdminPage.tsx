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
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Icon } from 'azure-devops-ui/Icon';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import React, { useEffect, useMemo, useState } from 'react';

import { groupBy } from '../common/helpers';
import AddRuleResult from '../common/models/AddRuleResult';
import Rule from '../common/models/Rule';
import RuleDocument from '../common/models/WorkItemRules';
import DevOpsService, { PanelIds } from '../common/services/DevOpsService';
import RuleService from '../common/services/RuleService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import LoadingSection from '../shared-ui/component/LoadingSection';
import VersionDisplay from '../shared-ui/component/VersionDisplay';
import WorkItemTypeTag from '../shared-ui/component/WorkItemTypeTag';
import { getCommandBarItems, getListColumns, getPresetPanelProps, isGroup } from './helpers';

const AdminPage = (): React.ReactElement => {
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [configuration, setConfiguration] = useState<RuleDocument[] | undefined>(undefined);
  const [workItemService, ruleService, devOpsService] = useMemo(
    () => [new WorkItemService(), new RuleService(), new DevOpsService()],
    []
  );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      const loadedTypes = await workItemService.getWorkItemTypes();

      setTypes(loadedTypes);

      try {
        await refreshData();
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
    const updateResult = await ruleService.updateRule(result.workItemType, result.rule);
    if (updateResult.success) {
      setConfiguration(updateResult.data);
    }
  };

  const handleDeleteRule = async (workItemType: string, ruleId: string): Promise<boolean> => {
    if (!configuration) return false;

    const updateResult = await ruleService.deleteRule(workItemType, ruleId);
    if (updateResult.success) {
      setConfiguration(updateResult.data);
    }

    return true;
  };

  const showEditRule = async (rule?: Rule) =>
    ruleService.showEdit(handleDialogResult, result => ruleService.isValid(result?.rule), rule);
  const refreshData = async (force = false): Promise<void> => {
    const loadResult = await ruleService.load(force);
    if (loadResult.success) {
      setConfiguration(loadResult.data || []);

      if (force) {
        await devOpsService.showToast('Refreshed rules');
      }
    }
  };

  const commandBarItems: IHeaderCommandBarItem[] = useMemo(
    () => getCommandBarItems(devOpsService, showEditRule, refreshData),
    [showEditRule, refreshData]
  );
  const columns: IColumn[] = useMemo(
    () => getListColumns(types, handleDeleteRule, showEditRule),
    [types, configuration]
  );

  const [ruleItems, groups]: [Rule[], IGroup[]] = useMemo(() => {
    if (!configuration) return [[], []];
    const rules = configuration?.flatMap(x => x.rules);
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
        <Header
          commandBarItems={commandBarItems}
          titleSize={TitleSize.Large}
          title="Auto State"
          description={<VersionDisplay moduleVersion={process.env.ADMIN_HUB_VERSION} />}
        />
        <div className="page-content padding-16">
          <LoadingSection isLoading={loading} text="Loading rules.." />
          <ConditionalChildren renderChildren={!loading && ruleItems.length === 0}>
            <div className="flex-column flex-center margin-vertical-16">
              <Icon iconName="Work" className="custom-zero-data-icon" />
              <div className="margin-horizontal-16 title-l">No rules added</div>
              <ButtonGroup className="margin-top-16">
                <Button
                  primary
                  text="Add rule"
                  onClick={() => {
                    showEditRule();
                  }}
                />
                <Button
                  text="Show default rule wizard"
                  onClick={async () => {
                    const options = await getPresetPanelProps(refreshData);
                    await devOpsService.showPanel(PanelIds.PresetsPanel, options);
                  }}
                />
              </ButtonGroup>
            </div>
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
