import WorkItemRules from './WorkItemRules';

export default interface ProjectConfigurationDocument {
  __etag?: string;
  id: string; // Project id
  workItemRules: WorkItemRules[];
}
