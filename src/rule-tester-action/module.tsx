import * as DevOps from 'azure-devops-extension-sdk';

import menuProvider from './menu-provider';

DevOps.init();
DevOps.ready().then(() => DevOps.register('rule-tester-action', menuProvider));
