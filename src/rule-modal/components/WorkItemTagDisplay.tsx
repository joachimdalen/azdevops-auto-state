import { Pill } from 'azure-devops-ui/Pill';
import { PillGroup, PillGroupOverflow } from 'azure-devops-ui/PillGroup';
import { useMemo } from 'react';

import { getTagsAsList } from '../../common/workItemUtils';

interface WorkItemTagDisplayProps {
  tags?: string;
}

const WorkItemTagDisplay = ({ tags }: WorkItemTagDisplayProps) => {
  const tagPills = useMemo(() => {
    if (tags === undefined) return [];

    return getTagsAsList(tags).map(x => {
      return <Pill key={x}>{x}</Pill>;
    });
  }, [tags]);

  return <PillGroup overflow={PillGroupOverflow.wrap}>{tagPills}</PillGroup>;
};

export default WorkItemTagDisplay;
