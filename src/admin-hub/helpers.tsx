import {
  ContextualMenuItemType,
  IColumn,
  IconButton,
  IContextualMenuItem,
  IContextualMenuProps,
  IGroup
} from '@fluentui/react';
import {
  IDialogOptions,
  IHostNavigationService,
  IHostPageLayoutService
} from 'azure-devops-extension-api';
import { WorkItemStateColor, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';

import AddRuleResult from '../common/models/AddRuleResult';
import Rule from '../common/models/Rule';
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
      key: 'childState',
      name: 'When Child State',
      fieldName: 'childState',
      className: 'flex-self-center',
      minWidth: 50,
      maxWidth: 300,
      isResizable: true,
      onRender: (item?: any, index?: number, column?: IColumn) => {
        const state = getState(types, item.workItemType, item.childState);
        return state === undefined ? state : <StateTag color={state.color} text={state.name} />;
      }
    },
    {
      key: 'parentType',
      name: 'And parent type',
      fieldName: 'parentType',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      onRender: (item?: any, index?: number, column?: IColumn) => {
        const type = getWorkItemType(types, item.parentType);
        return type === undefined ? (
          item.parentType
        ) : (
          <WorkItemTypeTag iconSize={14} iconUrl={type.icon.url} text={type.name} />
        );
      }
    },
    {
      key: 'parentNotState',
      name: 'Parent state is not',
      fieldName: 'parentNotState',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      onRender: (item?: any, index?: number, column?: IColumn) => {
        const states = getWorkItemType(types, item.parentType);
        return (
          <div className="flex-column">
            {item.parentNotState.map((s: string) => {
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
      name: 'Set parent state to',
      fieldName: 'parentTargetState',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      onRender: (item?: any, index?: number, column?: IColumn) => {
        const state = getState(types, item.parentType, item.parentTargetState);
        return state === undefined ? state : <StateTag color={state.color} text={state.name} />;
      }
    },
    {
      key: 'allChildren',
      name: 'When all children',
      fieldName: 'allChildren',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      onRender: (item?: any, index?: number, column?: IColumn) => {
        return item.allChildren ? 'YES' : 'NO';
      }
    },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      className: 'flex-self-center',
      minWidth: 100,
      onRender: (item?: any, index?: number, column?: IColumn) => {
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
          handleDeleteRule(rule.workItemType, rule.id!).then(r => {
            return r;
          });
        }
      }
    ]
  };
};
export const getCommandBarItems = (
  handleResult: (result: AddRuleResult | undefined) => Promise<void>
): IHeaderCommandBarItem[] => [
  {
    id: 'open-docs',
    text: 'Open docs',
    iconProps: { iconName: 'Help' },
    onActivate: () => {
      DevOps.getService<IHostNavigationService>('ms.vss-features.host-navigation-service').then(
        value => {
          value.openNewWindow('https://github.com/joachimdalen/azdevops-auto-state', '');
        }
      );
    }
  },
  {
    id: 'new-rule',
    text: 'Add Rule',
    isPrimary: true,
    iconProps: { iconName: 'Add' },
    onActivate: () => {
      DevOps.getService<IHostPageLayoutService>('ms.vss-features.host-page-layout-service').then(
        dialogService => {
          const options: IDialogOptions<AddRuleResult> = {
            title: 'Create new rule',
            onClose: handleResult
          };

          dialogService.openCustomDialog(DevOps.getExtensionContext().id + '.rule-modal', options);
        }
      );
    }
  }
];
function groupBy<T>(list: T[], keyGetter: (value: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

export { getState, getWorkItemType, isGroup, groupBy };
