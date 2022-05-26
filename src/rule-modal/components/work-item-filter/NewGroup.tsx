import {
  getCombined,
  hasError,
  parseValidationError
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField } from 'azure-devops-ui/TextField';
import { useState } from 'react';
import * as yup from 'yup';
interface NewGroupProps {
  existingNames: string[];
  onAddGroup: (name: string) => void;
  disabled?: boolean;
}

const NewGroup = ({ onAddGroup, existingNames, disabled = false }: NewGroupProps): JSX.Element => {
  const [showDetails, setShowDetails] = useState(false);
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<
    { [key: string]: string[] } | undefined
  >();
  const add = async () => {
    try {
      await yup
        .object()
        .shape({
          name: yup
            .string()
            .trim()
            .required()
            .test('unique', '${path} already exists', (value, context) => {
              if (value === undefined) return false;
              return !existingNames.includes(value);
            })
        })
        .validate(
          { name },
          {
            abortEarly: false
          }
        );
      onAddGroup(name);
      setName('');
      setShowDetails(false);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const data = parseValidationError(error);
        setValidationErrors(data);
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex-row rhythm-horizontal-8 flex-start flex-grow">
      <ConditionalChildren renderChildren={showDetails} inverse>
        <Button
          disabled={disabled}
          text="Add new group"
          primary
          iconProps={{ iconName: 'Add' }}
          onClick={() => setShowDetails(true)}
        />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={showDetails}>
        <FormItem
          error={hasError(validationErrors, 'name')}
          message={
            hasError(validationErrors, 'name')
              ? getCombined(validationErrors, 'name', 'Group name')
              : 'The group name should be unique for this rule'
          }
        >
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
          onClick={() => {
            setShowDetails(false);
            setName('');
            setValidationErrors(undefined);
          }}
        />
        <Button text="Add" primary iconProps={{ iconName: 'Add' }} onClick={() => add()} />
      </ConditionalChildren>
    </div>
  );
};

export default NewGroup;
