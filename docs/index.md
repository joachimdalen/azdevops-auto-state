# Auto State Documentation

Welcome to the Auto State documentation.

Auto State is a rule based extension for updating parent states when a work item updated.

- [How to create rules](./RULES.md)
- [Settings](./SETTINGS.md)
- [Preset rules](./PRESETS.md)

## Usage

This extension does **not** work on all areas where work items are located:

| View              | Status                                                                             |
| ----------------- | ---------------------------------------------------------------------------------- |
| Work item fom     | Fully working                                                                      |
| Backlog           | Fully working                                                                      |
| Boards            | Does not work. See issue [#38](https://github.com/joachimdalen/azdevops-auto-state/issues/38) |
| Query result view | Does not work                                                                      |

The reason for this is that Azure DevOps does not include contribution types that allows the extension to hook into State changes in these views

## Rules

For details on how to configure rules, see [RULES](./RULES.md);

## Testing Rules

The Rule Tester allows you to perform a dry run of rules to see how it will update work items.

You can find the rule tester in two places:

1. From the admin page. Here you can test rules for all work items.

   ![rule-tester-admin-page](./images/rule-tester-admin-page.png)

2. From the individual work item. Here you can test rules for the current work item.

   ![rule-tester-work-item](./images/rule-tester-work-item.png)

The rule tester will show all work items that will be changed.

![rule-tester-result](../marketplace/docs/images/rule-tester-result.png)
