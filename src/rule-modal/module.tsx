import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { Toggle } from 'azure-devops-ui/Toggle';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { useEffect, useMemo, useState } from 'react';

import { ActionResult } from '../common/models/ActionResult';
import AddRuleResult from '../common/models/AddRuleResult';
import Rule from '../common/models/Rule';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { appTheme } from '../shared-ui/azure-devops-theme';
import LoadingSection from '../shared-ui/component/LoadingSection';
import useDropdownMultiSelection from '../shared-ui/hooks/useDropdownMultiSelection';
import useDropdownSelection from '../shared-ui/hooks/useDropdownSelection';
import showRootComponent from '../shared-ui/showRootComponent';
import {
  getStatesForWorkItemType,
  getWorkItemTypeItems,
  renderStateCell,
  renderWorkItemCell
} from './helpers';

const ModalContent = (): React.ReactElement => {
  const [error, setError] = useState<ActionResult<any> | undefined>(undefined);
  const [rule, setRule] = useState<Rule>();
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [workItemType, setWorkItemType] = useState('');
  const [parentType, setParentType] = useState('');
  const [parentExcludedStates, setParentExcludedStates] = useState<string[]>([]);
  const [parentTargetState, setParentTargetState] = useState('');
  const [transitionState, setTransitionState] = useState('');
  const [childrenLookup, setChildrenLookup] = useState(false);
  const [processParent, setProcessParent] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule modal...');
    });
    DevOps.ready()
      .then(() => {
        const config = DevOps.getConfiguration();
        const service = new WorkItemService();
        service.getWorkItemTypes().then(x => {
          setTypes(x);
          if (config.rule) {
            const rle: Rule = config.rule;
            setRule(rle);
            setWorkItemType(rle.workItemType);
            setParentType(rle.parentType);
            setTransitionState(rle.transitionState);
            setParentExcludedStates(rle.parentExcludedStates);
            setParentTargetState(rle.parentTargetState);
            setChildrenLookup(rle.childrenLookup);
            setProcessParent(rle.processParent);
          }
        });
        DevOps.notifyLoadSucceeded().then(() => {
          DevOps.resize();
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const workItemTypes: IListBoxItem[] = useMemo(() => getWorkItemTypeItems(types, []), [types]);
  const parentTypes: IListBoxItem[] = useMemo(
    () => getWorkItemTypeItems(types, [workItemType]),
    [types, workItemType]
  );
  const workItemStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, workItemType, []),
    [workItemType]
  );
  const parentStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, parentType, []),
    [types, parentType]
  );
  const parentTargetStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, parentType, parentExcludedStates, true),
    [types, parentType, parentExcludedStates]
  );
  const workItemTypeSelection = useDropdownSelection(workItemTypes, rule?.workItemType);
  const parentTypeSelection = useDropdownSelection(parentTypes, rule?.parentType);
  const transitionStateSelection = useDropdownSelection(workItemStates, rule?.transitionState);
  const parentExcludedStatesSelection = useDropdownMultiSelection(
    parentStates,
    rule?.parentExcludedStates
  );
  const parentTargetStateSelection = useDropdownSelection(
    parentTargetStates,
    rule?.parentTargetState
  );

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const res: AddRuleResult = {
        result: 'CANCEL'
      };
      config.dialog.close(res);
    }
  };
  const save = async () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const ac: Rule = {
        id: rule?.id,
        workItemType: workItemType,
        parentType: parentType,
        transitionState: transitionState,
        parentExcludedStates: parentExcludedStates,
        parentTargetState: parentTargetState,
        childrenLookup: childrenLookup,
        processParent: processParent
      };

      const res: AddRuleResult = {
        workItemType: workItemType,
        result: 'SAVE',
        rule: ac
      };

      const validationResult: ActionResult<boolean> = await config.validate(res);
      if (validationResult.success) {
        setError(undefined);
        config.dialog.close(res);
      } else {
        setError(validationResult);
      }
    }
  };

  const addOrRemove = (id: string) => {
    if (parentExcludedStates.includes(id)) {
      setParentExcludedStates(prev => prev.filter(x => x !== id));
    } else {
      setParentExcludedStates(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex-column">
      <div className="flex-grow">
        <LoadingSection isLoading={loading} text="Loading..." />
        <ConditionalChildren renderChildren={!loading}>
          <ConditionalChildren renderChildren={error !== undefined}>
            <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Warning}>
              {error?.message || 'Unknown error'}
            </MessageCard>
          </ConditionalChildren>
          <div className="rhythm-vertical-16 flex-grow">
            <FormItem
              className="flex-grow"
              label="Work item type"
              message="This is the work item type for this rule to trigger on"
            >
              <Dropdown
                placeholder="Select a work item type"
                items={workItemTypes}
                selection={workItemTypeSelection}
                onSelect={(_, i) => setWorkItemType(i.id)}
                renderItem={renderWorkItemCell}
              />
            </FormItem>
            <FormItem
              className="flex-grow"
              label="Parent type"
              message="This is the work item type of the parent relation. E.g the work item type that should be updated."
            >
              <Dropdown
                placeholder="Select a work item type"
                items={parentTypes}
                selection={parentTypeSelection}
                onSelect={(_, i) => setParentType(i.id)}
                renderItem={renderWorkItemCell}
              />
            </FormItem>

            <FormItem
              label="Transition state"
              message="The transitioned state for the rule to trigger on (When work item type changes to this)"
            >
              <Dropdown
                disabled={workItemStates?.length === 0}
                placeholder="Select a state"
                items={workItemStates}
                selection={transitionStateSelection}
                onSelect={(_, i) => setTransitionState(i.id)}
                renderItem={renderStateCell}
              />
            </FormItem>
            <FormItem
              label="Parent not in state"
              message="Do not trigger the rule if the parent work item is in this state"
            >
              <Dropdown
                disabled={parentStates?.length === 0}
                placeholder="Select states"
                items={parentStates}
                selection={parentExcludedStatesSelection}
                onSelect={(_, i) => addOrRemove(i.id)}
                renderItem={renderStateCell}
              />
            </FormItem>
            <FormItem
              label="Parent target state"
              message="This is the state that the parent work item should transition to"
            >
              <Dropdown
                disabled={parentTargetStates?.length === 0}
                placeholder="Select a state"
                items={parentTargetStates}
                selection={parentTargetStateSelection}
                onSelect={(_, i) => setParentTargetState(i.id)}
                renderItem={renderStateCell}
              />
            </FormItem>
            <FormItem
              label="Children lookup"
              message={
                <p>
                  Take child work items into consideration when processing the rule. See{' '}
                  <a href="https://github.com/joachimdalen/azdevops-auto-state/blob/master/docs/RULES.md#children-lookup">
                    Children lookup
                  </a>{' '}
                  for more information.
                </p>
              }
            >
              <Toggle checked={childrenLookup} onChange={(_, c) => setChildrenLookup(c)} />
            </FormItem>
            <FormItem
              label="Process parent"
              message="Process rules for parent when prosessing this rule"
            >
              <Toggle checked={processParent} onChange={(_, c) => setProcessParent(c)} />
            </FormItem>
          </div>
        </ConditionalChildren>
      </div>
      <ButtonGroup className="justify-space-between margin-bottom-16">
        <Button text="Close" onClick={() => dismiss()} />
        <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={save} />
      </ButtonGroup>
    </div>
  );
};
showRootComponent(<ModalContent />, 'modal-container');
