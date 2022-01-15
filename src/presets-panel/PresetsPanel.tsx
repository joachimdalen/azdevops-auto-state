import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Toggle } from 'azure-devops-ui/Toggle';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { useEffect, useMemo, useState } from 'react';

import { WorkItemReferenceNames } from '../common/constants';
import Rule from '../common/models/Rule';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import VersionDisplay from '../shared-ui/component/VersionDisplay';

interface PresetRule {
  id: string;
  name: string;
  description: string;
  rule: Rule;
}

const presets: PresetRule[] = [
  {
    id: 'task-active',
    name: 'Task activated',
    description: 'Rule that triggers when a task is activated and the User Story is not active',
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.UserStory,
      transitionState: 'Active',
      parentExcludedStates: ['Active', 'Resolved', 'Closed'],
      parentTargetState: 'Active',
      processParent: true,
      disabled: false,
      childrenLookup: false
    }
  },
  {
    id: 'task-closed',
    name: 'Task closed',
    description:
      'Rule that triggers when a task is closed and the User Story is not resolved or closed',
    rule: {
      workItemType: WorkItemReferenceNames.Task,
      parentType: WorkItemReferenceNames.UserStory,
      transitionState: 'Closed',
      parentExcludedStates: ['Resolved', 'Closed'],
      parentTargetState: 'Closed',
      processParent: true,
      disabled: false,
      childrenLookup: true
    }
  },
  {
    id: 'user-story-active',
    name: 'User Story activated',
    description: 'Rule that triggers when a user story is activated and the feature is not active',
    rule: {
      workItemType: WorkItemReferenceNames.UserStory,
      parentType: WorkItemReferenceNames.Feature,
      transitionState: 'Active',
      parentExcludedStates: ['Active', 'Resolved', 'Closed'],
      parentTargetState: 'Active',
      processParent: true,
      disabled: false,
      childrenLookup: false
    }
  }
];

const PresetsPanel = (): JSX.Element => {
  const [workItemService] = useMemo(() => [new WorkItemService()], []);
  useEffect(() => {
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule presets panel...');
    });
    DevOps.ready().then(() => {
      DevOps.notifyLoadSucceeded().then(() => {
        DevOps.resize();
      });
    });
  }, []);

  const [selected, setSelected] = useState<string[]>([]);

  const addOrRemove = (id: string) => {
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(x => x !== id));
    } else {
      setSelected(prev => [...prev, id]);
    }
  };
  return (
    <div className="flex-column flex-grow">
      <div className="flex-grow">
        <div className="rhythm-vertical-16 flex-grow settings-list">
          {presets.map(preset => (
            <div className="rule-preset flex-grow flex-row">
              <Checkbox
                checked={selected.includes(preset.id)}
                onChange={(e, c) => addOrRemove(preset.id)}
              />
              <div className="flex-column flex-grow margin-left-16">
                <div className="flex-row flex-center">
                  <div className="flex-grow title-xs">{preset.name}</div>
                </div>
                <div className="margin-top-8">{preset.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ButtonGroup className="justify-space-between flex-center margin-bottom-16">
        <Button text="Close" />
        <VersionDisplay
          showExtensionVersion={false}
          moduleVersion={process.env.PRESETS_PANEL_VERSION}
        />
        <Button text="Save" primary iconProps={{ iconName: 'Save' }} />
      </ButtonGroup>
    </div>
  );
};

export default PresetsPanel;
