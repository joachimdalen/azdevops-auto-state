import { RestClientFactory, IVssRestClientOptions } from 'azure-devops-extension-api';
import { CoreRestClient } from 'azure-devops-extension-api/Core';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { WorkItemTrackingProcessRestClient } from 'azure-devops-extension-api/WorkItemTrackingProcess';
import { CoreClient } from './Core';
import { WitRestClient } from './Wit';
import { WorkItemTrackingProcessClient } from './WorkItemTrackingProcess';

export const getClient = <T>(clientClass: any): T => {
  if (typeof clientClass === typeof WorkItemTrackingRestClient) {
    return new WitRestClient({}) as any;
  }
  if (typeof clientClass === typeof CoreRestClient) {
    return new CoreClient({}) as any;
  }
  if (typeof clientClass === typeof WorkItemTrackingProcessRestClient) {
    return new WorkItemTrackingProcessClient({}) as any;
  }

  throw new Error('Failed to get mock client');
  return {} as any;
};
