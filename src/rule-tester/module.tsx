import * as DevOps from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { FormItem } from 'azure-devops-ui/FormItem';
import { TextField } from 'azure-devops-ui/TextField';
import { useEffect, useMemo } from 'react';
import WorkItemService from '../common/services/WorkItemService';

import webLogger from '../common/webLogger';
import showRootComponent from '../shared-ui/showRootComponent';

const RuleTester = (): React.ReactElement => {
  useEffect(() => {
    DevOps.init({
      loaded: false,
      applyTheme: true
    }).then(async () => {
      webLogger.information('Loading rule tester...');
    });
    DevOps.ready().then(() => {
      const config = DevOps.getConfiguration();

      console.log(config);
      DevOps.notifyLoadSucceeded().then(() => {
        DevOps.resize();
      });
    });
  }, []);
  const workItemService = useMemo(() => new WorkItemService(), []);
  return (
    <div>
      <FormItem className="flex-grow" label="Work item id">
        <div className="flex-row">
          <TextField inputType="number" />
          <Button primary text="Load" />
        </div>
      </FormItem>
    </div>
  );
};

showRootComponent(<RuleTester />, 'rule-tester-container');
