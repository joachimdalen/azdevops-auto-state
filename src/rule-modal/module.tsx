import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import {
  getCombined,
  hasError,
  parseValidationError
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { WorkItemField, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Link } from 'azure-devops-ui/Link';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Surface, SurfaceBackground } from 'azure-devops-ui/Surface';
import { Tab, TabBar, TabSize } from 'azure-devops-ui/Tabs';
import { Toggle } from 'azure-devops-ui/Toggle';
import { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';

import { ActionResult } from '../common/models/ActionResult';
import AddRuleResult from '../common/models/AddRuleResult';
import FilterItem from '../common/models/FilterItem';
import Rule from '../common/models/Rule';
import { StorageService } from '../common/services/StorageService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { appTheme } from '../shared-ui/azure-devops-theme';
import LoadingSection from '../shared-ui/component/LoadingSection';
import WorkItemStateDropdown from '../shared-ui/component/WorkItemStateDropdown';
import WorkItemTypeDropdown from '../shared-ui/component/WorkItemTypeDropdown';
import showRootComponent from '../shared-ui/showRootComponent';
import SettingRow from './components/settings-list/SettingRow';
import SettingRowDropdown from './components/settings-list/SettingRowDropdown';
import WorkItemFilter from './components/work-item-filter/WorkItemFilter';
import { validationSchema } from './types';
import WorkItemFilterNew from './components/work-item-filter/WorkItemFilterNew';

initializeIcons();
const ModalContent = (): React.ReactElement => {
  const [error, setError] = useState<ActionResult<any> | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<
    { [key: string]: string[] } | undefined
  >();
  const [storageService, workItemService] = useMemo(
    () => [new StorageService(), new WorkItemService()],
    []
  );
  const [rule, setRule] = useState<Rule>();
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [fields, setFields] = useState<WorkItemField[]>([]);
  const [workItemFilters, setWorkItemFilters] = useState<FilterItem[]>([]);
  const [parentFilters, setParentFilters] = useState<FilterItem[]>([]);
  const [workItemType, setWorkItemType] = useState('');
  const [parentType, setParentType] = useState('');
  const [parentExcludedStates, setParentExcludedStates] = useState<string[]>([]);
  const [parentTargetState, setParentTargetState] = useState('');
  const [transitionState, setTransitionState] = useState('');
  const [childrenLookup, setChildrenLookup] = useState(false);
  const [processParent, setProcessParent] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const [tabId, setTabId] = useState('filters');
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

      workItemService.getWorkItemFields().then(fields => setFields(fields));

      storageService
        .getSettings()
        .then(settings => {
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
              setWorkItemFilters(rle.filters || []);
              setParentFilters(rle.parentFilters || []);
              const disabled = rle.disabled === undefined ? false : rle.disabled;
              setEnabled(disabled === false);
              setLoading(false);
            }
            setLoading(false);
          });
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
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
    try {
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
          filters: workItemFilters.length > 0 ? workItemFilters : undefined,
          parentFilters: parentFilters.length > 0 ? parentFilters : undefined,
          disabled: !enabled
        };

        console.log(ac);
        await validationSchema.validate(ac, {
          abortEarly: false
        });

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
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const data = parseValidationError(error);
        setValidationErrors(data);
      } else {
        console.error(error);
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
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
      okButton={{
        text: 'Save',
        primary: true,
        onClick: () => save(),
        iconProps: { iconName: 'Save' }
      }}
      showExtensionVersion={false}
      moduleVersion={process.env.RULE_MODAL_VERSION}
    >
      <ConditionalChildren renderChildren={!loading}>
        <ConditionalChildren renderChildren={error !== undefined}>
          <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Warning}>
            {error?.message || 'Unknown error'}
          </MessageCard>
        </ConditionalChildren>

        <Surface background={SurfaceBackground.callout}>
          <TabBar
            tabSize={TabSize.Compact}
            onSelectedTabChanged={t => setTabId(t)}
            selectedTabId={tabId}
            className="margin-bottom-16"
          >
            <Tab id="details" name="Details" iconProps={{ iconName: 'Page' }} />
            <Tab id="options" name="Options" iconProps={{ iconName: 'Settings' }} />
            <Tab id="filters" name="Filters" iconProps={{ iconName: 'Filter' }} />
          </TabBar>
        </Surface>

        <ConditionalChildren renderChildren={tabId === 'details'}>
          <div className="rhythm-vertical-16 flex-grow">
            <FormItem
              label="Rule enabled"
              error={hasError(validationErrors, 'disabled')}
              message={getCombined(validationErrors, 'disabled', 'Enabled')}
            >
              <Toggle
                checked={enabled}
                onChange={(_, c) => setEnabled(c)}
                offText={'Disabled'}
                onText={'Enabled'}
              />
            </FormItem>
            <div className="flex-row rhythm-horizontal-16">
              <FormItem
                error={hasError(validationErrors, 'workItemType')}
                className="flex-one"
                label="Work item type"
                message={
                  hasError(validationErrors, 'workItemType')
                    ? getCombined(validationErrors, 'workItemType', 'Work item type')
                    : rule !== undefined
                    ? 'To change work item type you will need to create a new rule'
                    : 'This is the work item type for this rule to trigger on'
                }
              >
                <WorkItemTypeDropdown
                  types={types}
                  selected={workItemType}
                  onSelect={(_, i) => setWorkItemType(i.id)}
                  disabled={isDisabled || rule !== undefined}
                />
              </FormItem>
              <FormItem
                className="flex-one"
                label="Transition state"
                error={hasError(validationErrors, 'transitionState')}
                message={
                  hasError(validationErrors, 'transitionState')
                    ? getCombined(validationErrors, 'transitionState', 'Transition state')
                    : 'The transitioned state for the rule to trigger on (When work item type changes to this)'
                }
              >
                <WorkItemStateDropdown
                  types={types}
                  workItemType={workItemType}
                  selected={rule?.transitionState}
                  onSelect={(_, i) => setTransitionState(i.id)}
                  disabled={isDisabled}
                />
              </FormItem>
            </div>
            <div className="flex-row rhythm-horizontal-16">
              <FormItem
                className="flex-one"
                label="Parent type"
                error={hasError(validationErrors, 'parentType')}
                message={
                  hasError(validationErrors, 'parentType')
                    ? getCombined(validationErrors, 'parentType', 'Parent type')
                    : 'This is the work item type of the parent relation. E.g the work item type that should be updated.'
                }
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
                className="flex-one"
                label="Parent not in state"
                error={hasError(validationErrors, 'parentExcludedStates')}
                message={
                  hasError(validationErrors, 'parentExcludedStates')
                    ? getCombined(validationErrors, 'parentExcludedStates', 'Parent not in state')
                    : 'Do not trigger the rule if the parent work item is in this state'
                }
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
            </div>
            <FormItem
              label="Parent target state"
              error={hasError(validationErrors, 'parentTargetState')}
              message={
                hasError(validationErrors, 'parentTargetState')
                  ? getCombined(validationErrors, 'parentTargetState', 'Parent target state')
                  : 'This is the state that the parent work item should transition to'
              }
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
          </div>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={tabId === 'filters'}>
          <div className="flex-column rhythm-vertical-16">
            <WorkItemFilterNew
              disabled={workItemType === ''}
              workItemType={workItemType}
              parentType={parentType}
              types={types}
              filters={workItemFilters}
              onChange={(filters: FilterItem[]) => setWorkItemFilters(filters)}
            />
            {/* <FormItem
              label="Work Item Filters"
              message="Use work item filters to provide additional checks for the work item"
            >
              <WorkItemFilter
                disabled={workItemType === ''}
                fields={fields}
                workItemType={types.find(x => x.referenceName === workItemType)}
                filters={workItemFilters}
                onChange={(filters: FilterItem[]) => setWorkItemFilters(filters)}
              />
            </FormItem>
            <FormItem
              label="Parent Filters"
              message="Use parent filters to provide additional checks for the parent item"
            >
              <WorkItemFilter
                disabled={parentType === ''}
                fields={fields}
                workItemType={types.find(x => x.referenceName === parentType)}
                filters={parentFilters}
                onChange={(filters: FilterItem[]) => setParentFilters(filters)}
              />
            </FormItem> */}
          </div>
        </ConditionalChildren>
        <ConditionalChildren renderChildren={tabId === 'options'}>
          <div className="">
            <SettingRowDropdown
              settings={{
                title: 'Children lookup',
                description: (
                  <p>
                    Take child work items into consideration when processing the rule. See{' '}
                    <Link
                      target="_blank"
                      href="https://github.com/joachimdalen/azdevops-auto-state/blob/master/docs/RULES.md#children-lookup"
                    >
                      documentation
                    </Link>{' '}
                    for more information.
                  </p>
                ),
                checked: childrenLookup,
                toggleProps: {
                  disabled: isDisabled
                },
                options: [
                  {
                    id: 'selection',
                    selected: '1',
                    title: 'Match mode',
                    items: [{ id: '1', text: 'Abort' }]
                  }
                ]
              }}
              toggle={async (k, v) => {
                setChildrenLookup(v);
              }}
            />
            <SettingRow
              settings={{
                title: 'Process parent',
                description: 'Process rules for parent when prosessing this rule',
                checked: processParent,
                toggleProps: {
                  disabled: isDisabled
                }
              }}
              toggle={async (k, v) => {
                setProcessParent(v);
              }}
            />
          </div>
        </ConditionalChildren>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

showRootComponent(<ModalContent />, 'modal-container');
