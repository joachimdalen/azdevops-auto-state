import { IVssRestClientOptions } from 'azure-devops-extension-api';
import { ProjectProperty } from 'azure-devops-extension-api/Core';

export const mockGetProjectProperties = jest.fn().mockRejectedValue(new Error('Not implemented'));

export class CoreRestClient {
  public TYPE = 'CoreRestClient';
  constructor(options: IVssRestClientOptions) {}

  getProjectProperties(projectId: string, keys?: string[]): Promise<ProjectProperty[]> {
    return new Promise(resolve => resolve(mockGetProjectProperties(projectId, keys)));
  }
}
