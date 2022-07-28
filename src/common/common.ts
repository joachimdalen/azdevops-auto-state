import { IButtonProps } from 'azure-devops-ui/Button';
import { IMessageBarProps } from 'azure-devops-ui/MessageBar';

export interface IConfirmationConfig {
  cancelButton: Omit<IButtonProps, 'onClick'>;
  doNotShowAgain?: boolean;
  confirmButton: Omit<IButtonProps, 'onClick'>;
  content: string | string[];
  messageBar?: IMessageBarProps;
  messageBarContent?: string;
}
