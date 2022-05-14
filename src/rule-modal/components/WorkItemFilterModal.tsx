import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import {
  FieldType,
  WorkItemField,
  WorkItemType,
  WorkItemTypeFieldInstance
} from 'azure-devops-extension-api/WorkItemTracking';
import { ContentJustification } from 'azure-devops-ui/Callout';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dialog } from 'azure-devops-ui/Dialog';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { TextField } from 'azure-devops-ui/TextField';
import { Toggle } from 'azure-devops-ui/Toggle';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import React, { useMemo, useState } from 'react';

import FilterItem, { FilterFieldType } from '../../common/models/FilterItem';
import { excludedReferenceNames, filterOperations, supportedValueTypes } from '../types';
interface WorkItemFilterModalProps {
  workItemType?: WorkItemType;
  fields: WorkItemField[];
  selectedFields?: string[];
  onClose: () => void;
  onAddItem: (filterItem: FilterItem) => void;
}

const WorkItemFilterModal = ({
  workItemType,
  onClose,
  fields,
  onAddItem
}: WorkItemFilterModalProps): React.ReactElement => {
  const [field, setField] = useState<string | undefined>();
  const [fieldReference, setFieldReference] = useState<WorkItemField | undefined>();
  const [operator, setOperator] = useState<string | undefined>();
  const [value, setValue] = useState<string | boolean | number | IInternalIdentity | undefined>();
  const sortItems = (a: WorkItemTypeFieldInstance, b: WorkItemTypeFieldInstance) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  console.log([field, operator, value]);

  const itemFields = useMemo(() => {
    //  const types = workItemType.fields?.flatMap(x => x.)
    const item = (workItemType?.fields || [])
      .filter(x => {
        const type = fields.find(y => y.referenceName === x.referenceName);
        return type === undefined
          ? false
          : supportedValueTypes.includes(type.isIdentity ? FieldType.Identity : type.type) &&
              !excludedReferenceNames.includes(type.referenceName);
      })
      .sort(sortItems)
      .map(field => {
        const items: IListBoxItem = {
          id: field.referenceName,
          text: field.name
        };
        return items;
      });

    return new ArrayItemProvider(item);
  }, [workItemType]);

  const dropdownOperations = useMemo(() => {
    const type = fields.find(y => y.referenceName === field);
    setFieldReference(type);
    if (type === undefined) return [];
    const filtered = filterOperations
      .filter(x => x.supportedTypes.includes(type.type))
      .map(x => {
        const items: IListBoxItem = {
          id: x.referenceName,
          text: x.name
        };
        return items;
      });

    return new ArrayItemProvider(filtered);
  }, [field]);

  const getFieldValueControl = () => {
    const selectedField = fields.find(x => x.referenceName === field);
    if (selectedField === undefined) return <span>Unable to determine input type</span>;

    if (selectedField.isIdentity) {
      return (
        <IdentityPicker
          localStorageKey={'AS_HOST_URL'}
          onChange={i => {
            setValue(i);
          }}
          identity={value as IInternalIdentity}
        />
      );
    }

    switch (selectedField.type) {
      case FieldType.Boolean: {
        return <Toggle onChange={(e, v) => setValue(v)} checked={value as boolean} />;
      }
      case FieldType.Integer: {
        return (
          <TextField inputType="number" onChange={(e, v) => setValue(v)} value={value as string} />
        );
      }
      case FieldType.String:
      case FieldType.PlainText: {
        return <TextField onChange={(e, v) => setValue(v)} value={value as string} />;
      }
      default:
        return <span>Unable to determine input type</span>;
    }
  };

  return (
    <Dialog
      resizable
      calloutClassName="filter-modal-callout"
      titleProps={{ text: 'Add filter item' }}
      onDismiss={onClose}
      contentJustification={ContentJustification.Start}
      footerButtonProps={[
        {
          text: 'Save',
          onClick: () => {
            if (field !== undefined && operator !== undefined && value !== undefined) {
              const getItem = (): FilterFieldType => {
                if (fieldReference === undefined) return FilterFieldType.String;
                if (fieldReference.isIdentity) return FilterFieldType.Identity;

                switch (fieldReference.type) {
                  case FieldType.Boolean:
                    return FilterFieldType.Boolean;
                  case FieldType.Integer:
                    return FilterFieldType.Integer;
                  default:
                    return FilterFieldType.String;
                }
              };

              const item: FilterItem = {
                field: field,
                operator: operator,
                value: value,
                type: getItem()
              };

              onAddItem(item);
            }
          }
        }
      ]}
      showCloseButton
    >
      <div className="rhythm-vertical-8 padding-bottom-16">
        <FormItem label="Field">
          <Dropdown
            placeholder="Select field to filter on"
            items={itemFields}
            containerClassName="flex-grow"
            className="flex-grow"
            onSelect={(_, item) => setField(item.id)}
          />
        </FormItem>
        <ConditionalChildren renderChildren={field !== undefined}>
          <FormItem label="Operator">
            <Dropdown
              className="flex-one"
              items={dropdownOperations}
              onSelect={(_, item) => setOperator(item.id)}
            />
          </FormItem>
          <FormItem label="Value">{getFieldValueControl()}</FormItem>
        </ConditionalChildren>
      </div>
    </Dialog>
  );
};

export default WorkItemFilterModal;
