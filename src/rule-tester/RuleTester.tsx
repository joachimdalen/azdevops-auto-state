import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import React, { useEffect, useMemo, useState } from 'react';

import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { getWorkItemType, getWorkItemTypeField } from '../common/workItemUtils';
import WorkItemStateDropdown from '../shared-ui/component/WorkItemStateDropdown';
import WorkItemDisplay from './components/WorkItemDisplay';
import WorkItemSearchSection from './components/WorkItemSearchSection';

const RuleTester = (): React.ReactElement => {
  const workItemService = useMemo(() => new WorkItemService(), []);
  useEffect(() => {
    async function LoadRuleTester() {
      await DevOps.init({
        loaded: false,
        applyTheme: true
      });
      webLogger.information('Loading rule tester...');

      await DevOps.ready();

      const config = DevOps.getConfiguration();
      const t = await workItemService.getWorkItemTypes();
      setTypes(t);
      console.log(config);
      await DevOps.notifyLoadSucceeded();
      DevOps.resize(600, 400);
    }

    LoadRuleTester();
  }, []);

  const [workItemId, setWorkItemId] = useState<number | undefined>();
  const [workItem, setWorkItem] = useState<WorkItem | undefined>();
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const type = useMemo(() => {
    if (workItem === undefined) return undefined;
    return types.find(x => x.name === getWorkItemTypeField(workItem));
  }, [workItem, types]);
  const [targetState, setTargetState] = useState<string | undefined>();
  return (
    <div className="flex-grow">
      <ConditionalChildren renderChildren={workItem === undefined}>
        <WorkItemSearchSection
          workItemId={workItemId}
          setWorkItem={setWorkItem}
          setWorkItemId={setWorkItemId}
        />
      </ConditionalChildren>

      <ConditionalChildren renderChildren={workItem !== undefined}>
        <div className="flex-row margin-bottom-16">
          {workItem && type && <WorkItemDisplay workItem={workItem} type={type} />}
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
              }}
            />
          </div>
        </div>

        <div className="flex-column">
          <div className="flex-row">
            <FormItem
              label="Transition state"
              message="The transitioned state for the rule to trigger on (When work item type changes to this)"
              className="flex-grow"
            >
              <WorkItemStateDropdown
                types={types}
                selected={targetState}
                workItemType={
                  workItem !== undefined ? getWorkItemType(workItem, types) || 'unknown' : 'unknown'
                }
                placeholder="Select a state"
                onSelect={(_, i) => {
                  setTargetState(i.id);
                  console.log(i);
                }}
              />
            </FormItem>
            <div className="flex-row flex-center margin-left-8">
              <Button
                disabled={targetState === undefined}
                primary
                text="Test"
                iconProps={{ iconName: 'TestBeaker' }}
              />
            </div>
          </div>
        </div>
      </ConditionalChildren>
    </div>
  );
};
export default RuleTester;
