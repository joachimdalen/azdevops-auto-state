import './index.scss';

import { createTheme, loadTheme } from '@fluentui/react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ButtonGroup } from 'azure-devops-ui/ButtonGroup';
import { Checkbox } from 'azure-devops-ui/Checkbox';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { ITableColumn, SimpleTableCell } from 'azure-devops-ui/Table';
import { useEffect, useMemo, useState } from 'react';

import AddRuleResult from '../common/models/AddRuleResult';
import Rule from '../common/models/Rule';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import { appTheme } from '../shared-ui/azure-devops-theme';
import LoadingSection from '../shared-ui/component/LoadingSection';
import StateTag from '../shared-ui/component/StateTag';
import useDropdownMultiSelection from '../shared-ui/hooks/useDropdownMultiSelection';
import useDropdownSelection from '../shared-ui/hooks/useDropdownSelection';
import showRootComponent from '../shared-ui/showRootComponent';

const ModalContent = (): React.ReactElement => {
  const [types, setTypes] = useState<WorkItemType[]>([]);
  const [workItemType, setWorkItemType] = useState('');
  const [parentType, setParentType] = useState('');
  const [parentNotState, setParentNotState] = useState<string[]>([]);
  const [parentTargetState, setParentTargetState] = useState('');
  const [childState, setChildState] = useState('');
  const [allChildren, setAllChildren] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadTheme(createTheme(appTheme));
    DevOps.init().then(async () => {
      webLogger.information('Loading rule modal...');
    });
    DevOps.ready()
      .then(() => {
        const config = DevOps.getConfiguration();

        if (config.dialog) {
          DevOps.notifyLoadSucceeded().then(() => {
            DevOps.resize();
            const service = new WorkItemService();
            service.getWorkItemTypes().then(x => {
              setTypes(x);
            });
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const workItemTypes: IListBoxItem[] = useMemo(() => {
    return types.map(x => {
      const item: IListBoxItem = {
        id: x.referenceName,
        text: x.name,
        data: {
          icon: x.icon
        }
      };
      return item;
    });
  }, [types]);

  const workItemStates: IListBoxItem[] = useMemo(() => {
    return types
      .filter(x => x.referenceName === workItemType)
      .flatMap(x => {
        return x.states.map(state => {
          const item: IListBoxItem = {
            id: state.name,
            text: state.name,
            data: state.color
          };
          return item;
        });
      });
  }, [workItemType]);
  const parentStates: IListBoxItem[] = useMemo(() => {
    return types
      .filter(x => x.referenceName === parentType)
      .flatMap(x => {
        return x.states.map(state => {
          const item: IListBoxItem = {
            id: state.name,
            text: state.name,
            data: state.color
          };
          return item;
        });
      });
  }, [parentType]);
  const workItemTypeSelection = useDropdownSelection(workItemTypes);
  const parentTypeSelection = useDropdownSelection(workItemTypes);
  const workItemStateSelection = useDropdownSelection(workItemStates);
  const parentStateSelection = useDropdownMultiSelection(parentStates);
  const parentTargetStateSelection = useDropdownSelection(parentStates);

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const res: AddRuleResult = {
        result: 'CANCEL'
      };
      config.dialog.close(res);
    }
  };
  const save = () => {
    const config = DevOps.getConfiguration();
    if (config.dialog) {
      const ac: Rule = {
        workItemType: workItemType,
        parentType: parentType,
        childState: childState,
        parentNotState: parentNotState,
        parentTargetState: parentTargetState,
        allChildren: allChildren
      };

      const res: AddRuleResult = {
        workItemType: workItemType,
        result: 'SAVE',
        rule: ac
      };
      config.dialog.close(res);
    }
  };

  const renderWorkItemCell = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IListBoxItem>,
    tableItem: IListBoxItem
  ) => {
    const date: any = tableItem.data;
    return (
      <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
        <div className="flex-row flex-center">
          <img src={date?.icon?.url} height={16} />
          <span className="margin-left-16">{tableItem?.text}</span>
        </div>
      </SimpleTableCell>
    );
  };
  const renderStateCell = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IListBoxItem>,
    tableItem: IListBoxItem
  ) => {
    const color: any = tableItem.data;
    return (
      <SimpleTableCell key={tableItem.id} columnIndex={columnIndex}>
        <StateTag color={color} text={tableItem.text || 'Unknown'} />
      </SimpleTableCell>
    );
  };

  const addOrRemove = (id: string) => {
    if (parentNotState.includes(id)) {
      setParentNotState(prev => prev.filter(x => x !== id));
    } else {
      setParentNotState(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex-grow">
      <LoadingSection isLoading={loading} text="Loading..." />
      <ConditionalChildren renderChildren={!loading}>
        <div className="rhythm-vertical-16 flex-grow">
          <FormItem label="When work item type is">
            <Dropdown
              placeholder="Select a work item type"
              items={workItemTypes}
              selection={workItemTypeSelection}
              onSelect={(_, i) => setWorkItemType(i.id)}
              renderItem={renderWorkItemCell}
            />
          </FormItem>
          <FormItem label="And parent type is">
            <Dropdown
              placeholder="Select a work item type"
              items={workItemTypes}
              selection={parentTypeSelection}
              onSelect={(_, i) => setParentType(i.id)}
              renderItem={renderWorkItemCell}
            />
          </FormItem>
          <FormItem label="When child state is">
            <Dropdown
              disabled={workItemStates?.length === 0}
              placeholder="Select a state"
              items={workItemStates}
              selection={workItemStateSelection}
              onSelect={(_, i) => setChildState(i.id)}
              renderItem={renderStateCell}
            />
          </FormItem>
          <FormItem label="And parent states is not">
            <Dropdown
              disabled={parentStates?.length === 0}
              placeholder="Select states"
              items={parentStates}
              selection={parentStateSelection}
              onSelect={(_, i) => addOrRemove(i.id)}
              renderItem={renderStateCell}
            />
          </FormItem>
          <FormItem label="Set parent state to">
            <Dropdown
              disabled={parentStates?.length === 0}
              placeholder="Select a state"
              items={parentStates}
              selection={parentTargetStateSelection}
              onSelect={(_, i) => setParentTargetState(i.id)}
              renderItem={renderStateCell}
            />
          </FormItem>
          <Checkbox
            label="Only if all children is state"
            checked={allChildren}
            onChange={(_, c) => setAllChildren(c)}
          />
        </div>
        <ButtonGroup className="justify-space-between margin-top-16">
          <Button text="Close" onClick={() => dismiss()} />
          <Button text="Save" primary iconProps={{ iconName: 'Save' }} onClick={() => save()} />
        </ButtonGroup>
      </ConditionalChildren>
    </div>
  );
};
showRootComponent(<ModalContent />, 'modal-container');
