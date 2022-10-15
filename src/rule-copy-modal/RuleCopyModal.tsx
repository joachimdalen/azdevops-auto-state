import './index.scss';

import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { PanelWrapper } from '@joachimdalen/azdevops-ext-core/PanelWrapper';
import { ProjectReference } from 'azure-devops-extension-api/WorkItemTrackingProcess';
import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Dropdown } from 'azure-devops-ui/Dropdown';
import { FormItem } from 'azure-devops-ui/FormItem';
import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import React, { useEffect, useMemo, useState } from 'react';

import Rule from '../common/models/Rule';
import WorkItemService from '../common/services/WorkItemService';
import webLogger from '../common/webLogger';
import LoadingSection from '../shared-ui/component/LoadingSection';
import RuleCopyService from './services/RuleCopyService';

interface MessageProps {
  message: string;
  severity: MessageCardSeverity;
}

const RuleCopyModal = (): React.ReactElement => {
  const [workItemService, ruleCopyService, devOpsService] = useMemo(
    () => [new WorkItemService(), new RuleCopyService(), new DevOpsService()],
    []
  );
  const [projects, setProjects] = useState<ProjectReference[]>();
  const [targetProject, setTargetProject] = useState<string | undefined>();
  const [message, setMessage] = useState<MessageProps | undefined>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [rule, setRule] = useState<Rule | undefined>();

  const projectOptions: IListBoxItem[] = useMemo(() => {
    return (projects || []).map(x => {
      const item: IListBoxItem = {
        id: x.id,
        text: x.name
      };
      return item;
    });
  }, [projects]);

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

        const currentProject = await devOpsService.getProject();
        const wiProcess = await workItemService.getProcessInfo(true, false);
        const projects = wiProcess?.projects?.filter(x => x.id !== currentProject?.id);

        const config = DevOps.getConfiguration();
        setRule(config.rule);

        setProjects(projects);

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
      config.panel.close();
    }
  };

  const copyRule = async () => {
    setMessage(undefined);
    if (rule && targetProject) {
      setProcessing(true);
      const result = await ruleCopyService.copyRule(targetProject, rule);
      if (result.success) {
        setProcessing(false);
        setMessage({
          severity: MessageCardSeverity.Info,
          message: 'Rule was copied to selected project'
        });
      } else {
        setMessage({
          severity: MessageCardSeverity.Error,
          message: result.message || 'Unknown error'
        });
        setProcessing(false);
      }
    } else {
      setMessage({
        severity: MessageCardSeverity.Warning,
        message: 'Failed to copy rule. Please close the modal and try again'
      });
    }
  };

  return (
    <PanelWrapper
      rootClassName="custom-scrollbar scroll-hidden"
      contentClassName="full-height h-scroll-hidden"
      cancelButton={{ text: 'Close', onClick: () => dismiss() }}
      showExtensionVersion={false}
      moduleVersion={process.env.RULE_COPY_MODAL_VERSION}
    >
      <ConditionalChildren renderChildren={loading}>
        <LoadingSection isLoading={loading} text="Loading.." />
      </ConditionalChildren>
      <ConditionalChildren renderChildren={!loading && projectOptions.length === 0}>
        <MessageCard className="margin-bottom-8" severity={MessageCardSeverity.Warning}>
          No other projects using the current process. You can only copy rules between projects that
          are using the same work item process.
        </MessageCard>
      </ConditionalChildren>
      <ConditionalChildren renderChildren={!loading && projectOptions.length > 0}>
        <div className="flex-grow rhythm-vertical-16">
          <ConditionalChildren renderChildren={message !== undefined}>
            <MessageCard className="margin-bottom-8" severity={message?.severity}>
              {message?.message}
            </MessageCard>
          </ConditionalChildren>

          <p>
            You can only copy rules between projects that are using the same work item process.
            Certain filters will be duplicated and might in some cases need to be updated manually
          </p>

          <FormItem label="Select project to copy rule to">
            <Dropdown
              placeholder="Select target project"
              items={projectOptions}
              onSelect={(_, i) => setTargetProject(i.id)}
            />
          </FormItem>

          <Button
            onClick={copyRule}
            iconProps={{ iconName: 'Copy' }}
            disabled={rule === undefined || processing || targetProject === undefined}
          >
            Copy
          </Button>
        </div>
      </ConditionalChildren>
    </PanelWrapper>
  );
};

export default RuleCopyModal;
