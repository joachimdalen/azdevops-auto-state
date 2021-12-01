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

import LoadingSection from '../common/component/LoadingSection';
import WorkItemTypeTag from '../common/component/WorkItemTypeTag';
import AddRuleResult from '../common/models/AddRuleResult';
import Rule from '../common/models/Rule';
import RuleDocument from '../common/models/RuleDocument';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import {
  getCommandBarItems,
  getListColumns,
  groupBy,
  isGroup
} from './helpers';

const AdminPage = (): React.ReactElement => {
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [documents, setDocuments] = useState<RuleDocument[]>([]);
  const storageService = useMemo(() => new StorageService(), []);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      const service = new WorkItemService();
      const loadedTypes = await service.getWorkItemTypes();
      setTypes(loadedTypes);

      try {
        const documents = await storageService.getData();
        setDocuments(documents);
        webLogger.information(documents);
      } catch (error) {
        webLogger.information('Failed to get documents', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDialogResult = async (result: AddRuleResult | undefined) => {
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
      webLogger.information('Creating new document');
      const newDocument: RuleDocument = {
        id: result.rule.workItemType,
        rules: [{ ...result.rule, id: uuidV4() }]
      };
      const created = await storageService.setData(newDocument);
      setDocuments(prev => [...prev, created]);
    }
  };
  const commandBarItems: IHeaderCommandBarItem[] = useMemo(
    () => getCommandBarItems(handleDialogResult),
    [handleDialogResult]
  );
  const columns: IColumn[] = useMemo(() => getListColumns(types), [types]);

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
    return [rules, groups];
  }, [documents, types]);

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
