import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { FilterOperation } from '../../rule-modal/types';

export enum FilterFieldType {
  String = 0,
  Integer = 1,
  PlainText = 3,
  Boolean = 9,
  Identity = 10
}

export default interface FilterItem {
  field: string;
  operator: FilterOperation;
  value: string | boolean | IInternalIdentity | number;
  type: FilterFieldType;
}
