import { FieldType, WorkItemFieldOperation } from 'azure-devops-extension-api/WorkItemTracking';

export interface FilterOperation extends WorkItemFieldOperation {
  supportedTypes: FieldType[];
}

export const supportedValueTypes: FieldType[] = [
  FieldType.Boolean,
  FieldType.Identity,
  FieldType.Integer,
  FieldType.PlainText,
  FieldType.String
];

export const filterOperations: FilterOperation[] = [
  {
    referenceName: 'SupportedOperations.Equals',
    name: '= (Equals)',
    supportedTypes: supportedValueTypes
  },
  {
    referenceName: 'SupportedOperations.NotEquals',
    name: '<> (Not Equals)',
    supportedTypes: supportedValueTypes
  },
  {
    referenceName: 'SupportedOperations.GreaterThan',
    name: '> (Greater Than)',
    supportedTypes: [FieldType.Integer]
  },
  {
    referenceName: 'SupportedOperations.LessThan',
    name: '< (Less Than)',
    supportedTypes: [FieldType.Integer]
  },
  {
    referenceName: 'SupportedOperations.GreaterThanEquals',
    name: '>= (Greater Than Equals)',
    supportedTypes: [FieldType.Integer]
  },
  {
    referenceName: 'SupportedOperations.LessThanEquals',
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
