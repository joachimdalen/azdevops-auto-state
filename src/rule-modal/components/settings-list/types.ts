import { IToggleProps } from 'azure-devops-ui/Toggle';

export interface SettingRowBase {
  id: string;
  title: string;
}

export interface SettingRowToggle extends SettingRowBase {
  checked: boolean;
}

export interface SettingRow<T> {
  title: string;
  description?: string | React.ReactNode;
  checked: boolean;
  options?: T[];
  toggleProps?: Omit<IToggleProps, 'checked' | 'onChange'>;
}
