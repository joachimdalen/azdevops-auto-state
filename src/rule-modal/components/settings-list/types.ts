import { IListBoxItem } from 'azure-devops-ui/ListBox';
import { IToggleProps } from 'azure-devops-ui/Toggle';

export interface SettingRowBase {
  id: string;
  title: string;
}

export interface SettingRowToggle extends SettingRowBase {
  checked: boolean;
}

export interface SettingRowDropdown extends SettingRowBase {
  selected: string;
  items: IListBoxItem[];
}

export interface SettingRow<T> {
  title: string;
  description?: string | React.ReactNode;
  checked: boolean;
  options?: T[];
  toggleProps?: Omit<IToggleProps, 'checked' | 'onChange'>;
}
