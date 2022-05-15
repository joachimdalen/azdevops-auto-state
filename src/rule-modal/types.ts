import { FieldType } from 'azure-devops-extension-api/WorkItemTracking';

export enum FilterOperation {
  Equals = 'SupportedOperations.Equals',
  NotEquals = 'SupportedOperations.NotEquals',
  GreaterThan = 'SupportedOperations.GreaterThan',
  LessThan = 'SupportedOperations.LessThan',
  GreaterThanEquals = 'SupportedOperations.GreaterThanEquals',
  LessThanEquals = 'SupportedOperations.LessThanEquals'
}
export interface FilterOperationDefinition {
  name: string;
  referenceName: FilterOperation;
  supportedTypes: FieldType[];
}

export const supportedValueTypes: FieldType[] = [
  FieldType.Boolean,
  FieldType.Identity,
  FieldType.Integer,
  FieldType.PlainText,
  FieldType.String
];

export const filterOperations: FilterOperationDefinition[] = [
  {
    referenceName: FilterOperation.Equals,
    name: '= (Equals)',
    supportedTypes: supportedValueTypes
  },
  {
    referenceName: FilterOperation.NotEquals,
    name: '<> (Not Equals)',
    supportedTypes: supportedValueTypes
  },
  {
    referenceName: FilterOperation.GreaterThan,
    name: '> (Greater Than)',
    supportedTypes: [FieldType.Integer]
  },
  {
    referenceName: FilterOperation.LessThan,
    name: '< (Less Than)',
    supportedTypes: [FieldType.Integer]
  },
  {
    referenceName: FilterOperation.GreaterThanEquals,
    name: '>= (Greater Than Equals)',
    supportedTypes: [FieldType.Integer]
  },
  {
    referenceName: FilterOperation.LessThanEquals,
    name: '<= (Less Than Equals)',
    supportedTypes: [FieldType.Integer]
  }
];

export const excludedReferenceNames: string[] = [
  'System.State',
  'System.WorkItemType',
  'System.Id',
  'System.Parent'
];
