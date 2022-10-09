import './index.scss';

import { initializeIcons } from '@fluentui/react';

import showRootComponent from '../shared-ui/showRootComponent';
import RuleCopyModal from './RuleCopyModal';

initializeIcons();

showRootComponent(<RuleCopyModal />, 'copy-modal-container');
