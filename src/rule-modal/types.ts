import { FieldType } from 'azure-devops-extension-api/WorkItemTracking';
import * as yup from 'yup';
import { FilterGroup } from '../common/models/FilterGroup';

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
  FieldType.TreePath,
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
  filterGroups: yup
    .array<FilterGroup>()
    .of(
      yup
        .object()
        .test(
          'required',
          'At least one filter condition is required in filter groups',
          (value: any, context) => {
            console.log(value);

            if (value.workItemFilters === undefined && value.parentFilters === undefined)
              return false;

            if (value.workItemFilters?.length === 0 && value.parentFilters?.length === 0) {
              return false;
            }

            return true;
          }
        )
    )
    .min(1, 'At least one rule group must be specified')
});
export const filterValidationSchema = yup.object().shape({
  field: yup.string().trim().required(),
  operator: yup.string().trim().required(),
  value: yup.mixed().required('Value is required') // TODO: Fix type message
});
