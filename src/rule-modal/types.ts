import { FieldType } from 'azure-devops-extension-api/WorkItemTracking';
import * as yup from 'yup';

export enum FilterOperation {
  Equals = 'SupportedOperations.Equals',
  NotEquals = 'SupportedOperations.NotEquals',
  GreaterThan = 'SupportedOperations.GreaterThan',
  LessThan = 'SupportedOperations.LessThan',
  GreaterThanEquals = 'SupportedOperations.GreaterThanEquals',
  LessThanEquals = 'SupportedOperations.LessThanEquals'
}

export enum ChildrenMatchOption {
  PickFirst = 'ChildrenMatchOption.PickFirst',
  Abort = 'ChildrenMatchOption.Abort'
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

export const validationSchema = yup.object().shape({
  disabled: yup.bool(),
  workItemType: yup.string().trim().required(),
  parentType: yup.string().trim().required(),
  transitionState: yup.string().trim().required(),
  parentExcludedStates: yup
    .array()
    .of(yup.string().trim())
    .min(1, 'Parent not in state is a required field'),
  parentTargetState: yup.string().trim().required(),
  childrenLookup: yup.bool(),
  processParent: yup.bool(),
  groups: yup.array().of(yup.string().trim()).min(1, 'At least one rule group must be specified')
});
