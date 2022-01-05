import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';
import React, { useEffect, useMemo, useState } from 'react';

import ProcessedItem from '../common/models/ProcessedItem';
import RuleProcessor from '../common/services/RuleProcessor';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { getState, getWorkItemTitle, getWorkItemTypeField } from '../common/workItemUtils';
import WorkItemDisplay from './components/WorkItemDisplay';
import WorkItemResultSection from './components/WorkItemResultSection';
import WorkItemSearchSection from './components/WorkItemSearchSection';
import WorkItemStateSection from './components/WorkItemStateSection';

const RuleTester = (): React.ReactElement => {
  const [workItemService, ruleProcessor] = useMemo(
    () => [new WorkItemService(), new RuleProcessor()],
    []
  );
  useEffect(() => {
    async function LoadRuleTester() {
      await DevOps.init({
        loaded: false,
        applyTheme: true
      });
      webLogger.information('Loading rule tester...');

      await ruleProcessor.init();

      await DevOps.ready();

      const config = DevOps.getConfiguration();

      if (config.workItemId) {
        const wi = await workItemService.getWorkItem(config.workItemId);
        setWorkItem(wi);
        setWorkItemId(wi.id);
        setClearable(false);
      }

      const t = await workItemService.getWorkItemTypes();
      setTypes(t);
      await DevOps.notifyLoadSucceeded();
      DevOps.resize(600, 400);
    }

    LoadRuleTester();
  }, []);

  const [workItemId, setWorkItemId] = useState<number | undefined>();
  const [workItem, setWorkItem] = useState<WorkItem | undefined>();
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const type = useMemo(() => {
    if (workItem === undefined) return undefined;
    return types.find(x => x.name === getWorkItemTypeField(workItem));
  }, [workItem, types]);
  const [isTesting, setIsTesting] = useState(false);
  const [clearable, setClearable] = useState(true);
  const [error, setError] = useState<any>(undefined);
  return (
    <div className="flex-grow">
      <ConditionalChildren renderChildren={error !== undefined}>
        <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Error}>
          <div className="flex-column flex-grow">
            <p className="margin-4">An error occurred while testing the work item:</p>
            <p className="margin-4">{error?.message || 'Unknown error'}</p>
          </div>
        </MessageCard>
      </ConditionalChildren>
      <ConditionalChildren renderChildren={workItem === undefined}>
        <WorkItemSearchSection
          workItemId={workItemId}
          setWorkItem={setWorkItem}
          setWorkItemId={setWorkItemId}
        />
      </ConditionalChildren>

      <ConditionalChildren renderChildren={workItem !== undefined}>
        <div className="flex-row margin-bottom-16">
          {workItem && type && (
            <WorkItemDisplay
              id={workItem.id}
              state={getState(workItem)}
              title={getWorkItemTitle(workItem)}
              type={type}
            />
          )}

          {clearable && (
            <div className="flex-row flex-center margin-left-8">
              <Button
                disabled={workItemId === undefined}
                danger
                text="Clear"
                iconProps={{
                  iconName: 'Clear'
                }}
                onClick={() => {
                  setWorkItem(undefined);
                  setWorkItemId(undefined);
                  setProcessedItems([]);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex-column">
          {workItem && (
            <WorkItemStateSection
              types={types}
              workItem={workItem}
              disabled={isTesting}
              onTest={async (targetState: string) => {
                try {
                  if (workItemId) {
                    setIsTesting(true);
                    const result = await ruleProcessor.process(workItemId, true, targetState);
                    setProcessedItems(result);
                    setIsTesting(false);
                  }
                } catch (error) {
                  setError(error);
                  setIsTesting(false);
                  setProcessedItems([]);
                }
              }}
            />
          )}
        </div>
      </ConditionalChildren>

      <ConditionalChildren renderChildren={isTesting}>
        <Spinner
          className="margin-top-16"
          size={SpinnerSize.large}
          label="Testing rules.. This might take a few seconds. Please wait"
        />
      </ConditionalChildren>
      <ConditionalChildren
        renderChildren={processedItems !== undefined && processedItems.length > 0}
      >
        <WorkItemResultSection types={types} items={processedItems} />
      </ConditionalChildren>
    </div>
  );
};
export default RuleTester;
