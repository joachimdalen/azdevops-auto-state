import { Status, Statuses, StatusSize } from 'azure-devops-ui/Status';
import { Toggle } from 'azure-devops-ui/Toggle';

import { PresetRule } from '../constants';

interface RulePresetProps extends Omit<PresetRule, 'rule' | 'processes'> {
  checked: boolean;
  description: string;
  canCreate: boolean;
  onSelected: (id: string, selected: boolean) => void;
}
const RulePreset = ({
  checked,
  id,
  canCreate,
  name,
  description,
  onSelected
}: RulePresetProps): JSX.Element => {
  return (
    <div className="rule-preset flex-center flex-grow flex-row">
      <div className="rule-preset-action flex-row flex-center justify-center">
        {canCreate ? (
          <Toggle checked={checked} onChange={(e, c) => onSelected(id, c)} />
        ) : (
          <Status {...Statuses.Success} key="success" size={StatusSize.l} />
        )}
      </div>
      <div className="flex-column flex-grow margin-left-16">
        <div className="flex-row flex-center">
          <div className="flex-grow title-xs">{name}</div>
        </div>
        <div className="margin-top-8">{description}</div>
      </div>
    </div>
  );
};

export default RulePreset;
