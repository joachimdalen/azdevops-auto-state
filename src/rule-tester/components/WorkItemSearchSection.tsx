import { WorkItem } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { TextField } from 'azure-devops-ui/TextField';
import { useMemo, useState } from 'react';

import WorkItemService from '../../common/services/WorkItemService';

interface WorkItemSearchSectionProps {
  workItemId?: number;
  setWorkItemId: (workItemId?: number) => void;
  setWorkItem: (workItem?: WorkItem) => void;
}

const WorkItemSearchSection = ({
  workItemId,
  setWorkItemId,
  setWorkItem
}: WorkItemSearchSectionProps): JSX.Element => {
  const workItemService = useMemo(() => new WorkItemService(), []);
  const [error, setError] = useState<string | undefined>();
  return (
    <div className="flex-column">
      <ConditionalChildren renderChildren={error !== undefined}>
        <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Error}>
          {error}
        </MessageCard>
      </ConditionalChildren>
      <div className="flex-row">
        <FormItem className="flex-grow" label="Work item id">
          <TextField
            inputType="number"
            className="flex-grow"
            value={workItemId?.toString()}
            onChange={(e, v) => setWorkItemId(parseInt(v))}
            placeholder="Work item id"
          />
        </FormItem>
        <div className="flex-row flex-end margin-left-8">
          <Button
            disabled={workItemId === undefined}
            primary
            text="Load"
            iconProps={{
              iconName: 'Refresh'
            }}
            onClick={async () => {
              try {
                if (workItemId) {
                  const wi = await workItemService.getWorkItem(workItemId);
                  setWorkItem(wi);
                  setError(undefined);
                }
              } catch (error: any) {
                setError(error?.message || 'An error occurred');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkItemSearchSection;
