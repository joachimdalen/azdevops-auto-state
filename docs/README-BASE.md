# Auto State

This extension aims to auto update parent workitems based on a set of rules when the child workitem is started.

![](./images/rule-editor.png)

## Activating the extension
For this extension to work properly there are a few steps that needs to be taken after installing:

- Activation is done through the Preview Feature "Auto State". This needs to be enabled for each Project this extension should be used in.
- Rules needs to be configured. The rule editor is found under `Project Settings > Extensions > Auto State`

### Limitations

- This extension does not work when doing mass updates
- The state **must** be updated from the work item form for the update to trigger
- The extension only updates state one level up (recursive updating is on the road map)
