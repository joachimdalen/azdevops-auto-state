import { ActionResult } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { LoadingSection } from '@joachimdalen/azdevops-ext-core/LoadingSection';
import { useBooleanToggle } from '@joachimdalen/azdevops-ext-core/useBooleanToggle';
import { WebLogger } from '@joachimdalen/azdevops-ext-core/WebLogger';
import * as DevOps from 'azure-devops-extension-sdk';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { MessageBar } from 'azure-devops-ui/MessageBar';
import { PanelFooter } from 'azure-devops-ui/Panel';
import { useEffect, useState } from 'react';

import { IConfirmationConfig } from '../common/common';

const ConfirmationDialog = (): JSX.Element => {
  const [loading, toggleLoading] = useBooleanToggle();
  const [config, setConfig] = useState<IConfirmationConfig | undefined>();
  const [doNotShowAgain, toggleDsa] = useBooleanToggle();
  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        await DevOps.ready();

        const mConfig = DevOps.getConfiguration();
        setConfig(mConfig as IConfirmationConfig);

        toggleLoading();

        await DevOps.notifyLoadSucceeded();
        DevOps.resize();
      } catch (error) {
        WebLogger.error('Failed to load confirmation dialog', error);
      } finally {
        toggleLoading();
        DevOps.resize();
      }
    }

    initModule();
  }, []);

  if (loading) {
    return <LoadingSection isLoading={loading} text="Loading..." />;
  }
  if (config === undefined) return <div>Error</div>;

  const buttons = [
    {
      ...config.cancelButton,
      onClick: () => {
        const result: ActionResult<boolean> = {
          success: false
        };
        const config = DevOps.getConfiguration();
        config.dialog?.close(result);
      }
    },
    {
      ...config.confirmButton,
      onClick: () => {
        const result: ActionResult<boolean> = {
          success: true,
          message: doNotShowAgain ? 'DO_NOT_SHOW_AGAIN' : undefined
        };
        const config = DevOps.getConfiguration();
        config.dialog?.close(result);
      }
    }
  ];

  return (
    <div className="flex-column">
      {config.messageBar && config.messageBarContent && (
        <MessageBar {...config.messageBar}>{config.messageBarContent}</MessageBar>
      )}
      <div className="flex-column flex-grow">
        <div className="padding-4">
          {Array.isArray(config.content)
            ? config.content.map(ct => <p key={ct}>{ct}</p>)
            : config.content}
        </div>
        <ConditionalChildren renderChildren={config.doNotShowAgain === true}>
          <Checkbox
            className="margin-top-16"
            checked={doNotShowAgain}
            onChange={(e, c) => toggleDsa(c)}
            label="Do not show again"
          />
        </ConditionalChildren>
      </div>
      <PanelFooter buttonProps={buttons} />
    </div>
  );
};
export default ConfirmationDialog;
