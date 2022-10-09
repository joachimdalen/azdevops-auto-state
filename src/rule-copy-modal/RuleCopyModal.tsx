import './index.scss';

import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { ProcessInfo } from 'azure-devops-extension-api/WorkItemTrackingProcess';
import * as DevOps from 'azure-devops-extension-sdk';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { MessageCard } from 'azure-devops-ui/MessageCard';
import React, { useEffect, useMemo, useState } from 'react';

import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import RuleCopyService from './services/RuleCopyService';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import LoadingSection from '../shared-ui/component/LoadingSection';
import { RuleCopyResult } from './types';

const RuleCopyModal = (): React.ReactElement => {
  const [workItemService, ruleCopyService] = useMemo(
    () => [new WorkItemService(), new RuleCopyService()],
    []
  );
  const [processInfo, setProcessInfo] = useState<ProcessInfo>();
  const [targetProject, setTargetProject] = useState<string | undefined>();

  const [loading, setLoading] = useState(true);
  const projectOptions: IListBoxItem[] = useMemo(() => {
    return (processInfo?.projects || []).map(x => {
      const item: IListBoxItem = {
        id: x.id,
        text: x.name
      };
      return item;
    });
  }, [processInfo]);

  useEffect(() => {
    DevOps.resize();
  }, [projectOptions]);

  useEffect(() => {
    async function initModule() {
      try {
        await DevOps.init({
          loaded: false,
          applyTheme: true
        });
        webLogger.information('Loading rule presets panel...');
        await DevOps.ready();

        const wiProcess = await workItemService.getProcessInfo(true, false);
        console.log(wiProcess);
        setProcessInfo(wiProcess);

        await DevOps.notifyLoadSucceeded();
      } catch (error) {
        webLogger.error('Failed to get project configuration', error);
      } finally {
        DevOps.resize();
        setLoading(false);
      }
    }

    initModule();
  }, []);

  const dismiss = () => {
    const config = DevOps.getConfiguration();
    if (config.panel) {
      const res = {
        result: 'CANCEL'
      };
      config.panel.close(res);
    }
  };

  const save = async () => {
    try {
      const config = DevOps.getConfiguration();
      const res: RuleCopyResult = {
        projectId: targetProject
      };
      config.panel.close(res);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
      okButton={{
        text: 'Copy',
        primary: true,
        onClick: () => save(),
        iconProps: { iconName: 'Copy' }
      }}
      showExtensionVersion={false}
      moduleVersion={process.env.RULE_COPY_MODAL_VERSION}
    >
      <ConditionalChildren renderChildren={loading}>
        <LoadingSection isLoading={loading} text="Loading.." />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={!loading}>
        <div className="flex-grow rhythm-vertical-16">
          <MessageCard>
            You can only copy rules between projects that are using the same work item process.
            Certain filters will be duplicated and might in some cases need to be updated manually
          </MessageCard>

          <FormItem label="Select project to copy rule to">
            <Dropdown
              placeholder="Select target project"
              items={projectOptions}
              onSelect={(_, i) => setTargetProject(i.id)}
            />
          </FormItem>
        </div>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default RuleCopyModal;
