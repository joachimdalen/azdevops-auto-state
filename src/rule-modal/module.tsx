import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Toggle } from 'azure-devops-ui/Toggle';
import { useEffect, useMemo, useState } from 'react';

import { ActionResult } from '../common/models/ActionResult';
import AddRuleResult from '../common/models/AddRuleResult';
import Rule from '../common/models/Rule';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { appTheme } from '../shared-ui/azure-devops-theme';
import LoadingSection from '../shared-ui/component/LoadingSection';
import VersionDisplay from '../shared-ui/component/VersionDisplay';
import WorkItemStateDropdown from '../shared-ui/component/WorkItemStateDropdown';
import WorkItemTypeDropdown from '../shared-ui/component/WorkItemTypeDropdown';
import showRootComponent from '../shared-ui/showRootComponent';

const ModalContent = (): React.ReactElement => {
  const [error, setError] = useState<ActionResult<any> | undefined>(undefined);
  const [storageService, workItemService] = useMemo(
    () => [new StorageService(), new WorkItemService()],
    []
  );
  const [rule, setRule] = useState<Rule>();
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [workItemType, setWorkItemType] = useState('');
  const [parentType, setParentType] = useState('');
  const [parentExcludedStates, setParentExcludedStates] = useState<string[]>([]);
  const [parentTargetState, setParentTargetState] = useState('');
  const [transitionState, setTransitionState] = useState('');
  const [childrenLookup, setChildrenLookup] = useState(false);
  const [processParent, setProcessParent] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const isDisabled = !enabled && rule !== undefined;

  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule modal...');
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();

      storageService.getSettings().then(settings => {
        workItemService.getWorkItemTypes(settings.useScopedWorkItemTypes).then(x => {
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
            setEnabled(!rle.disabled || true);
            setLoading(false);
          }
          setLoading(false);
        });
      });

      DevOps.notifyLoadSucceeded().then(() => {
        DevOps.resize();
      });
    });
  }, []);

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const res: AddRuleResult = {
        result: 'CANCEL'
      };
      config.panel.close(res);
    }
  };
  const save = async () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const ac: Rule = {
        id: rule?.id,
        workItemType: workItemType,
        parentType: parentType,
        transitionState: transitionState,
        parentExcludedStates: parentExcludedStates,
        parentTargetState: parentTargetState,
        childrenLookup: childrenLookup,
        processParent: processParent,
        disabled: !enabled
      };

      const res: AddRuleResult = {
        workItemType: workItemType,
        result: 'SAVE',
        rule: ac
      };

      const validationResult: ActionResult<boolean> = await config.validate(res);
      if (validationResult.success) {
        setError(undefined);
        config.panel.close(res);
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

  if (loading) {
    return (
      <div className="flex-grow flex-center">
        <LoadingSection isLoading={loading} text="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex-column">
      <div className="flex-grow">
        <ConditionalChildren renderChildren={!loading}>
          <ConditionalChildren renderChildren={error !== undefined}>
            <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Warning}>
              {error?.message || 'Unknown error'}
            </MessageCard>
          </ConditionalChildren>
          <div className="rhythm-vertical-16 flex-grow">
            <FormItem label="Rule enabled">
              <Toggle
                checked={enabled}
                onChange={(_, c) => setEnabled(c)}
                offText={'Disabled'}
                onText={'Enabled'}
              />
            </FormItem>
            <FormItem
              className="flex-grow"
              label="Work item type"
              message="This is the work item type for this rule to trigger on"
            >
              <WorkItemTypeDropdown
                types={types}
                selected={workItemType}
                onSelect={(_, i) => setWorkItemType(i.id)}
                disabled={isDisabled}
              />
            </FormItem>
            <FormItem
              className="flex-grow"
              label="Parent type"
              message="This is the work item type of the parent relation. E.g the work item type that should be updated."
            >
              <WorkItemTypeDropdown
                types={types}
                selected={parentType}
                filter={[workItemType]}
                deps={[workItemType]}
                onSelect={(_, i) => setParentType(i.id)}
                disabled={isDisabled}
              />
            </FormItem>

            <FormItem
              label="Transition state"
              message="The transitioned state for the rule to trigger on (When work item type changes to this)"
            >
              <WorkItemStateDropdown
                types={types}
                workItemType={workItemType}
                selected={rule?.transitionState}
                onSelect={(_, i) => setTransitionState(i.id)}
                disabled={isDisabled}
              />
            </FormItem>
            <FormItem
              label="Parent not in state"
              message="Do not trigger the rule if the parent work item is in this state"
            >
              <WorkItemStateDropdown
                types={types}
                workItemType={parentType}
                selected={rule?.parentExcludedStates}
                onSelect={(_, i) => addOrRemove(i.id)}
                multiSelection
                deps={[parentType]}
                disabled={isDisabled}
              />
            </FormItem>
            <FormItem
              label="Parent target state"
              message="This is the state that the parent work item should transition to"
            >
              <WorkItemStateDropdown
                types={types}
                workItemType={parentType}
                selected={rule?.parentTargetState}
                onSelect={(_, i) => setParentTargetState(i.id)}
                filter={parentExcludedStates}
                include={true}
                deps={[parentType, parentExcludedStates]}
                disabled={isDisabled}
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
              <Toggle
                disabled={isDisabled}
                checked={childrenLookup}
                onChange={(_, c) => setChildrenLookup(c)}
                offText={'Off'}
                onText={'On'}
              />
            </FormItem>
            <FormItem
              label="Process parent"
              message="Process rules for parent when prosessing this rule"
            >
              <Toggle
                disabled={isDisabled}
                checked={processParent}
                onChange={(_, c) => setProcessParent(c)}
                offText={'Off'}
                onText={'On'}
              />
            </FormItem>
          </div>
        </ConditionalChildren>
      </div>
      <ButtonGroup className="justify-space-between flex-center margin-bottom-16">
        <Button text="Close" onClick={() => dismiss()} />
        <VersionDisplay
          showExtensionVersion={false}
          moduleVersion={process.env.RULE_MODAL_VERSION}
        />
        <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={save} />
      </ButtonGroup>
    </div>
  );
};
showRootComponent(<ModalContent />, 'modal-container');
