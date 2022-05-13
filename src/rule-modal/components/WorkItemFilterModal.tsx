import { Toggle } from '@fluentui/react';
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
import { IList } from 'azure-devops-ui/List';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { TextField } from 'azure-devops-ui/TextField';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { TreeItemProvider } from 'azure-devops-ui/Utilities/TreeItemProvider';
import { useMemo, useState } from 'react';

interface WorkItemFilterModalProps {
  workItemType?: WorkItemType;
  fields: WorkItemField[];
  selectedFields?: string[];
  onClose: () => void;
}
const supportedValueTypes: FieldType[] = [
  FieldType.Boolean,
  FieldType.DateTime,
  FieldType.Double,
  FieldType.Identity,
  FieldType.Integer,
  FieldType.PlainText,
  FieldType.String
];
const WorkItemFilterModal = ({ workItemType, onClose, fields }: WorkItemFilterModalProps) => {
  const [field, setField] = useState<string | undefined>();
  const sortItems = (a: WorkItemTypeFieldInstance, b: WorkItemTypeFieldInstance) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  const itemFields = useMemo(() => {
    //  const types = workItemType.fields?.flatMap(x => x.)
    const item = (workItemType?.fields || [])
      .filter(x => {
        const type = fields.find(y => y.referenceName === x.referenceName)?.type;
        return type === undefined ? false : supportedValueTypes.includes(type);
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

  const getFieldValueControl = () => {
    const type = fields.find(x => x.referenceName === field)?.type;
    if (type === undefined) return <span>Unable to determine input type</span>;

    switch (type) {
      case FieldType.Boolean: {
        return <Toggle />;
      }
      case FieldType.Integer: {
        return <TextField inputType="number" />;
      }
      case FieldType.String: {
        return <TextField />;
      }
    }
    return null;
  };

  return (
    <Dialog
      resizable
      calloutClassName="filter-modal-callout"
      titleProps={{ text: 'Add filter item' }}
      onDismiss={onClose}
      contentJustification={ContentJustification.Start}
      footerButtonProps={[{ text: 'Save' }]}
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
            <Dropdown className="flex-one" items={[{ id: 'equals', text: '=' }]} />
          </FormItem>
          <FormItem label="Value">{getFieldValueControl()}</FormItem>
        </ConditionalChildren>
      </div>
    </Dialog>
  );
};

export default WorkItemFilterModal;
