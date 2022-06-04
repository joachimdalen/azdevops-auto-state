import { ChoiceGroup } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { IdentityPicker } from '@joachimdalen/azdevops-ext-core/IdentityPicker';
import {
  getCombined,
  hasError,
  parseValidationError
} from '@joachimdalen/azdevops-ext-core/ValidationUtils';
import {
  FieldType,
  WorkItemField,
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
import * as yup from 'yup';

import { FilterGroup } from '../../../common/models/FilterGroup';
import FilterItem, { FilterFieldType } from '../../../common/models/FilterItem';
import useDropdownSelection from '../../../shared-ui/hooks/useDropdownSelection';
import {
  excludedReferenceNames,
  FilterOperation,
  filterOperations,
  filterValidationSchema,
  supportedValueTypes
} from '../../types';
import { WorkItemTagPicker } from '../WorkItemTagPicker';
import { WorkItemFilterInternalProps } from './types';

interface ListBoxOperation {
  op: FilterOperation;
}

interface WorkItemFilterModalProps extends WorkItemFilterInternalProps {
  fields: WorkItemField[];
  group?: FilterGroup;
  onClose: () => void;
  onAddItem: (filterItem: FilterItem, target: SelectionItem) => void;
}

type SelectionItem = 'workItem' | 'parent';

const WorkItemFilterModal = ({
  workItem,
  parent,
  onClose,
  fields,
  onAddItem,
  group
}: WorkItemFilterModalProps): React.ReactElement => {
  const [field, setField] = useState<string>('');
  const [fieldReference, setFieldReference] = useState<WorkItemField | undefined>();
  const [operator, setOperator] = useState<FilterOperation>(FilterOperation.Equals);
  const [value, setValue] = useState<string | boolean | number | IInternalIdentity | undefined>();
  const [selectedItem, setSelectedItem] = useState<SelectionItem>('workItem');
  const [validationErrors, setValidationErrors] = useState<
    { [key: string]: string[] } | undefined
  >();
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
  const dropdownOperations = useMemo(() => {
    const type = fields.find(y => y.referenceName === field);
    setFieldReference(type);
    if (type === undefined) return [];
    const filtered = filterOperations
      .filter(x => x.supportedTypes.includes(type.type))
      .map(x => {
        const items: IListBoxItem<ListBoxOperation> = {
          id: x.referenceName,
          text: x.name,
          data: {
            op: x.referenceName
          }
        };
        return items;
      });

    return filtered;
  }, [field]);
  const sortItems = (a: WorkItemTypeFieldInstance, b: WorkItemTypeFieldInstance) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  const itemFields: IListBoxItem<any>[] = useMemo(() => {
    const selectedFields =
      selectedItem === 'workItem'
        ? group?.workItemFilters?.map(x => x.field)
        : group?.parentFilters?.map(x => x.field);
    return ((selectedItem === 'workItem' ? workItem?.fields : parent?.fields) || [])
      .filter(x => {
        const type = fields.find(y => y.referenceName === x.referenceName);
        return type === undefined
          ? false
          : supportedValueTypes.includes(type.isIdentity ? FieldType.Identity : type.type) &&
              !excludedReferenceNames.includes(type.referenceName) &&
              !(selectedFields || []).includes(type.referenceName);
      })
      .sort(sortItems)
      .map(field => {
        const items: IListBoxItem = {
          id: field.referenceName,
          text: field.name
        };
        return items;
      });
  }, [selectedItem]);

  const operatorSelection = useDropdownSelection(
    dropdownOperations,
    dropdownOperations.length > 0 ? dropdownOperations[0].id : undefined
  );

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

    if (selectedField.referenceName === 'System.Tags') {
      return <WorkItemTagPicker selected={value as string} onChange={v => setValue(v)} />;
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
      case FieldType.PlainText:
      case FieldType.TreePath: {
        return <TextField onChange={(e, v) => setValue(v)} value={value as string} />;
      }
      default:
        return <span>Unable to determine input type</span>;
    }
  };

  const save = async () => {
    try {
      const item: FilterItem = {
        field: field,
        operator: operator,
        value: value || '',
        type: getItem()
      };
      await filterValidationSchema.validate(item, {
        abortEarly: false
      });

      onAddItem(item, selectedItem);
      onClose();
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
    <Dialog
      calloutClassName="filter-modal-callout"
      titleProps={{ text: 'Add filter item' }}
      onDismiss={onClose}
      contentJustification={ContentJustification.Start}
      footerButtonProps={[
        {
          text: 'Add',
          primary: true,
          iconProps: {
            iconName: 'Add'
          },
          onClick: async () => await save()
        }
      ]}
      showCloseButton
    >
      <div className="rhythm-vertical-8 padding-bottom-16">
        <FormItem label="Where should this filter be applied?">
          <ChoiceGroup
            defaultSelectedKey={selectedItem}
            onChange={(_, option) => {
              if (option) {
                setSelectedItem(option.key as SelectionItem);
                setField('');

                if (dropdownOperations.length > 0 && dropdownOperations[0].data?.op) {
                  operatorSelection.select(0);
                  setOperator(dropdownOperations[0].data?.op);
                }
              }
            }}
            options={[
              {
                key: 'workItem',
                imageSrc: workItem?.icon.url,
                selectedImageSrc: workItem?.icon.url,
                imageAlt: workItem?.name,
                imageSize: { width: 32, height: 32 },
                text: workItem?.name || 'Work Item'
              },
              {
                key: 'parent',
                imageSrc: parent?.icon.url,
                selectedImageSrc: parent?.icon.url,
                imageAlt: parent?.name,
                imageSize: { width: 32, height: 32 },
                text: parent?.name || 'Parent'
              }
            ]}
          />
        </FormItem>

        <FormItem
          label="Field"
          error={hasError(validationErrors, 'field')}
          message={getCombined(validationErrors, 'field')}
        >
          <Dropdown
            placeholder="Select field to filter on"
            items={itemFields}
            containerClassName="flex-grow"
            className="flex-grow"
            onSelect={(_, item) => {
              setField(item.id);
              operatorSelection.select(0);
            }}
          />
        </FormItem>
        <ConditionalChildren renderChildren={field !== ''}>
          <FormItem
            label="Operator"
            error={hasError(validationErrors, 'operator')}
            message={getCombined(validationErrors, 'operator')}
          >
            <Dropdown
              className="flex-one"
              items={dropdownOperations}
              selection={operatorSelection}
              onSelect={(_, item) => {
                if (item?.data?.op !== undefined) setOperator(item.data.op);
              }}
            />
          </FormItem>
          <FormItem
            label="Value"
            error={hasError(validationErrors, 'value')}
            message={getCombined(validationErrors, 'value')}
          >
            {getFieldValueControl()}
          </FormItem>
        </ConditionalChildren>
      </div>
    </Dialog>
  );
};

export default WorkItemFilterModal;
