import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import { Button } from 'azure-devops-ui/Button';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import { ArrayItemProvider } from 'azure-devops-ui/Utilities/Provider';
import { useMemo, useState } from 'react';

interface WorkItemFilterProps {
  workItemType?: WorkItemType;
}

interface FilterOption {
  field: string;
  operator: string;
  value: string;
}

const WorkItemFilter = ({ workItemType }: WorkItemFilterProps): JSX.Element => {
  const [items, setItems] = useState<FilterOption[]>([
    { field: 'System.Title', operator: 'contains', value: 'Black' }
  ]);

  const fields = useMemo(() => {
    const item = (workItemType?.fields || []).map(field => {
      const items: IListBoxItem = {
        id: field.referenceName,
        text: field.name
      };
      return items;
    });

    return new ArrayItemProvider(item);
  }, [workItemType]);

  const add = (id: FilterOption) => {
    setItems(prev => [...prev, id]);
  };

  const remove = (filt: FilterOption) => {
    if (items.findIndex(x => x.field === filt.field) !== -1) {
      setItems(prev => prev.filter(x => x.field !== filt.field));
    }
  };

  const updateItem = (criteria: FilterOption, text: string) => {
    const index = items.findIndex(x => x.field === criteria.field);
    if (index === -1) return;

    const newItems = [...items];
    const item = newItems[index];
    item.value = text;
    newItems[index] = item;

    setItems(newItems);
  };

  return (
    <div className="rhythm-vertical-16 flex-grow margin-top-8">
      <div className="rhythm-vertical-8 padding-bottom-16">
        {items.map((item, index) => {
          return (
            <FormItem key={item.field}>
              <div className="flex-row flex-center rhythm-horizontal-4">
                {/* <TextField
                  containerClassName="flex-grow"
                  width={TextFieldWidth.auto}
                  onChange={(_, val) => updateItem(item, val)}
                  value={item.field}
                /> */}
                <Dropdown width={200} items={fields} containerClassName="flex-grow" />

                <Button
                  id={`${item.field}-up`}
                  disabled={index === 0}
                  iconProps={{ iconName: 'Up' }}
                  subtle
                  tooltipProps={{ text: 'Move Up' }}
                  onClick={() => {
                    const nI = [...items];
                    //  move(nI, index, -1);
                    setItems(nI);
                  }}
                />

                <Button
                  id={`${item.field}-down`}
                  disabled={index === items.length - 1}
                  iconProps={{ iconName: 'Down' }}
                  subtle
                  tooltipProps={{ text: 'Move Down' }}
                  onClick={() => {
                    const nI = [...items];
                    //move(nI, index, 1);
                    setItems(nI);
                  }}
                />
                <Button
                  id={`${item.field}-remove`}
                  iconProps={{ iconName: 'Delete' }}
                  subtle
                  tooltipProps={{ text: 'Remove' }}
                  onClick={() => remove(item)}
                />
              </div>
            </FormItem>
          );
        })}
      </div>
    </div>
  );
};

export default WorkItemFilter;
