/* istanbul ignore file */
import './index.scss';

import { initializeIcons } from '@fluentui/react';

import showRootComponent from '../shared-ui/showRootComponent';
import RuleCopyPanel from './RuleCopyPanel';

initializeIcons();

showRootComponent(<RuleCopyPanel />, 'copy-panel-container');
