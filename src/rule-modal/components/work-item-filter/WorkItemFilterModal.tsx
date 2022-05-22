import { ChoiceGroup } from '@fluentui/react';
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
import { EditableDropdown } from 'azure-devops-ui/EditableDropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { TextField } from 'azure-devops-ui/TextField';
import { Toggle } from 'azure-devops-ui/Toggle';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import React, { useMemo, useState } from 'react';

import FilterItem, { FilterFieldType } from '../../../common/models/FilterItem';
import {
  excludedReferenceNames,
  FilterOperation,
  filterOperations,
  supportedValueTypes
} from '../../types';
import { WorkItemTagPicker } from '../WorkItemTagPicker';

interface ListBoxOperation {
  op: FilterOperation;
}

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
  onAddItem,
  selectedFields
}: WorkItemFilterModalProps): React.ReactElement => {
  const [field, setField] = useState<string | undefined>();
  const [group, setGroup] = useState<string | undefined>();
  const [fieldReference, setFieldReference] = useState<WorkItemField | undefined>();
  const [operator, setOperator] = useState<FilterOperation | undefined>();
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
    const item = (workItemType?.fields || [])
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

    return new ArrayItemProvider(item);
  }, [workItemType]);

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
      case FieldType.PlainText: {
        return <TextField onChange={(e, v) => setValue(v)} value={value as string} />;
      }
      default:
        return <span>Unable to determine input type</span>;
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
          onClick: () => {
            if (
              field !== undefined &&
              operator !== undefined &&
              value !== undefined &&
              group !== undefined
            ) {
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
                type: getItem(),
                group: group
              };

              onAddItem(item);
              onClose();
            }
          }
        }
      ]}
      showCloseButton
    >
      <div className="rhythm-vertical-8 padding-bottom-16">
        <ChoiceGroup
          label="Where should this filter be applied?"
          defaultSelectedKey="bar"
          options={[
            {
              key: 'bar',
              imageSrc:
                'https://tfsprodweu5.visualstudio.com/_apis/wit/workItemIcons/icon_insect?color=CC293D&v=2',
              selectedImageSrc:
                'https://tfsprodweu5.visualstudio.com/_apis/wit/workItemIcons/icon_insect?color=CC293D&v=2',
              imageAlt: 'Bar chart',
              imageSize: { width: 32, height: 32 },
              text: 'Bug'
            },
            {
              key: 'user-story',
              imageSrc:
                'https://tfsprodweu5.visualstudio.com/_apis/wit/workItemIcons/icon_insect?color=CC293D&v=2',
              selectedImageSrc:
                'https://tfsprodweu5.visualstudio.com/_apis/wit/workItemIcons/icon_insect?color=CC293D&v=2',
              imageAlt: 'Bar chart',
              imageSize: { width: 32, height: 32 },
              text: 'User Story (Parent)'
            }
          ]}
        />
        <FormItem
          label="Rule group"
          message="Rule groups allows for creating distinct trigger groups (multiple rules). See the documentation for more info"
        >
          <EditableDropdown
            allowFreeform={true}
            items={[]}
            onValueChange={value => value !== undefined && setGroup(value.id)}
            placeholder="Select or create a group"
          />
        </FormItem>
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
              onSelect={(_, item) => {
                if (item?.data?.op !== undefined) setOperator(item.data.op);
              }}
            />
          </FormItem>
          <FormItem label="Value">{getFieldValueControl()}</FormItem>
        </ConditionalChildren>
      </div>
    </Dialog>
  );
};

export default WorkItemFilterModal;
