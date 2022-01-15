import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

import webLogger from '../common/webLogger';
const SettingsPanel = (): React.ReactElement => {
  useEffect(() => {
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule modal...');
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();
      DevOps.notifyLoadSucceeded().then(() => {
        DevOps.resize();
      });
    });
  }, []);

  return <div>Hello</div>;
};

export default SettingsPanel;
