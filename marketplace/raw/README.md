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

This extension aims to auto update parent workitems based on a set of rules when the child workitem is started.

![rule-editor](marketplace/docs/images/rule-editor.png)

## Activating the extension

For this extension to work properly there are a few steps that needs to be taken after installing:

- Activation is done through the Preview Feature "Auto State". This needs to be enabled for each Project this extension should be used in.
- Rules needs to be configured. The rule editor is found under `Project Settings > Extensions > Auto State`

![feature-toogle](marketplace/docs/images/feature-toggle.png)

### Limitations

- This extension does not work when doing mass updates
- The state **must** be updated from the work item form for the update to trigger
- The extension only updates state one level up (recursive updating is on the road map)

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact

If you have generic questions about the project or usage you can make contact in the following ways:

- Submit an issue over at GitHub with the `@type/question` label - [New Issue](https://github.com/joachimdalen/azdevops-auto-state/issues/new)
- Submit a new question under the Marketplace Q&A section.

<p align="right">(<a href="#top">back to top</a>)</p>
