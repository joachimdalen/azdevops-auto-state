import { RestClientFactory, IVssRestClientOptions } from 'azure-devops-extension-api';
import { CoreRestClient } from './Core';
import { WorkItemTrackingRestClient } from './WorkItemTracking';
import { WorkItemTrackingProcessRestClient } from './WorkItemTrackingProcess';

export function getClient(clientClass: any) {
  switch (new clientClass().TYPE) {
    case 'WorkItemTrackingRestClient':
      return new WorkItemTrackingRestClient({}) as any;
    case 'CoreRestClient':
      return new CoreRestClient({}) as any;
    case 'WorkItemTrackingProcessRestClient':
      return new WorkItemTrackingProcessRestClient({}) as any;
    default:
      throw new Error('Failed to get mock client');
  }
}
