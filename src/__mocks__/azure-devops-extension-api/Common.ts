import { RestClientFactory, IVssRestClientOptions } from 'azure-devops-extension-api';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { WitRestClient } from './Wit';

export const getClient = <T>(
  clientClass: RestClientFactory<T>,
  clientOptions?: IVssRestClientOptions
): T => {
  if (typeof clientClass === typeof WorkItemTrackingRestClient) {
    return new WitRestClient({}) as any;
  }

  return {} as any;
};
