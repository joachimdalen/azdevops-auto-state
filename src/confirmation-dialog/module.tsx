import './index.scss';

import { showRootComponent } from '@joachimdalen/azdevops-ext-core/showRootComponent';

import ConfirmationDialog from './ConfirmationDialog';
const App = () => {
  return <ConfirmationDialog />;
};
showRootComponent(<App />, 'confirmation-dialog-container');
