import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { useState } from 'react';

interface NewGroupProps {
  onAddGroup: (name: string) => void;
}

const NewGroup = ({ onAddGroup }: NewGroupProps): JSX.Element => {
  const [showDetails, setShowDetails] = useState(false);
  const [name, setName] = useState('');

  return (
    <div className="flex-row rhythm-horizontal-8 flex-center flex-grow">
      <ConditionalChildren renderChildren={showDetails} inverse>
        <Button
          text="Add new group"
          primary
          iconProps={{ iconName: 'Add' }}
          onClick={() => setShowDetails(true)}
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={showDetails}>
        <FormItem message="The group name should be unique for this rule">
          <TextField
            containerClassName="flex-grow"
            placeholder="Enter a group name..."
            value={name}
            onChange={(e, v) => setName(v)}
          />
        </FormItem>
        <Button
          text="Cancel"
          danger
          iconProps={{ iconName: 'Cancel' }}
          onClick={() => setShowDetails(false)}
        />
        <Button
          text="Add"
          primary
          iconProps={{ iconName: 'Add' }}
          onClick={() => {
            onAddGroup(name);
            setName('');
            setShowDetails(false);
          }}
        />
      </ConditionalChildren>
    </div>
  );
};

export default NewGroup;
