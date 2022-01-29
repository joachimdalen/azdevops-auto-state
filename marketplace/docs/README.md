<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
<h3 align="center">Auto State</h3>

  <p align="center">
    An extension to automatically update states between parents and children
    <br />
    <a href="https://github.com/joachimdalen/azdevops-auto-state"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://marketplace.visualstudio.com/items?itemName=joachimdalen.auto-state">View Extension</a>
    ·
    <a href="https://marketplace.visualstudio.com/items?itemName=joachimdalen.auto-state/changelog">Changelog</a>
    ·
    <a href="https://github.com/joachimdalen/azdevops-auto-state/issues">Report Bug</a>
    ·
    <a href="https://github.com/joachimdalen/azdevops-auto-state/issues">Request Feature</a>
  </p>
</div>

![rule-editor](marketplace/docs/images/rule-editor.png)

---

## ⚠️ Information about the `New Boards Hub` feature

This extension does not work if you have the `New Boards Hub` feature enabled. When this preview feature is enabled, certain contributions from this extension is not loaded. Microsoft says that they are "Optimizing" the feature, so all I can do is wait until this feature comes out of preview.

This issue is being tracked:

- [GitHub](https://github.com/joachimdalen/azdevops-auto-state/issues/17)
- [Developer Community](https://developercommunity.visualstudio.com/t/Extension-contribution-no-longer-loads-w/1631893)

---

## Features

- Create rules to manage state transitions
  - Ability to check that all child work items also matches rules
  - Ability to process rules from the current work item to the top of the tree
- Rule tester to see how rules work and what work items will be updated
- Get started easily by using preset rules. See [preset rules](https://github.com/joachimdalen/azdevops-auto-state/blob/master/docs/PRESETS.md)

## Activating the extension

For this extension to work properly there are a few steps that needs to be taken after installing:

- Activation is done through the Preview Feature "Auto State". This needs to be enabled for each Project this extension should be used in.
- Rules needs to be configured. The rule editor is found under `Project Settings > Extensions > Auto State`

![feature-toogle](marketplace/docs/images/feature-toggle.png)

### Usage

Documentation on rule usage can be found on [GitHub](https://github.com/joachimdalen/azdevops-auto-state/blob/master/docs/index.md)

### Limitations

- This extension does not work when doing mass updates
- The state **must** be updated from the work item form for the update to trigger

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact

If you have generic questions about the project or usage you can make contact in the following ways:

- Submit an issue over at GitHub with the `@type/question` label - [New Issue](https://github.com/joachimdalen/azdevops-auto-state/issues/new)
- Submit a new question under the Marketplace Q&A section.

<p align="right">(<a href="#top">back to top</a>)</p>
