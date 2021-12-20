import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
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
  const [parentNotState, setParentNotState] = useState<string[]>([]);
  const [parentTargetState, setParentTargetState] = useState('');
  const [childState, setChildState] = useState('');
  const [allChildren, setAllChildren] = useState(false);
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
            setChildState(rle.childState);
            setParentNotState(rle.parentNotState);
            setParentTargetState(rle.parentTargetState);
            setAllChildren(rle.allChildren);
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

  const workItemTypes: IListBoxItem[] = useMemo(() => getWorkItemTypeItems(types), [types]);

  const workItemStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, workItemType),
    [workItemType]
  );
  const parentStates: IListBoxItem[] = useMemo(
    () => getStatesForWorkItemType(types, parentType),
    [types, parentType]
  );
  const workItemTypeSelection = useDropdownSelection(workItemTypes, rule?.workItemType);
  const parentTypeSelection = useDropdownSelection(workItemTypes, rule?.parentType);
  const workItemStateSelection = useDropdownSelection(workItemStates, rule?.childState);
  const parentStateSelection = useDropdownMultiSelection(parentStates, rule?.parentNotState);
  const parentTargetStateSelection = useDropdownSelection(parentStates, rule?.parentTargetState);

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
    console.log(config);
    if (config.dialog) {
      const ac: Rule = {
        id: rule?.id,
        workItemType: workItemType,
        parentType: parentType,
        childState: childState,
        parentNotState: parentNotState,
        parentTargetState: parentTargetState,
        allChildren: allChildren
      };

      const res: AddRuleResult = {
        workItemType: workItemType,
        result: 'SAVE',
        rule: ac
      };

      const validationResult: ActionResult<boolean> = await config.validate(res);
      if (validationResult.success) {
        setError(undefined);
      } else {
        setError(validationResult);
      }
    }
  };

  const addOrRemove = (id: string) => {
    if (parentNotState.includes(id)) {
      setParentNotState(prev => prev.filter(x => x !== id));
    } else {
      setParentNotState(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex-grow">
      <LoadingSection isLoading={loading} text="Loading..." />
      <ConditionalChildren renderChildren={!loading}>
        <ConditionalChildren renderChildren={error !== undefined}>
          <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Warning}>
            {error?.message}
          </MessageCard>
        </ConditionalChildren>
        <div className="rhythm-vertical-16 flex-grow">
          <FormItem label="When work item type is">
            <Dropdown
              placeholder="Select a work item type"
              items={workItemTypes}
              selection={workItemTypeSelection}
              onSelect={(_, i) => setWorkItemType(i.id)}
              renderItem={renderWorkItemCell}
            />
          </FormItem>
          <FormItem label="And parent type is">
            <Dropdown
              placeholder="Select a work item type"
              items={workItemTypes}
              selection={parentTypeSelection}
              onSelect={(_, i) => setParentType(i.id)}
              renderItem={renderWorkItemCell}
            />
          </FormItem>
          <FormItem label="When child state is">
            <Dropdown
              disabled={workItemStates?.length === 0}
              placeholder="Select a state"
              items={workItemStates}
              selection={workItemStateSelection}
              onSelect={(_, i) => setChildState(i.id)}
              renderItem={renderStateCell}
            />
          </FormItem>
          <FormItem label="And parent states is not">
            <Dropdown
              disabled={parentStates?.length === 0}
              placeholder="Select states"
              items={parentStates}
              selection={parentStateSelection}
              onSelect={(_, i) => addOrRemove(i.id)}
              renderItem={renderStateCell}
            />
          </FormItem>
          <FormItem label="Set parent state to">
            <Dropdown
              disabled={parentStates?.length === 0}
              placeholder="Select a state"
              items={parentStates}
              selection={parentTargetStateSelection}
              onSelect={(_, i) => setParentTargetState(i.id)}
              renderItem={renderStateCell}
            />
          </FormItem>
          <Checkbox
            label="Only if all children is state"
            checked={allChildren}
            onChange={(_, c) => setAllChildren(c)}
          />
        </div>
        <ButtonGroup className="justify-space-between margin-top-16">
          <Button text="Close" onClick={() => dismiss()} />
          <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={save} />
        </ButtonGroup>
      </ConditionalChildren>
    </div>
  );
};
showRootComponent(<ModalContent />, 'modal-container');
