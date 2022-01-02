import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import cx from 'classnames';
import { useMemo } from 'react';

import { getState, getWorkItemTitle } from '../../common/workItemUtils';
import StateTag from '../../shared-ui/component/StateTag';

interface WorkItemDisplayProps {
  workItem: WorkItem;
  type: WorkItemType;
}
const WorkItemDisplay = ({ workItem, type }: WorkItemDisplayProps): React.ReactElement => {
  const selectedState = useMemo(() => {
    const state = type?.states.find(x => x.name === getState(workItem));
    return state;
  }, [workItem, type]);

  return (
    <div className={cx('flex-row flex-grow flex-center margin-top-8 padding-8 container-border')}>
      <img src={type.icon.url} height={20} />
      <span className="margin-horizontal-16 flex-grow">
        <span className="font-weight-semibold margin-right-4"> {workItem.id}</span>
        {getWorkItemTitle(workItem) || 'Unknown'}
      </span>
      {selectedState && (
        <StateTag color={selectedState.color} text={selectedState.name || 'Unknown'} />
      )}
    </div>
  );
};

export default WorkItemDisplay;
