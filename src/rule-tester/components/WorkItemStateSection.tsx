import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { FormItem } from 'azure-devops-ui/FormItem';
import { useState } from 'react';

import { getWorkItemType } from '../../common/workItemUtils';
import WorkItemStateDropdown from '../../shared-ui/component/WorkItemStateDropdown';

interface WorkItemStateSectionProps {
  types: WorkItemType[];
  workItem: WorkItem;
  onTest: (targetState: string) => void;
  disabled?: boolean;
}

const WorkItemStateSection = ({
  onTest,
  types,
  workItem,
  disabled
}: WorkItemStateSectionProps): JSX.Element => {
  const [targetState, setTargetState] = useState<string | undefined>();
  return (
    <div className="flex-row">
      <FormItem
        label="Transition state"
        message="The transitioned state for the rule to trigger on (When work item type changes to this)"
        className="flex-grow"
      >
        <WorkItemStateDropdown
          types={types}
          selected={targetState}
          workItemType={
            workItem !== undefined ? getWorkItemType(workItem, types) || 'unknown' : 'unknown'
          }
          placeholder="Select a state"
          onSelect={(_, i) => setTargetState(i.id)}
          disabled={disabled}
        />
      </FormItem>
      <div className="flex-row flex-center margin-left-8">
        <Button
          disabled={targetState === undefined || disabled}
          primary
          text="Test"
          iconProps={{ iconName: 'TestBeaker' }}
          onClick={() => targetState && onTest(targetState)}
        />
      </div>
    </div>
  );
};

export default WorkItemStateSection;
