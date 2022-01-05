import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { ZeroData } from 'azure-devops-ui/ZeroData';

import ProcessedItem from '../../common/models/ProcessedItem';
import WorkItemDisplay from './WorkItemDisplay';

interface WorkItemResultSectionProps {
  types: WorkItemType[];
  items: ProcessedItem[];
}

const WorkItemResultSection = ({ types, items }: WorkItemResultSectionProps): JSX.Element => {
  return (
    <div className="flex-column">
      <h2>Result</h2>
      <ConditionalChildren renderChildren={items.length > 1}>
        <div className="flex-column">
          {items.map(x => {
            const type = types.find(y => y.name === x.type);
            return type ? (
              <WorkItemDisplay
                key={x.id}
                type={type}
                id={x.id}
                title={x.title}
                state={x.updatedState}
                transition={{ from: x.sourceState, to: x.updatedState }}
              />
            ) : null;
          })}
        </div>
      </ConditionalChildren>
      <ConditionalChildren renderChildren={items.length === 1}>
        <ZeroData
          iconProps={{ iconName: 'WorkItem' }}
          imageAltText=""
          primaryText="No work items will be changed"
        />
      </ConditionalChildren>
    </div>
  );
};

export default WorkItemResultSection;
