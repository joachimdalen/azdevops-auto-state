import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { Toggle } from 'azure-devops-ui/Toggle';
import { ZeroData } from 'azure-devops-ui/ZeroData';
import { useEffect, useMemo, useState } from 'react';

import { ProcessNames, toProcessName } from '../common/constants';
import { ActionResult } from '../common/models/ActionResult';
import RuleDocument from '../common/models/WorkItemRules';
import RuleService from '../common/services/RuleService';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { getWorkTypeFromReferenceName } from '../common/workItemUtils';
import LoadingSection from '../shared-ui/component/LoadingSection';
import VersionDisplay from '../shared-ui/component/VersionDisplay';
import RulePreset from './components/RulePreset';
import { PresetRule, presets } from './constants';

const distinct = <T,>(value: T, index: number, self: T[]) => self.indexOf(value) === index;

const PresetsPanel = (): JSX.Element => {
  const [workItemService, ruleService] = useMemo(
    () => [new WorkItemService(), new RuleService()],
    []
  );
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [rules, setRules] = useState<RuleDocument[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [hideCreated, setHideCreated] = useState<boolean>(true);
  const [processName, setProcessName] = useState<ProcessNames>(ProcessNames.Unknwon);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        webLogger.information('Loading rule presets panel...');
        await DevOps.ready();

        const types = await workItemService.getWorkItemTypes();
        const processName = await workItemService.getProcessTemplateName();
        const loadResult = await ruleService.load();

        if (loadResult.success && loadResult.data) {
          setRules(loadResult.data);
        }

        setTypes(types);
        setProcessName(toProcessName(processName));
        setLoading(false);

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        webLogger.error('Failed to get project configuration', error);
      } finally {
        setLoading(false);
      }
    }

    initModule();
  }, []);

  const existingRules = useMemo(() => {
    if (!ruleService.isInitialized()) return {};

    return presets.reduce((obj: any, item: PresetRule) => {
      return {
        ...obj,
        [item.id]: ruleService.isValid(item.rule)?.success
      };
    }, {});
  }, [rules]);

  const groups = useMemo(() => {
    return presets
      .filter(x => x.processes.includes(processName))
      .map(x => x.rule.workItemType)
      .filter(distinct);
  }, [processName]);

  const groupHeaders = useMemo(() => {
    return groups.reduce((obj: { [key: string]: string }, item: string) => {
      const nameParts = item.split('.');
      const refName = nameParts.length >= 1 ? nameParts[nameParts.length - 1] : 'Unknown';
      const name = refName.replace(/([A-Z])/g, ' $1');

      return {
        ...obj,
        [item]: `${name} Rules`
      };
    }, {});
  }, [groups]);

  const workItemIcons = useMemo(() => {
    return groups.reduce((obj: any, item: string) => {
      const type = getWorkTypeFromReferenceName(item, types);

      return {
        ...obj,
        [item]: type?.icon?.url
      };
    }, {});
  }, [types, processName]);

  const addOrRemove = (id: string) => {
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(x => x !== id));
    } else {
      setSelected(prev => [...prev, id]);
    }
  };

  const dismiss = (added = false) => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      if (added) {
        const ar: ActionResult<any> = {
          success: true,
          message: 'ADDED'
        };
        config.panel.close(ar);
      } else {
        config.panel.close();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-row flex-grow flex-center justify-center">
        <LoadingSection isLoading={loading} text="Loading..." />
      </div>
    );
  }
  const createRules = async () => {
    const rules = presets.filter(x => selected.includes(x.id)).map(x => x.rule);
    for (const rle of rules) {
      await ruleService.updateRule(rle.workItemType, rle);
    }
  };

  return (
    <div className="flex-column flex-grow">
      <div className="flex-grow v-scroll-auto">
        <ConditionalChildren renderChildren={groups.length === 0}>
          <ZeroData
            imageAltText=""
            primaryText="No preset rules found for the current process"
            iconProps={{ iconName: 'Work' }}
          />
        </ConditionalChildren>
        <ConditionalChildren renderChildren={groups.length > 0}>
          <div className="margin-bottom-8">
            <FormItem label="Hide already created rules">
              <Toggle
                onText="Hidden"
                offText="Visible"
                checked={hideCreated}
                onChange={(e, c) => setHideCreated(c)}
              />
            </FormItem>
          </div>
          {groups.map(groupName => {
            const items = presets
              .filter(x =>
                hideCreated
                  ? existingRules[x.id] !== undefined && existingRules[x.id] === true
                  : true
              )
              .filter(x => x.processes.includes(processName))
              .filter(x => x.rule.workItemType === groupName);

            if (items.length === 0) return null;

            return (
              <div key={groupName}>
                <div className="flex-row flex-center">
                  {workItemIcons[groupName] && (
                    <img className="margin-right-8" src={workItemIcons[groupName]} height={20} />
                  )}
                  <h3>{groupHeaders[groupName]}</h3>
                </div>

                <div className="rhythm-vertical-16 flex-grow settings-list">
                  {items.map(preset => (
                    <RulePreset
                      key={preset.id}
                      {...preset}
                      checked={selected.includes(preset.id)}
                      onSelected={(id, selected) => addOrRemove(id)}
                      canCreate={existingRules[preset.id] && existingRules[preset.id] === true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </ConditionalChildren>
      </div>
      <ButtonGroup className="justify-space-between flex-center margin-bottom-16">
        <Button text="Close" onClick={() => dismiss()} />
        <VersionDisplay
          showExtensionVersion={false}
          moduleVersion={process.env.PRESETS_PANEL_VERSION}
        />
        <Button
          disabled={groups.length === 0 || selected.length === 0}
          text={selected.length > 0 ? `Create (${selected.length})` : 'Create'}
          primary
          onClick={async () => {
            await createRules();
            dismiss(true);
          }}
          iconProps={{ iconName: 'Save' }}
        />
      </ButtonGroup>
    </div>
  );
};

export default PresetsPanel;
