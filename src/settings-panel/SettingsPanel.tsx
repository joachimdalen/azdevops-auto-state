import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Toggle } from 'azure-devops-ui/Toggle';
import { useEffect, useMemo, useState } from 'react';

import SettingDocument from '../common/models/SettingDocument';
import { StorageService } from '../common/services/StorageService';
import webLogger from '../common/webLogger';
import VersionDisplay from '../shared-ui/component/VersionDisplay';
import SettingContainer from './components/SettingContainer';
const SettingsPanel = (): React.ReactElement => {
  const [error, setError] = useState<any | undefined>(undefined);
  const [settings, setSettings] = useState<SettingDocument>();
  const [storageService] = useMemo(() => [new StorageService()], []);
  const [loading, setLoading] = useState(true);
  const [useScopedWorkItemTypes, setUseScopedWorkItemTypes] = useState(false);

  useEffect(() => {
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule modal...');
    });
    DevOps.ready().then(() => {
      storageService
        .getSettings()
        .then(retSettings => {
          setSettings(retSettings);
          console.log(retSettings);
          setUseScopedWorkItemTypes(retSettings.useScopedWorkItemTypes);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
        });

      DevOps.notifyLoadSucceeded().then(() => {
        DevOps.resize();
      });
    });
  }, []);

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      config.panel.close();
    }
  };

  const save = async () => {
    if (settings) {
      const settingDocument: SettingDocument = {
        ...settings,
        useScopedWorkItemTypes: useScopedWorkItemTypes
      };
      await storageService.setSettings(settingDocument);
    }

    dismiss();
  };

  return (
    <div className="flex-column flex-grow">
      <div className="flex-grow">
        <ConditionalChildren renderChildren={error !== undefined}>
          <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Warning}>
            {error?.message || 'Unknown error'}
          </MessageCard>
        </ConditionalChildren>
        <div className="rhythm-vertical-16 flex-grow settings-list">
          <SettingContainer
            icon="Work"
            title="Use scoped work item types"
            description="Only use work item types defined in this projects process"
          >
            <Toggle
              offText={'Off'}
              onText={'On'}
              checked={useScopedWorkItemTypes}
              onChange={(_, c) => setUseScopedWorkItemTypes(c)}
            />
          </SettingContainer>
        </div>
      </div>
      <ButtonGroup className="justify-space-between flex-center margin-bottom-16">
        <Button text="Close" onClick={() => dismiss()} />
        <VersionDisplay
          showExtensionVersion={false}
          moduleVersion={process.env.SETTINGS_PANEL_VERSION}
        />
        <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={save} />
      </ButtonGroup>
    </div>
  );
};

export default SettingsPanel;
