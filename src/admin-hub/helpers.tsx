import {
  ContextualMenuItemType,
  FontIcon,
  IColumn,
  IconButton,
  IContextualMenuItem,
  IContextualMenuProps,
  IGroup,
  mergeStyles
} from '@fluentui/react';
import { IPanelOptions } from 'azure-devops-extension-api';
import { WorkItemStateColor, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { MenuItemType } from 'azure-devops-ui/Menu';
import { Pill, PillVariant } from 'azure-devops-ui/Pill';
import { PillGroup, PillGroupOverflow } from 'azure-devops-ui/PillGroup';
import { IColor } from 'azure-devops-ui/Utilities/Color';

import { ActionResult } from '../common/models/ActionResult';
import Rule from '../common/models/Rule';
import { IDevOpsService, PanelIds } from '../common/services/DevOpsService';
import webLogger from '../common/webLogger';
import StateTag from '../shared-ui/component/StateTag';
import WorkItemTypeTag from '../shared-ui/component/WorkItemTypeTag';

const getWorkItemType = (types: WorkItemType[], type: string): WorkItemType | undefined =>
  types.find(x => x.referenceName === type);
const getState = (
  types: WorkItemType[],
  type: string,
  state: string
): WorkItemStateColor | undefined =>
  getWorkItemType(types, type)?.states?.find(x => x.name === state);

const colorGreen: IColor = { red: 15, green: 71, blue: 30 };
const colorPurple: IColor = { red: 153, green: 67, blue: 196 };
const colorBlue: IColor = { red: 67, green: 127, blue: 196 };
const isGroup = (item: IGroup | undefined): item is IGroup => {
  return !!item;
};

export const getListColumns = (
  types: WorkItemType[],
  handleDeleteRule: (workItemType: string, ruleId: string) => Promise<boolean>,
  showEditRule: (rule: Rule) => Promise<void>
): IColumn[] => {
  const columns: IColumn[] = [
    {
      key: 'enabled',
      name: 'Enabled',
      fieldName: 'disabled',
      className: 'flex-self-center',
      minWidth: 50,
      maxWidth: 80,
      isResizable: true,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        return (
          <FontIcon
            className={mergeStyles({
              fontSize: 20,
              color: item.disabled ? 'red' : 'green'
            })}
            iconName={item.disabled ? 'Clear' : 'Accept'}
          />
        );
      }
    },
    {
      key: 'transitionState',
      name: 'Transition state',
      fieldName: 'transitionState',
      className: 'flex-self-center',
      minWidth: 50,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        const state = getState(types, item.workItemType, item.transitionState);
        return state === undefined ? state : <StateTag color={state.color} text={state.name} />;
      }
    },
    {
      key: 'parentType',
      name: 'Parent type',
      fieldName: 'parentType',
      className: 'flex-self-center',
      minWidth: 50,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        const type = getWorkItemType(types, item.parentType);
        return type === undefined ? (
          item.parentType
        ) : (
          <WorkItemTypeTag iconSize={14} iconUrl={type.icon.url} text={type.name} />
        );
      }
    },
    {
      key: 'parentExcludedStates',
      name: 'Parent not in state',
      fieldName: 'parentExcludedStates',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        const states = getWorkItemType(types, item.parentType);
        return (
          <div className="flex-column">
            {item.parentExcludedStates.map((s: string) => {
              const state = states?.states?.find(x => x.name === s);
              return state !== undefined ? (
                <StateTag key={state.name} text={state.name} color={state.color} />
              ) : (
                s
              );
            })}
          </div>
        );
      }
    },
    {
      key: 'parentTargetState',
      name: 'Parent target state',
      fieldName: 'parentTargetState',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        const state = getState(types, item.parentType, item.parentTargetState);
        return state === undefined ? state : <StateTag color={state.color} text={state.name} />;
      }
    },
    {
      key: 'properties',
      name: 'Properties',
      fieldName: 'properties',
      className: 'flex-self-center',
      minWidth: 100,
      isResizable: true,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        const hasFilters = item.filterGroups !== undefined && item.filterGroups.length > 0;
        return (
          <PillGroup overflow={PillGroupOverflow.wrap}>
            {item.childrenLookup && (
              <Pill
                variant={PillVariant.colored}
                color={colorBlue}
                iconProps={{ iconName: 'ChevronDown' }}
              >
                Children Lookup
              </Pill>
            )}
            {item.processParent && (
              <Pill
                variant={PillVariant.colored}
                color={colorPurple}
                iconProps={{ iconName: 'ChevronUp' }}
              >
                Process Parent
              </Pill>
            )}
            {hasFilters && (
              <Pill
                variant={PillVariant.colored}
                color={colorGreen}
                iconProps={{ iconName: 'Filter' }}
              >
                Filtered
              </Pill>
            )}
          </PillGroup>
        );
      }
    },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      className: 'flex-self-center',
      minWidth: 100,
      onRender: (item: Rule, index?: number, column?: IColumn) => {
        return (
          <IconButton
            splitButtonMenuProps={{}}
            menuProps={getListRowContextMenuItem(item, handleDeleteRule, showEditRule)}
            iconProps={{ iconName: 'MoreVertical' }}
          />
        );
      }
    }
  ];
  return columns;
};

