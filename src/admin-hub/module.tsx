import './index.scss';

import { createTheme, initializeIcons, loadTheme } from '@fluentui/react';
import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

import { appTheme } from '../common/azure-devops-theme';
import { showRootComponent } from '../common/helpers';
import AdminPage from './AdminPage';

initializeIcons();

const AdminHub = () => {
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      console.log('Loaded admin hub...');
    });
  }, []);

  return <AdminPage />;
};
showRootComponent(<AdminHub />, 'admin-hub-container');
