import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  GroupHeader,
  IColumn,
  IDetailsGroupDividerProps,
  IGroup} from '@fluentui/react';
import {
  IDialogOptions,
  IHostNavigationService,
  IHostPageLayoutService
} from 'azure-devops-extension-api';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Header } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import StateTag from '../common/component/StateTag';
import WorkItemTypeTag from '../common/component/WorkItemTypeTag';
import { AddRuleResult, Rule, RuleDocument } from '../common/models/RulesDocument';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import { getState, getWorkItemType, groupBy, isGroup } from './helpers';

const AdminPage = (): React.ReactElement => {
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [documents, setDocuments] = useState<RuleDocument[]>([]);
  const storageService = useMemo(() => new StorageService(), []);
  useEffect(() => {
    async function fetchData() {
      const service = new WorkItemService();
      const loadedTypes = await service.getWorkItemTypes();
      setTypes(loadedTypes);

      try {
        const documents = await storageService.getData();
        setDocuments(documents);
        console.log(documents);
      } catch (error) {
        console.log('Failed to get documents', error);
      }
    }

    fetchData();
  }, []);

  const commandBarItems: IHeaderCommandBarItem[] = [
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
      id: 'clear-storage',
      text: 'Clear',
      iconProps: { iconName: 'Help' },
      onActivate: () => {
        new StorageService().deleteById('06d8f15d-6931-47b9-837a-d986caa2fa60');
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
              onClose: async (result: AddRuleResult | undefined) => {
                if (result?.result === 'CANCEL') return;
                if (!result?.rule) return;
                const documentsForType = documents.find(x => x.id === result.id);

                if (documentsForType) {
                  const ruleIndex = documentsForType.rules.findIndex(x => x.id === result.rule?.id);
                  if (ruleIndex >= 0) {
                    documentsForType.rules[ruleIndex] = result.rule;
                  } else {
                    documentsForType.rules = [...documentsForType.rules, result.rule];
                  }
                  await storageService.setData(documentsForType);
                  const docIndex = documents.findIndex(x => x.id === result.id);
                  if (docIndex >= 0) {
                    const newDocs = [...documents];
                    newDocs[docIndex] = documentsForType;
                    setDocuments(newDocs);
                  }
                } else {
                  console.log('Creating new document');
                  const newDocument: RuleDocument = {
                    id: result.rule.workItemType,
                    rules: [{ ...result.rule, id: uuidV4() }]
                  };
                  const created = await storageService.setData(newDocument);
                  setDocuments(prev => [...prev, created]);
                }
              }
            };

            dialogService.openCustomDialog(
              DevOps.getExtensionContext().id + '.rule-modal',
              options
            );
          }
        );
      }
    }
  ];
  const columns: IColumn[] = [
    {
      key: 'childState',
      name: 'When Child State',
      fieldName: 'childState',
      className: 'flex-self-center',
      minWidth: 50,
      maxWidth: 150,
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
      maxWidth: 200,
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
      maxWidth: 200,
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
      maxWidth: 200,
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
      maxWidth: 200,
      isResizable: true
    },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      className: 'flex-self-center',
      minWidth: 100,
      maxWidth: 200
    }
  ];

  const [ruleItems, groups]: [Rule[], IGroup[]] = useMemo(() => {
    const rules = documents.flatMap(x => x.rules);
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

    // const groups = types
    //   .map((x, i) => {
    //     const itemCount = rules.filter(y => y.workItemType === x.referenceName).length;
    //     if (itemCount === 0) return undefined;
    //     const group: IGroup = {
    //       key: x.referenceName,
    //       name: x.name,
    //       data: {
    //         icon: x.icon
    //       },
    //       startIndex: 0,
    //       count: itemCount,
    //       level: 0
    //     };
    //     return group;
    //   })
    //   .filter(isGroup);
    return [rules, groups];
  }, [documents, types]);

  useEffect(() => {
    console.log([ruleItems, groups]);
  }, [ruleItems, groups]);

  return (
    <Surface background={SurfaceBackground.neutral}>
      <Page className="flex-grow">
        <Header commandBarItems={commandBarItems} title="Auto State" />

        <div className="page-content padding-16">
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
            onItemInvoked={item => console.log(item)}
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
        </div>
      </Page>
    </Surface>
  );
};
export default AdminPage;
