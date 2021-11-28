import * as DevOps from 'azure-devops-extension-sdk';

import WorkItemListener from './WorkItemListener';

DevOps.init();
DevOps.ready().then(() => DevOps.register(DevOps.getContributionId(), new WorkItemListener()));
