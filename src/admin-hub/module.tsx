import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

import webLogger from '../common/webLogger';
import { appTheme } from '../shared-ui/azure-devops-theme';
import showRootComponent from '../shared-ui/showRootComponent';
import AdminPage from './AdminPage';

initializeIcons();

const AdminHub = () => {
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      webLogger.information('Loading admin hub...');
    });
  }, []);

  return <AdminPage />;
};
showRootComponent(<AdminHub />, 'admin-hub-container');
