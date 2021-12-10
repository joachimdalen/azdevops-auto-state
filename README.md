<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/joachimdalen/azdevops-auto-state">
    <img src="extension-icon.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">Auto State</h3>

  <p align="center">
    An extension to automatically update states between parents and children
    <br />
    <a href="https://github.com/joachimdalen/azdevops-auto-state"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://marketplace.visualstudio.com/items?itemName=joachimdalen.auto-state">View Extension</a>
    ·
    <a href="https://marketplace.visualstudio.com/items?itemName=joachimdalen.auto-state">Changelog</a>
    ·
    <a href="https://github.com/joachimdalen/azdevops-auto-state/issues">Report Bug</a>
    ·
    <a href="https://github.com/joachimdalen/azdevops-auto-state/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#limitations">Limitations</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

![Product Name Screen Shot][product-screenshot]

An issue I often face is forgetting to update the state of a parent workitem when starting a new Task. This extension aims to auto update parent workitems based on a set of rules when the child workitem is started.

### Limitations

- This extension does not work when doing mass updates
- The state **must** be updated from the work item form for the update to trigger
- The extension only updates state one level up (recursive updating is on the road map)

<p align="right">(<a href="#top">back to top</a>)</p>

## Post Install Activation

Auto State is hidden behind a feature flag for several reasons. After installing the extension a Project or Organization administrator will need to toggle the feature flag to `On`.

![Feature Toggle][feature-toggle-screenshot]

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

- A MarketPlace publisher [Create a publisher](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=azure-devops#create-a-publisher)
- `tfx-cli` installed. Due to issues with outdated dependencies this is not included in `package.json`

  ```sh
  npm install -g tfx-cli
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/joachimdalen/azdevops-auto-state.git
   ```
2. Install dependencies
   ```sh
   > npm install
   ```
3. Update publisher in `vss-extension-dev.json`
4. Compile development version
   ```sh
   npm run prepare:dev
   ```
5. [Publish extension](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=azure-devops#publish-an-extension)
6. [Share](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=azure-devops#share-an-extension) and [install](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=azure-devops#install-an-extension) extension
7. Run extension
   ```sh
   npm run serve:dev
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Recursive update of parent all the way to the root
- [ ] More advanced rule editor (check more fields)

See the [open issues](https://github.com/joachimdalen/azdevops-auto-state/issues?q=is%3Aopen+is%3Aissue+label%3A%40type%2Ffeature) for a full list of proposed features.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are welcome, both in the form of suggestions and code. Create

If you want to contribute code, I ask that you follow some guidelines.

- New and changed features should to the best ability be covered by tests
- Follow the branching policy:
  - `feature/` for new features
  - `bugfix/` for bug fixes
  - `docs/` for documentation changes
- If your change is related to an issue, use the id as the first part of the branch e.g `bugfix/12-fix-crash-when-updating-rule`
- Pull requests should target the `develop` branch

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

If you have generic questions about the project or usage you can make contact in the following ways:

- Submit an issue with the `@type/question` label - [New Issue](https://github.com/joachimdalen/azdevops-auto-state/issues/new)
- Submit a new question unser the Marketplace Q&A section.

<p align="right">(<a href="#top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/joachimdalen/azdevops-auto-state.svg?style=for-the-badge
[contributors-url]: https://github.com/joachimdalen/azdevops-auto-state/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/joachimdalen/azdevops-auto-state.svg?style=for-the-badge
[forks-url]: https://github.com/joachimdalen/azdevops-auto-state/network/members
[stars-shield]: https://img.shields.io/github/stars/joachimdalen/azdevops-auto-state.svg?style=for-the-badge
[stars-url]: https://github.com/joachimdalen/azdevops-auto-state/stargazers
[issues-shield]: https://img.shields.io/github/issues/joachimdalen/azdevops-auto-state.svg?style=for-the-badge
[issues-url]: https://github.com/joachimdalen/azdevops-auto-state/issues
[license-shield]: https://img.shields.io/github/license/joachimdalen/azdevops-auto-state.svg?style=for-the-badge
[license-url]: https://github.com/joachimdalen/azdevops-auto-state/blob/master/LICENSE.txt
[product-screenshot]: docs/images/rule-editor.png
[feature-toggle-screenshot]: docs/images/feature-toggle.png