const getListRowContextMenuItem = (
  rule: Rule,
  handleDeleteRule: (workItemType: string, ruleId: string) => Promise<boolean>,
  showEditRule: (rule: Rule) => Promise<void>
): IContextualMenuProps => {
  return {
    shouldFocusOnMount: true,

    items: [
      {
        key: 'Actions',
        itemType: ContextualMenuItemType.Header,
        text: 'Actions',
        itemProps: { lang: 'en-us' }
      },
      {
        key: 'edit',
        text: 'Edit',
        iconProps: { iconName: 'Edit' },
        onClick: (
          ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
          item?: IContextualMenuItem
        ) => {
          showEditRule(rule).then(r => {
            return r;
          });
        }
      },
      // {
      //   key: 'duplicate',
      //   text: 'Duplicate Rule',
      //   iconProps: { iconName: 'Copy', style: { color: 'green' } }
      // },
      {
        key: 'div1',
        itemType: ContextualMenuItemType.Divider
      },
      {
        key: 'delete',
        iconProps: { iconName: 'Delete', style: { color: 'salmon' } },
        text: 'Delete',
        title: 'Delete rule',
        onClick: (
          ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
          item?: IContextualMenuItem
        ) => {
          if (rule.id) {
            handleDeleteRule(rule.workItemType, rule.id).then(r => {
              return r;
            });
          }
        }
      }
    ]
  };
};
export const getCommandBarItems = (
  devOpsService: IDevOpsService,
  showEdit: (rule?: Rule) => Promise<void>,
  refreshData: (force: boolean) => Promise<void>
): IHeaderCommandBarItem[] => [
  {
    id: 'refresh-date',
    text: 'Refresh Data',
    iconProps: { iconName: 'Refresh' },
    onActivate: () => {
      refreshData(true).then(() => {
        webLogger.information('Refreshed rules');
      });
    }
  },
  {
    id: 'new-rule',
    text: 'Add Rule',
    isPrimary: true,
    iconProps: { iconName: 'Add' },
    important: true,
    onActivate: () => {
      showEdit();
    }
  },
  {
    id: 'settings',
    text: 'Settings',
    iconProps: { iconName: 'Settings' },
    important: true,
    isPrimary: true,
    onActivate: () => {
      const options: IPanelOptions<any> = {
        title: 'Settings',
        size: 2
      };
      devOpsService.showPanel(PanelIds.Settings, options);
    }
  },
  {
    iconProps: { iconName: 'TestBeaker' },
    id: 'rule-tester',
    text: 'Rule Tester',
    important: false,
    onActivate: () => {
      const options: IPanelOptions<any> = {
        title: 'Rule Tester',
        size: 2
      };
      devOpsService.showPanel(PanelIds.RuleTesterPanel, options);
    }
  },
  {
    iconProps: { iconName: 'Work' },
    id: 'presets',
    text: 'Rule Presets',
    important: false,
    onActivate: async () => {
      const options = await getPresetPanelProps(refreshData);
      await devOpsService.showPanel(PanelIds.PresetsPanel, options);
    }
  },
  {
    id: 'splitter-one',
    itemType: MenuItemType.Divider
  },
  {
    id: 'open-docs',
    text: 'Open docs',
    iconProps: { iconName: 'Help' },
    important: false,
    onActivate: () => {
      devOpsService.openLink('https://github.com/joachimdalen/azdevops-auto-state');
    }
  }
];

const getPresetPanelProps = async (
  refreshData: (force: boolean) => Promise<void>
): Promise<IPanelOptions<any>> => {
  const options: IPanelOptions<any> = {
    title: 'Use preset rules',
    description: 'Preset rules are predefined rules that can be created for easier setup',
    size: 2,
    onClose: async (result?: ActionResult<any>) => {
      if (result?.success && result?.message === 'ADDED') {
        await refreshData(true);
      }
    }
  };

  return options;
};

export { getState, getWorkItemType, isGroup, getPresetPanelProps };
