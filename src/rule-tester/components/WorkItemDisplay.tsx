import { WorkItem, WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Icon } from 'azure-devops-ui/Icon';
import cx from 'classnames';
import { useMemo } from 'react';

import { getState, getWorkItemTitle } from '../../common/workItemUtils';
import StateTag from '../../shared-ui/component/StateTag';

interface WorkItemTransition {
  from: string;
  to: string;
}
interface WorkItemDisplayProps {
  state: string;
  title: string;
  id: number;
  type: WorkItemType;
  transition?: WorkItemTransition;
}
const WorkItemDisplay = ({
  state,
  type,
  transition,
  id,
  title
}: WorkItemDisplayProps): React.ReactElement => {
  const selectedState = useMemo(() => {
    const wiState = type?.states.find(x => x.name === state);
    return wiState;
  }, [state, type]);

  const [fromState, toState] = useMemo(() => {
    const from = type?.states.find(x => x.name === transition?.from);
    const to = type?.states.find(x => x.name === transition?.to);

    return [from, to];
  }, [type]);

  const getTransition = () => (
    <div className="flex-row rhythm-horizontal-16">
      {fromState && <StateTag color={fromState.color} text={fromState.name || 'Unknown'} />}
      <Icon iconName={'DoubleChevronRight'} />
      {toState && <StateTag color={toState.color} text={toState.name || 'Unknown'} />}
    </div>
  );

  const getStateDisplay = () => {
    if (transition === undefined && selectedState)
      return <StateTag color={selectedState.color} text={selectedState.name || 'Unknown'} />;

    return getTransition();
  };

  return (
    <div className={cx('flex-row flex-grow flex-center margin-top-8 padding-8 container-border')}>
      <img src={type.icon.url} height={20} />
      <span className="margin-horizontal-16 flex-grow">
        <span className="font-weight-semibold margin-right-4"> {id}</span>
        {title || 'Unknown'}
      </span>
      {getStateDisplay()}
    </div>
  );
};

export default WorkItemDisplay;
