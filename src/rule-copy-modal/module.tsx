import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

import webLogger from '../common/webLogger';
import { appTheme } from '../shared-ui/azure-devops-theme';
import showRootComponent from '../shared-ui/showRootComponent';

initializeIcons();
const ModalContent = (): React.ReactElement => {
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule modal...');
    });
    DevOps.ready().then(() => {
      DevOps.notifyLoadSucceeded().then(() => {
        DevOps.resize();
      });
    });
  }, []);

  return <div>Ok</div>;
};

showRootComponent(<ModalContent />, 'copy-modal-container');
